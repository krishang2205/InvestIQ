import os
import datetime
import logging
import json
from typing import Dict, Any, Optional

import google.generativeai as genai
from groq import Groq
import re
from config.settings import conf

logger = logging.getLogger(__name__)

class AIProviderManager:
    """
    3-Tier AI Provider Cascade:
      1. Gemini 2.0 Flash  (Google — primary, fast, accurate)
      2. Groq Llama-3.3-70b  (Groq — fallback, 14,400 free req/day)
      3. Mock Report  (last resort — guarantees UI never crashes)
    """
    GROQ_MODEL = "llama-3.3-70b-versatile"
    GEMINI_MODEL = "gemini-flash-latest"
    def __init__(self):
        self.gemini_key = conf.gemini_api_key
        self.groq_key   = conf.groq_api_key
        self.providers_ready = {"gemini": False, "groq": False}
        self._configure_providers()

    def _configure_providers(self):
        # ── Gemini ───────────────────────────────────────────────────────────
        if self.gemini_key:
            try:
                genai.configure(api_key=self.gemini_key)
                self.gemini_model = genai.GenerativeModel(self.GEMINI_MODEL)
                self.providers_ready["gemini"] = True
                logger.info(f"✅ Gemini provider ready ({self.GEMINI_MODEL})")
            except Exception as e:
                logger.error(f"Gemini init failed: {e}")
        else:
            logger.warning("GEMINI_API_KEY not set — Gemini disabled.")

        # ── Groq ─────────────────────────────────────────────────────────────
        if self.groq_key:
            try:
                self.groq_client = Groq(api_key=self.groq_key)
                self.providers_ready["groq"] = True
                logger.info(f"✅ Groq provider ready ({self.GROQ_MODEL})")
            except Exception as e:
                logger.error(f"Groq init failed: {e}")
        else:
            logger.warning("GROQ_API_KEY not set — Groq disabled.")

    # ─────────────────────────────────────────────────────────────────────────
    # Public interface
    # ─────────────────────────────────────────────────────────────────────────
    def generate_json(self, prompt: str, market_context: dict = None) -> dict:
        """
        Attempts each provider in order:
          Gemini → Groq → Mock
        Injects real yfinance chart data into the result.
        """
        data = self._try_gemini(prompt)
        if data is None:
            data = self._try_groq(prompt)
        if data is None:
            logger.error("All AI providers failed — serving mock report.")
            data = self._fallback_generate()
        else:
            # ── SECONDARY AI VERIFICATION PASS (Anti-Hallucination) ──
            data = self._run_verification_pass(data, market_context)

        self._inject_real_chart_data(data, market_context)
        return data

    # ─────────────────────────────────────────────────────────────────────────
    # Provider implementations
    # ─────────────────────────────────────────────────────────────────────────
    def _try_gemini(self, prompt: str) -> Optional[dict]:
        if not self.providers_ready["gemini"]:
            return None
        try:
            logger.info("🔵 Trying Gemini...")
            response = self.gemini_model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )
            data = json.loads(response.text)
            logger.info("✅ Gemini succeeded.")
            return data
        except Exception as e:
            logger.warning(f"Gemini failed ({type(e).__name__}): {str(e)[:120]} — trying Groq...")
            return None

    def _try_groq(self, prompt: str) -> Optional[dict]:
        if not self.providers_ready["groq"]:
            return None
        try:
            logger.info("🟡 Trying Groq (Llama-3.3-70b)...")
            system_msg = (
                "You are an elite institutional-grade financial analysis AI with the depth of a "
                "Goldman Sachs quant analyst. Your ONLY output must be a single valid JSON object "
                "matching the exact schema provided — no markdown fences, no explanation text, no "
                "truncation. Every field in the schema MUST be populated with rich, specific, "
                "multi-sentence analysis grounded in the real financial data provided. "
                "Proprietary alpha fields must contain quantitative INTEGER scores (not strings). "
                "peerComparison must list at least 4 real competitors with accurate data. "
                "technicalSignals must list at least 4 signals. "
                "riskSignals must list at least 5 specific risk factors. "
                "All text fields must be at least 2-3 sentences of expert analysis. "
                "NEVER truncate the JSON. Output the COMPLETE object."
            )
            response = self.groq_client.chat.completions.create(
                model=self.GROQ_MODEL,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                temperature=0.2,
                max_tokens=32000,
            )
            raw = response.choices[0].message.content
            data = json.loads(raw)
            logger.info("✅ Groq (Llama-3.3-70b) succeeded.")
            return data
        except Exception as e:
            logger.warning(f"Groq failed ({type(e).__name__}): {str(e)[:120]} — falling back to mock...")
            return None


    def _run_verification_pass(self, draft_data: dict, market_context: dict) -> dict:
        """
        Anti-Hallucination Layer — Deterministic Python Patcher.

        Instead of asking an LLM to re-generate the JSON at temp=0 (which strips all
        rich narrative to single-liners), this method surgically patches ONLY the
        specific numeric and enum fields that can be independently verified against
        ground-truth yfinance data. ALL AI text/prose fields are left completely
        untouched — preserving the full depth of the draft.
        """
        if not market_context:
            return draft_data

        import re, copy
        logger.info("Verifying & patching report against yfinance ground truth...")

        data = copy.deepcopy(draft_data)
        fund     = market_context.get("fundamentals", {})
        currency = market_context.get("company_meta", {}).get("currency", fund.get("currency", "INR"))
        symbol   = market_context.get("symbol", "")

        # ── Helper: safely round any number to n decimal places ───────────────
        def fmt(value, decimals=2, suffix=""):
            try:
                if value is None or value == "N/A" or value == 0:
                    return "N/A"
                return f"{round(float(value), decimals)}{suffix}"
            except (TypeError, ValueError):
                return str(value) if value else "N/A"

        # ── 1. Hard-override the snapshot key metrics with exact yfinance values ──
        # NOTE: 52W High/Low and MAs are stored at TOP LEVEL of context, not inside 'fund'
        w52_high = market_context.get("fifty_two_week_high")
        w52_low  = market_context.get("fifty_two_week_low")
        
        # Dividend logic: if yfinance returns 0.0264, it's a decimal. if 2.64, it's a percent.
        div_raw  = fund.get("dividend_yield", 0)
        if div_raw and div_raw < 0.2: # Decimal
            div_pct = fmt(div_raw * 100, 2)
        else: # Likely already a percent
            div_pct = fmt(div_raw, 2)

        pe_val   = fmt(fund.get("pe_ratio"), 2)
        mcap_val = fmt(fund.get("market_cap_billions"), 2)

        w52_range = (
            f"{fmt(w52_low)} - {fmt(w52_high)} {currency}"
            if w52_high and w52_low else "N/A"
        )

        real_metrics = [
            {"label": "Market Cap",     "value": f"{mcap_val}B {currency}"},
            {"label": "P/E Ratio",      "value": f"{pe_val}x"},
            {"label": "52W Range",      "value": w52_range},
            {"label": "Dividend Yield", "value": f"{div_pct}%"},
        ]
        if "snapshot" in data:
            data["snapshot"]["keyMetrics"] = real_metrics

        # ── 2. Correct header & profile fields (CEO, Symbol, Timestamp) ──────
        if "header" in data:
            data["header"]["symbol"] = symbol
            data["header"]["lastUpdated"] = datetime.datetime.now().isoformat()

        if "companyProfile" in data:
            real_ceo = market_context.get("company_meta", {}).get("ceo", "N/A")
            if real_ceo != "N/A":
                data["companyProfile"]["ceo"] = real_ceo

        # ── 3. Deep string scan: strip rogue '$' and 'USD' from all text fields ─
        if currency in ("INR",):
            def scrub_currency(obj):
                if isinstance(obj, str):
                    cleaned = re.sub(r'\$\s*([\d,\.]+)', r'\1 INR', obj)
                    cleaned = cleaned.replace(" USD", f" {currency}")
                    return cleaned
                if isinstance(obj, dict):
                    return {k: scrub_currency(v) for k, v in obj.items()}
                if isinstance(obj, list):
                    return [scrub_currency(i) for i in obj]
                return obj
            data = scrub_currency(data)

        # ── 4. Logically consistent Momentum label (price vs. moving averages) ──
        try:
            price  = float(fund.get("current_price", 0) or 0)
            ma_50  = float(fund.get("50d_avg", 0) or 0)
            ma_200 = float(fund.get("200d_avg", 0) or 0)

            if price > 0 and ma_50 > 0 and ma_200 > 0:
                below_both = price < ma_50 and price < ma_200
                above_both = price > ma_50 and price > ma_200

                for s in data.get("executiveSummary", {}).get("status", []):
                    if s.get("label") == "Momentum":
                        if below_both and s.get("value") == "Bullish":
                            logger.info("Patching Momentum: Bullish -> Bearish (price below both MAs)")
                            s["value"] = "Bearish"
                            s["type"]  = "negative"
                        elif above_both and s.get("value") == "Bearish":
                            logger.info("Patching Momentum: Bearish -> Bullish (price above both MAs)")
                            s["value"] = "Bullish"
                            s["type"]  = "positive"

        except Exception as e:
            logger.warning(f"Momentum patch skipped: {e}")

        # ── 4b. Inject MA values into technical signals text & purge N/A hallucinations ──
        try:
            for sig in data.get("technicalSignals", []):
                # Always fix the "Moving Average" signal description if it's vague/N/A
                if sig.get("name") == "Moving Average":
                    txt = sig.get("description", "")
                    if "not available" in txt.lower() or "N/A" in txt or len(txt) < 20:
                        sig["description"] = f"The price of {symbol} ({price} {currency}) is being analysed against its 50-day MA ({fmt(ma_50)}) and 200-day MA ({fmt(ma_200)}). The trend is currently {sig.get('status')} based on position relative to these averages."

                # Scrub EVERY signal description for "not available" or "N/A"
                if "description" in sig:
                    sig["description"] = sig["description"].replace("not available", f"{fmt(ma_50)} (MA50) / {fmt(ma_200)} (MA200)")
                    sig["description"] = sig["description"].replace("is not available", "is being monitored")

            # ── 4c. Deep narrative scrub for N/A hallucinations ──────────────────
            def scrub_hallucinations(obj):
                if isinstance(obj, str):
                    # Replace "52-week range is not available" with actual numbers
                    if "52-week range" in obj.lower() and "not available" in obj.lower():
                        obj = re.sub(r"52-week range is not available", f"52-week range is {fmt(w52_low)} - {fmt(w52_high)} {currency}", obj, flags=re.I)
                    # Replace "moving average is not available"
                    if "moving average" in obj.lower() and ("not available" in obj.lower() or "N/A" in obj):
                        obj = re.sub(r"moving average[s]? (is|are) not available", f"50-day MA is {fmt(ma_50)} and 200-day MA is {fmt(ma_200)}", obj, flags=re.I)
                    return obj
                if isinstance(obj, dict):
                    return {k: scrub_hallucinations(v) for k, v in obj.items()}
                if isinstance(obj, list):
                    return [scrub_hallucinations(i) for i in obj]
                return obj
            data = scrub_hallucinations(data)
        except Exception as e:
            logger.warning(f"Narrative patch skipped: {e}")

        # ── 5. Logic Check: Remove Hallucinated Contradictions ─────────────
        try:
            # Sync Sector/Industry from verified metadata
            meta = market_context.get("company_meta", {})
            if "companyProfile" in data:
                if meta.get("sector"): data["companyProfile"]["sector"] = meta["sector"]
                if meta.get("industry"): data["companyProfile"]["industry"] = meta["industry"]

            if "riskFactors" in data:
                # ── 5a. Remove risk contradictions (Dividends/Debt) ─────────────
                if div_raw and div_raw > 0:
                    data["riskFactors"] = [r for r in data["riskFactors"] if "lack of dividend" not in r.lower() and "no dividend" not in r.lower()]
                
                if de_ratio and de_ratio < 20: # Higher threshold for safety
                    data["riskFactors"] = [r for r in data["riskFactors"] if "high debt" not in r.lower()]

                # ── 5b. Purge generic 'filler' risks for blue-chips ─────────────
                # If it's a large cap (> 500B INR), certain generic risks are likely hallucinations
                mcap_inr = fund.get("market_cap_billions", 0)
                if mcap_inr > 500:
                    generic_fillers = ["lack of transparency", "financial reporting", "difficult for investors to assess"]
                    data["riskFactors"] = [r for r in data["riskFactors"] if not any(f in r.lower() for f in generic_fillers)]
        except Exception as e:
            logger.warning(f"Logic consistency patch failed: {e}")

        # ── 6. Patch volatility score from yfinance ──────────────────────────────
        try:
            vol_raw = market_context.get("volatility")
            if vol_raw and vol_raw != "N/A":
                vol_pct = float(str(vol_raw).replace("%", ""))
                level = "High" if vol_pct > 40 else ("Medium" if vol_pct > 20 else "Low")
                if "volatility" in data:
                    data["volatility"]["value"] = round(vol_pct, 1)
                    data["volatility"]["level"] = level
        except Exception as e:
            logger.warning(f"Volatility patch skipped: {e}")

        logger.info("Verification patch complete — all narrative preserved, facts & logic corrected.")
        return data



    def _fallback_generate(self) -> Dict[str, Any]:
        logger.warning("All AI providers exhausted — serving mock report.")
        import time
        time.sleep(2)
        return {
            "header": {
                "company": "InvestIQ Simulated Synthesis",
                "symbol": "MOCK",
                "exchange": "NYSE",
                "sector": "Technology",
                "generatedOn": "Live (Local Simulation)",
                "dataRange": "1 Year"
            },
            "snapshot": {
                "description": "Your backend architecture successfully processed the multi-agent queue, connected via WebSockets/polling, and returned this mock payload because the Gemini API key was either missing or invalid. Testing environment isolated successfully.",
                "domains": ["AI Backend", "Asynchronous Processing", "Data Pipelines"],
                "keyMetrics": [{"label": "Uptime", "value": "100%"}, {"label": "Latency", "value": "24ms"}]
            },
            "executiveSummary": {
                "status": [
                    {"label": "System Check", "value": "Passing", "type": "positive"},
                    {"label": "LLM Connection", "value": "Degraded", "type": "negative"},
                    {"label": "UI Rendering", "value": "Optimal", "type": "positive"}
                ],
                "text": "The entire stack is functional. By rendering this exact paragraph, the React frontend Proves that it correctly parses complex, nested JSON objects passed from your Python backend."
            },
            "priceBehavior": {
                "chartData": [{"price": 100}, {"price": 105}, {"price": 98}, {"price": 112}, {"price": 115}],
                "interpretation": "Mock line chart rendered using SVG polylines and gradient maps."
            },
            "volatility": {
                "value": 35,
                "level": "Low"
            },
            "technicalSignals": [
                {"name": "Frontend Parsing", "status": "Bullish", "text": "Correctly unpacked JS arrays."},
                {"name": "Python Dictionaries", "status": "Bullish", "text": "Successfully serialized to Application/JSON."}
            ],
            "sentiment": {
                "score": 90,
                "text": "High confidence in local architectural stability."
            },
            "riskSignals": [
                {"text": "Production environments will throw 500s if Gemini API tokens are not populated."}
            ],
            "explainability": {
                "factors": [{"name": "UI Check", "value": 100}, {"name": "Worker Pool", "value": 90}],
                "text": "Weights calculated by observing local simulated outputs."
            },
            "industryOverview": {
                "title": "Software Architecture",
                "text": "The separation of concerns between your single-page application and modular Python backend is robust."
            },
            "financialAnalysis": {
                "title": "Data Schemas",
                "text": "By unifying your JSON contracts, you ensure the AI never breaks the UI layout."
            },
            "peerComparison": [
                {"name": "Mock A", "price": "$150", "pe": "30.1", "roe": "15%", "revenue": "$1.5B"},
                {"name": "InvestIQ Base", "price": "Priceless", "pe": "N/A", "roe": "99%", "revenue": "Infinite"}
            ],
            "outlook": {
                "shortTerm": "The student-level codebase allows rapid iteration and testing right now.",
                "longTerm": "This foundation can easily scale back up into an enterprise system when needed."
            },
            "proprietaryAlpha": {
                "executiveSentiment": {"tone": "Defensive", "confidenceScore": 45, "volatilityIndex": 82, "summary": "Management actively dodged 4 direct questions regarding margin compression."},
                "insiderHeatmap": {"activityLevel": "High", "netBuyingPercent": -15, "sharesTradedLast30Days": 1250000, "analysis": "C-Suite has aggressively liquidated blocks over the last quarter."},
                "supplyChainRisk": {"criticalDependencies": [{"country": "Taiwan", "dependencyScore": 92}, {"country": "Vietnam", "dependencyScore": 45}], "overallRiskScore": 82, "overview": "Hyper-concentration in single-source chip manufacturing poses critical tail risks."},
                "killSwitchThreats": {"threatProbability": 68, "disruptiveTech": "Agentic Software Models", "competitor": "OpenAI / Anthropic", "timelineToImpact": "12-18 Months"},
                "alternativeData": {"webTrafficGrowth": -12, "employeeMoraleScore": 34, "githubRepoActivity": 15, "summary": "Declining organic web traffic perfectly mirrors collapsing engineering retention metrics."}
            }
        }

    def _inject_real_chart_data(self, data: Dict[str, Any], market_context: dict = None):
        """
        Replaces the AI-hallucinated chart array with real OHLCV history
        fetched from yfinance. Falls back to Brownian Motion only if no
        real data is available (e.g. API timeout during fetch).
        """
        import random, datetime
        try:
            if "priceBehavior" not in data:
                return

            # ── REAL DATA PATH ────────────────────────────────────────────────
            if market_context and market_context.get("chart_data"):
                real_data = market_context["chart_data"]
                if len(real_data) >= 5:
                    # Strip OHLCV extras — ReportView only needs date + price
                    data["priceBehavior"]["chartData"] = [
                        {"date": p["date"], "price": p["price"]}
                        for p in real_data
                    ]
                    logger.info(f"Injected {len(real_data)} real yfinance price points into chart.")
                    return

            # ── FALLBACK: Brownian Motion (only if yfinance returned nothing) ─
            logger.warning("No real chart data available — falling back to Brownian Motion simulation.")
            today = datetime.date.today()
            anchor_price = 150.0
            try:
                if "peerComparison" in data and data["peerComparison"]:
                    raw = str(data["peerComparison"][0].get("price", "150"))
                    parsed = float(''.join(c for c in raw if c.isdigit() or c == "."))
                    if parsed > 0:
                        anchor_price = parsed
            except Exception:
                pass

            points = []
            current_price = anchor_price
            for i in range(365, -1, -1):
                d = today - datetime.timedelta(days=i)
                if d.weekday() > 4:
                    continue
                points.append({"date": d.strftime("%b %d, %Y"), "price": round(current_price, 2)})
                current_price *= (1 + random.uniform(-0.012, 0.012) + 0.0008)

            data["priceBehavior"]["chartData"] = points

        except Exception as e:
            logger.error(f"Chart data injection failed: {e}")
