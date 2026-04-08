import os
import datetime
import logging
import json
from typing import Dict, Any, Optional
import time

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
    GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
    GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
    XAI_MODEL = os.getenv("XAI_MODEL", "grok-2-latest")

    def __init__(self):
        self.gemini_key = conf.gemini_api_key
        self.groq_key   = conf.groq_api_key
        # Detect if Groq key is actually an xAI key
        self.xai_key    = conf.xai_api_key or (self.groq_key if self.groq_key and self.groq_key.startswith("xai-") else None)
        # Tune Gemini for low-latency report generation by default.
        self.gemini_timeout_sec = int(os.getenv("GEMINI_TIMEOUT_SEC", "12"))
        self.gemini_max_output_tokens = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "2048"))
        self.gemini_retry_on_invalid_json = os.getenv("GEMINI_RETRY_ON_INVALID_JSON", "false").lower() in ("1", "true", "yes", "on")
        self.gemini_max_retries = int(os.getenv("GEMINI_MAX_RETRIES", "3"))
        self.gemini_cooldown_sec = int(os.getenv("GEMINI_COOLDOWN_SEC", "180"))
        self.gemini_cooldown_until = 0.0
        self.gemini_only = os.getenv("GEMINI_ONLY", "false").lower() in ("1", "true", "yes", "on")
        self.providers_ready = {"gemini": False, "groq": False, "xai": False}
        self.gemini_candidates = []
        self.groq_candidates = []
        self._configure_providers()

    def _configure_providers(self):
        # ── Gemini ───────────────────────────────────────────────────────────
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            # Some model aliases differ by account/SDK version. Try a compatible list.
            candidates = [
                self.GEMINI_MODEL,
                "gemini-flash-latest",
                "gemini-2.0-flash",
                "gemini-1.5-flash-latest",
                "gemini-1.5-flash-8b",
                "gemini-3.1-flash-lite",
                "gemini-3.1-flash-lite-preview",
                "gemini-2.5-flash-lite",
                "gemini-2.0-flash-lite",
            ]
            seen = set()
            self.gemini_candidates = []
            for model_name in candidates:
                if not model_name or model_name in seen:
                    continue
                seen.add(model_name)
                self.gemini_candidates.append(model_name)
                try:
                    self.gemini_model = genai.GenerativeModel(model_name)
                    self.providers_ready["gemini"] = True
                    self.GEMINI_MODEL = model_name
                    logger.info(f"✅ Gemini provider ready ({model_name})")
                    break
                except Exception as e:
                    logger.warning(f"Gemini model unavailable ({model_name}): {e}")
            if not self.providers_ready["gemini"]:
                logger.error("Gemini init failed: no compatible Gemini model available for current API key/account.")

        # ── Groq ─────────────────────────────────────────────────────────────
        if self.groq_key and not self.groq_key.startswith("xai-"):
            try:
                self.groq_client = Groq(api_key=self.groq_key)
                self.groq_candidates = []
                for model_name in [
                    self.GROQ_MODEL,
                    "llama-3.1-8b-instant",
                    "llama-3.3-70b-versatile",
                ]:
                    if model_name and model_name not in self.groq_candidates:
                        self.groq_candidates.append(model_name)
                self.providers_ready["groq"] = True
                logger.info(f"✅ Groq provider ready ({self.groq_candidates[0]})")
            except Exception as e:
                logger.error(f"Groq init failed: {e}")

        # ── xAI (OpenAI Compatible) ──────────────────────────────────────────
        if self.xai_key:
            try:
                from openai import OpenAI
                self.xai_client = OpenAI(
                    api_key=self.xai_key,
                    base_url="https://api.x.ai/v1",
                )
                self.providers_ready["xai"] = True
                logger.info(f"✅ xAI provider ready ({self.XAI_MODEL})")
            except Exception as e:
                logger.error(f"xAI init failed: {e}")

    def _switch_to_next_gemini_model(self) -> bool:
        """Rotate to next configured Gemini candidate after runtime model errors."""
        if not self.gemini_candidates:
            return False
        current = self.GEMINI_MODEL
        try:
            current_idx = self.gemini_candidates.index(current)
        except ValueError:
            current_idx = -1
        for next_name in self.gemini_candidates[current_idx + 1:]:
            try:
                self.gemini_model = genai.GenerativeModel(next_name)
                self.GEMINI_MODEL = next_name
                logger.warning(f"Switched Gemini runtime model to {next_name}")
                return True
            except Exception as e:
                logger.warning(f"Gemini runtime switch failed ({next_name}): {e}")
        return False

    # ─────────────────────────────────────────────────────────────────────────
    # Public interface
    # ─────────────────────────────────────────────────────────────────────────
    def generate_json(self, prompt: str, market_context: dict = None) -> dict:
        """
        Attempts each provider in order:
          Gemini → Groq → xAI → Mock
        """
        data = None
        if self._gemini_available_now():
            data = self._try_gemini(prompt)

        if data is None and not self.gemini_only:
            data = self._try_groq(prompt)
            
        if data is None and not self.gemini_only:
            data = self._try_xai(prompt, is_json=True)
            
        if data is None:
            logger.error("All AI providers (Gemini, Groq, xAI) failed — serving mock report.")
            data = self._fallback_generate()
        else:
            # ── SECONDARY AI VERIFICATION PASS (Anti-Hallucination) ──
            data = self._run_verification_pass(data, market_context)

        self._inject_real_chart_data(data, market_context)
        return data

    def _gemini_available_now(self) -> bool:
        """Skip Gemini while cooldown is active after recent 429/timeout failures."""
        if not self.providers_ready["gemini"]:
            return False
        now = time.time()
        if now < self.gemini_cooldown_until:
            remaining = int(self.gemini_cooldown_until - now)
            logger.info(f"Skipping Gemini due to cooldown ({remaining}s remaining).")
            return False
        return True

    def generate_text(self, system_prompt: str, user_message: str, history: list = None) -> str:
        """
        Generates a plain text response for a chat interface.
        """
        # Try Gemini first
        if self.providers_ready["gemini"]:
            try:
                # Format history for Gemini
                # Gemini expects [{"role": "user"|"model", "parts": [...]}]
                gemini_history = []
                if history:
                    for h in history:
                        role = "user" if h["role"] == "user" else "model"
                        gemini_history.append({"role": role, "parts": [h["content"]]})
                
                chat = self.gemini_model.start_chat(history=gemini_history)
                # Combine system prompt with user message for simpler stateless call or use system_instruction if available
                full_prompt = f"{system_prompt}\n\nUser Question: {user_message}"
                response = chat.send_message(full_prompt)
                return response.text
            except Exception as e:
                logger.warning(f"Gemini text gen failed: {e}")

        # Try Groq as fallback (try all candidate models)
        if self.providers_ready["groq"]:
            for model_name in (self.groq_candidates or [self.GROQ_MODEL]):
                try:
                    # Truncate system prompt to ~4000 chars to fit smaller models
                    truncated_prompt = system_prompt[:4000] if len(system_prompt) > 4000 else system_prompt
                    messages = [{"role": "system", "content": truncated_prompt}]
                    if history:
                        # Only keep last 4 messages to save tokens
                        messages.extend(history[-4:])
                    messages.append({"role": "user", "content": user_message})
                    
                    response = self.groq_client.chat.completions.create(
                        model=model_name,
                        messages=messages,
                        temperature=0.7,
                    )
                    return response.choices[0].message.content
                except Exception as e:
                    logger.warning(f"Groq text gen failed ({model_name}): {e}")

        # Final fallback
        return "I'm sorry, I'm having trouble connecting to my brain right now. Please try again in a moment."

    # ─────────────────────────────────────────────────────────────────────────
    # Provider implementations
    # ─────────────────────────────────────────────────────────────────────────
    def _try_gemini(self, prompt: str) -> Optional[dict]:
        if not self.providers_ready["gemini"]:
            return None
        started = time.time()
        try:
            logger.info("🔵 Trying Gemini...")
            generation_config = genai.GenerationConfig(
                response_mime_type="application/json",
                temperature=0.0,
                max_output_tokens=self.gemini_max_output_tokens,
            )
            if self.gemini_timeout_sec > 0:
                response = self.gemini_model.generate_content(
                    prompt,
                    generation_config=generation_config,
                    request_options={"timeout": self.gemini_timeout_sec},
                )
            else:
                response = self.gemini_model.generate_content(
                    prompt,
                    generation_config=generation_config,
                )

            data = self._parse_json_response(self._extract_gemini_text(response))
            logger.info(f"✅ Gemini succeeded in {time.time() - started:.2f}s.")
            return data
        except Exception as e:
            msg = str(e).lower()
            if "429" in msg or "quota" in msg:
                logger.error("🔴 Gemini Rate Limit/Quota Reached (429) — triggering instant failover.")
                self.gemini_cooldown_until = time.time() + self.gemini_cooldown_sec
            elif "notfound" in msg or "model not found" in msg or "is not found for api version" in msg:
                logger.warning(f"Gemini model unsupported at runtime ({self.GEMINI_MODEL}); rotating candidate list.")
                if self._switch_to_next_gemini_model():
                    try:
                        retry_cfg = genai.GenerationConfig(
                            response_mime_type="application/json",
                            temperature=0.0,
                            max_output_tokens=self.gemini_max_output_tokens,
                        )
                        if self.gemini_timeout_sec > 0:
                            response = self.gemini_model.generate_content(
                                prompt,
                                generation_config=retry_cfg,
                                request_options={"timeout": self.gemini_timeout_sec},
                            )
                        else:
                            response = self.gemini_model.generate_content(
                                prompt,
                                generation_config=retry_cfg,
                            )
                        data = self._parse_json_response(self._extract_gemini_text(response))
                        logger.info(f"✅ Gemini succeeded after runtime model switch in {time.time() - started:.2f}s.")
                        return data
                    except Exception as retry_err:
                        logger.warning(f"Gemini runtime-switch retry failed ({type(retry_err).__name__}): {str(retry_err)[:120]} — trying fallbacks...")
            elif "deadline" in msg or "timeout" in msg or "504" in msg:
                logger.warning("Gemini timeout/deadline error from upstream — trying fallback providers.")
                self.gemini_cooldown_until = time.time() + self.gemini_cooldown_sec
                # Permanent reliability path: retry with SAME prompt and increasing timeout.
                for attempt in range(1, max(self.gemini_max_retries, 1) + 1):
                    try:
                        retry_timeout = max(self.gemini_timeout_sec + (attempt * 10), 20)
                        logger.warning(f"Gemini timeout recovery attempt {attempt}/{self.gemini_max_retries} (timeout={retry_timeout}s)")
                        retry_response = self.gemini_model.generate_content(
                            prompt,
                            generation_config=genai.GenerationConfig(
                                response_mime_type="application/json",
                                temperature=0.0,
                                max_output_tokens=self.gemini_max_output_tokens,
                            ),
                            request_options={"timeout": retry_timeout},
                        )
                        data = self._parse_json_response(self._extract_gemini_text(retry_response))
                        logger.info(f"✅ Gemini timeout recovery succeeded in {time.time() - started:.2f}s.")
                        return data
                    except Exception as retry_err:
                        logger.warning(f"Gemini timeout recovery failed ({type(retry_err).__name__}): {str(retry_err)[:120]}")
            elif isinstance(e, json.JSONDecodeError) and self.gemini_retry_on_invalid_json:
                logger.warning("Gemini returned malformed JSON — retrying Gemini once...")
                try:
                    boosted_tokens = min(8192, max(self.gemini_max_output_tokens + 1024, int(self.gemini_max_output_tokens * 1.75)))
                    for attempt in range(1, max(self.gemini_max_retries, 1) + 1):
                        retry_timeout = max(self.gemini_timeout_sec + (attempt * 5), 20)
                        retry_response = self.gemini_model.generate_content(
                            prompt,
                            generation_config=genai.GenerationConfig(
                                response_mime_type="application/json",
                                temperature=0.0,
                                max_output_tokens=boosted_tokens,
                            ),
                            request_options={"timeout": retry_timeout},
                        )
                        data = self._parse_json_response(self._extract_gemini_text(retry_response))
                        logger.info(f"✅ Gemini JSON recovery succeeded in {time.time() - started:.2f}s (attempt {attempt}).")
                        return data
                except Exception as retry_err:
                    logger.warning(f"Gemini retry failed ({type(retry_err).__name__}): {str(retry_err)[:120]} — trying fallbacks...")
            elif isinstance(e, json.JSONDecodeError):
                logger.warning("Gemini returned malformed JSON — retry disabled, trying fallback providers.")
            else:
                logger.warning(f"Gemini failed ({type(e).__name__}): {str(e)[:120]} — trying fallbacks...")
            return None

    def _extract_gemini_text(self, response: Any) -> str:
        """Extract text safely from Gemini response variants."""
        text = getattr(response, "text", None)
        if text:
            return text
        candidates = getattr(response, "candidates", None) or []
        for candidate in candidates:
            content = getattr(candidate, "content", None)
            parts = getattr(content, "parts", None) or []
            chunk = []
            for part in parts:
                ptxt = getattr(part, "text", None)
                if ptxt:
                    chunk.append(ptxt)
            if chunk:
                return "\n".join(chunk)
        return ""

    def _parse_json_response(self, raw_text: str) -> dict:
        """
        Parses JSON defensively from LLM output:
        - handles markdown code fences
        - extracts first balanced JSON object if extra text exists
        """
        text = (raw_text or "").strip()
        if not text:
            raise json.JSONDecodeError("Empty model response text", raw_text or "", 0)
        if text.startswith("```"):
            if "```json" in text:
                text = text.split("```json", 1)[1]
            else:
                text = text.split("```", 1)[1]
            text = text.split("```", 1)[0].strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        start = text.find("{")
        if start == -1:
            raise json.JSONDecodeError("No JSON object start found", text, 0)

        depth = 0
        in_string = False
        escaped = False
        end = -1
        for i in range(start, len(text)):
            ch = text[i]
            if in_string:
                if escaped:
                    escaped = False
                elif ch == "\\":
                    escaped = True
                elif ch == "\"":
                    in_string = False
                continue

            if ch == "\"":
                in_string = True
            elif ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    end = i + 1
                    break

        if end == -1:
            raise json.JSONDecodeError("No balanced JSON object found", text, 0)

        return json.loads(text[start:end])

    def _try_groq(self, prompt: str) -> Optional[dict]:
        if not self.providers_ready["groq"]:
            return None
        system_msg = (
            "You are an elite institutional-grade financial analysis AI. Your ONLY output must be a single valid JSON object "
            "matching the exact schema provided — no markdown fences, no explanation text."
        )
        for model_name in (self.groq_candidates or [self.GROQ_MODEL]):
            try:
                logger.info(f"🟡 Trying Groq ({model_name})...")
                response = self.groq_client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": system_msg},
                        {"role": "user", "content": prompt}
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                )
                raw = response.choices[0].message.content
                data = json.loads(raw)
                logger.info(f"✅ Groq succeeded ({model_name}).")
                return data
            except Exception as e:
                logger.warning(f"Groq failed ({model_name}): {str(e)[:120]} — trying next Groq model if available...")
        return None

    def _try_xai(self, prompt: str, is_json: bool = False) -> Optional[dict]:
        if not self.providers_ready["xai"]:
            return None
        try:
            logger.info(f"🟢 Trying xAI ({self.XAI_MODEL})...")
            system_msg = "You are a financial analyst. "
            if is_json:
                system_msg += "Your ONLY output must be a single valid JSON object matching the requested schema."
            
            response = self.xai_client.chat.completions.create(
                model=self.XAI_MODEL,
                messages=[
                    {"role": "system", "content": system_msg},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,
            )
            raw = response.choices[0].message.content
            
            if is_json:
                # Basic JSON extraction
                if "```json" in raw:
                    raw = raw.split("```json")[1].split("```")[0].strip()
                elif "```" in raw:
                    raw = raw.split("```")[1].split("```")[0].strip()
                
                data = json.loads(raw)
                logger.info("✅ xAI succeeded.")
                return data
            
            return raw # String response
        except Exception as e:
            err = str(e)
            if "doesn't have any credits or licenses" in err.lower() or "does not have permission" in err.lower() or "403" in err:
                # Avoid wasting time on subsequent jobs when account cannot call xAI.
                self.providers_ready["xai"] = False
                logger.error("xAI disabled for this process: account has no credits/licenses or lacks permissions.")
            logger.warning(f"xAI failed: {err[:120]}")
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

        # ── 7. Schema Integrity: Ensure all required top-level keys exist ────────
        required_keys = {
            "header": {},
            "snapshot": {"description": "", "domains": [], "keyMetrics": []},
            "executiveSummary": {"status": [], "text": ""},
            "priceBehavior": {"chartData": [], "interpretation": ""},
            "volatility": {"value": 0, "level": "Medium"},
            "technicalSignals": [],
            "sentiment": {"score": 50, "text": ""},
            "riskSignals": [],
            "explainability": {"factors": [], "text": ""},
            "industryOverview": {"title": "Industry Overview", "text": ""},
            "financialAnalysis": {"title": "Financial Analysis", "text": ""},
            "peerComparison": [],
            "aiAlphaInsights": [],
            "outlook": {"shortTerm": "Tactical analysis pending.", "longTerm": "Structural analysis pending."}
        }
        
        for key, default in required_keys.items():
            if key not in data or data[key] is None:
                logger.warning(f"Schema Integrity: Missing/null key '{key}' in LLM response. Patching with default.")
                data[key] = default

        logger.info("Verification patch complete — all narrative preserved, facts & logic corrected.")
        return data



    def _fallback_generate(self) -> Dict[str, Any]:
        logger.warning("All AI providers exhausted — serving mock report.")
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
            
            # ── INTRADAY REAL DATA (1D Graph) ─────────────────────────────────
            if market_context and market_context.get("intraday_data"):
                intraday = market_context["intraday_data"]
                if len(intraday) >= 2:
                    data["priceBehavior"]["intradayData"] = intraday
                    logger.info(f"Injected {len(intraday)} real intraday price points.")

            if "chartData" in data.get("priceBehavior", {}):
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
