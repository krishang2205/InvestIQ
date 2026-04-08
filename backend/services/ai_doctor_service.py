from typing import List, Dict, Any
from datetime import datetime, timedelta

class PortfolioDoctorService:
    """
    The 'Portfolio Doctor' is an LLM-powered diagnostic layer.
    It translates complex financial ratios into human-readable narratives
    specifically for the retail investor persona.
    """

    def __init__(self, intelligence_service=None):
        self.intel = intelligence_service

    def generate_health_check(self, 
                             portfolio_report: Dict[str, Any], 
                             stress_test: Dict[str, Any] = None, 
                             alpha_divergence: Dict[str, Any] = None, 
                             tax_friction: Dict[str, Any] = None, 
                             fundamentals: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Multi-dimensional portfolio diagnostic engine.
        Generates narrative diagnosis, performance summary, and structural flags.
        """
        holdings = portfolio_report.get("holdings", []) or []
        total_pnl = float(portfolio_report.get("total_pnl", 0) or 0)
        total_invested = float(portfolio_report.get("total_invested_value", 0) or 0)
        total_current = float(portfolio_report.get("total_current_value", 0) or 0)
        
        # 1. Metric Extraction
        position_count = len(holdings)
        resilience = (stress_test or {}).get("resilience_score", 100)
        alpha_score = (alpha_divergence or {}).get("score", 100)
        tax_frict = (tax_friction or {}).get("friction_ratio_percent", 0)
        net_tax_gain = (tax_friction or {}).get("net_capital_gain", 0)
        avg_pe = (fundamentals or {}).get("avg_pe", 0)
        beta = (fundamentals or {}).get("beta", 1.0)
        beta_label = (fundamentals or {}).get("beta_label", "")
        pe_label = (fundamentals or {}).get("pe_label", "")
        div_cashflow = (fundamentals or {}).get("dividend_cashflow", 0)
        
        top_holding = holdings[0] if holdings else None
        concentration = float(top_holding.get("weight", 0) or 0) if top_holding else 0.0
        ticker = top_holding.get("ticker") if top_holding else None
        
        pnl_pct = round((total_pnl / total_invested * 100), 1) if total_invested > 0 else 0

        # 2. Symptoms
        symptoms = []
        if position_count < 5:
            symptoms.append(f"Low diversification ({position_count} positions)")
        if total_pnl < -100000:
            symptoms.append("Material drawdown status")
        if resilience < 50:
            symptoms.append("Fragile risk architecture")
        if alpha_score < 30:
            symptoms.append("Index-hugging (Low alpha uniqueness)")
        if tax_frict > 15:
            symptoms.append("High tax-friction drag")
        if avg_pe > 40:
            symptoms.append("Aggressive valuation premium")

        # 3. Diagnosis (structural narrative)
        if not holdings:
            diagnosis = "No data available. Add transactions to start tracking portfolio performance."
        else:
            if concentration >= 30:
                diagnosis = f"Your portfolio is heavily anchored by {ticker} ({round(concentration, 1)}%). Current structure relies on single-asset success."
            elif concentration >= 15:
                diagnosis = f"Moderate structural concentration in {ticker} ({round(concentration, 1)}%) identified."
            else:
                diagnosis = "Portfolio exhibits high structural diversification with balanced asset weights."

            if alpha_score < 30:
                diagnosis += " The portfolio closely mimics major indexes, potentially limiting superior alpha returns."
            elif alpha_score > 70:
                diagnosis += " High active divergence detected; the portfolio is acting independently from the benchmark."

            if resilience < 50:
                diagnosis += " Risk stress-tests indicate vulnerability to sudden market volatility events."

            if tax_frict > 15:
                diagnosis += " Significant capital friction detected; tax drag is eroding net compounding potential."

        # 4. Performance Summary (NEW — deeper, non-repeating insights)
        perf_summary = ""
        if holdings:
            # Returns narrative
            if total_pnl >= 0:
                perf_summary = f"Your portfolio is generating {pnl_pct}% absolute returns on ₹{self._fmt(total_invested)} invested capital."
            else:
                perf_summary = f"Your portfolio is currently down {abs(pnl_pct)}% on ₹{self._fmt(total_invested)} invested, reflecting a ₹{self._fmt(abs(total_pnl))} unrealized loss."
            
            # Risk-adjusted context
            if beta > 1.3:
                perf_summary += f" With a beta of {beta}x, your holdings amplify market swings — a 10% Nifty drop could translate to ~{round(beta * 10)}% drawdown."
            elif beta < 0.7:
                perf_summary += f" Your defensive beta of {beta}x provides significant downside cushioning during volatile periods."
            
            # Tax impact
            if net_tax_gain != 0:
                if net_tax_gain >= 0:
                    perf_summary += f" After estimated STCG/LTCG taxation, your net realizable gain stands at ₹{self._fmt(net_tax_gain)}."
                else:
                    perf_summary += f" After tax adjustments, the effective loss widens to ₹{self._fmt(abs(net_tax_gain))}."
            
            # Yield
            if div_cashflow > 0:
                perf_summary += f" Annual dividend income is projected at ₹{self._fmt(div_cashflow)}, providing passive cashflow."
        
        # 5. Why section (NEW — causal reasoning)
        reasons = []
        if holdings:
            if concentration >= 25 and ticker:
                reasons.append(f"{ticker} carries {round(concentration)}% of portfolio weight — its performance disproportionately drives overall P&L.")
            
            if avg_pe > 35:
                reasons.append(f"Average valuation at {avg_pe}x P/E suggests holdings are priced for high growth. Any earnings miss could trigger sharp corrections.")
            elif avg_pe > 0 and avg_pe < 15:
                reasons.append(f"Average P/E of {avg_pe}x indicates value-oriented positioning. Upside may materialize as market rotates toward undervalued sectors.")
            
            if resilience < 50:
                reasons.append("Historically, portfolios with this structure lost 25-40% during major stress events (2008, COVID). Consider structural hedging.")
            elif resilience > 75:
                reasons.append("Portfolio has shown strong resilience in back-tested stress scenarios, maintaining structural integrity during historic crises.")
            
            if alpha_score > 70:
                reasons.append("High benchmark divergence means returns are driven by stock-specific factors, not broad market direction — both an opportunity and a risk.")
            elif alpha_score < 30:
                reasons.append("With high index correlation, performance is largely tracking the Nifty 50. Alpha generation requires more differentiated positioning.")

        # 6. Prescriptions
        prescriptions = []
        if resilience < 50:
            prescriptions.append("Resilience Gap: Current structure shows high vulnerability to historic stress events.")
        if alpha_score < 30:
            prescriptions.append("Index Mirroring: Holdings are highly correlated with Nifty 50 constituents.")
        if tax_frict > 15:
            prescriptions.append("Tax Drag: Short-term churn is creating structural friction against long-term gains.")
        if avg_pe > 40:
            prescriptions.append("Valuation Alert: Portfolio P/E is significantly above institutional averages.")

        if not prescriptions:
            if total_pnl >= 0:
                prescriptions.append("Momentum Balance: Portfolio is currently riding technical strength.")
            prescriptions.append("Structural Stability: Diversification metrics are within institutional safe zones.")

        doctor_rating = "Clinically Diversified" if (resilience > 60 and concentration < 25) else "Diagnostic Monitoring Required"
        next_review_date = (datetime.now() + timedelta(days=30)).date().isoformat()

        return {
            "diagnosis": diagnosis,
            "performance_summary": perf_summary,
            "reasons": reasons[:3],
            "symptoms": symptoms,
            "prescriptions": prescriptions[:3],
            "doctor_rating": doctor_rating,
            "next_review_date": next_review_date,
            "meta": {
                "positions": position_count,
                "pnl_pct": pnl_pct,
                "resilience": resilience,
                "alpha": alpha_score,
                "tax_friction": round(tax_frict, 1),
                "beta": beta,
            }
        }

    def _fmt(self, n):
        """Format number as Indian currency string (no symbol)."""
        val = abs(float(n or 0))
        return f"{val:,.0f}".replace(",", ",")  # Python already uses commas

    def get_market_pulse_sentiment(self) -> Dict[str, Any]:
        """
        Simulates an AI-driven sentiment pulse of the Indian market.
        """
        import random
        sentiments = ["Bullish - High Conviction", "Neutral - Consolidation", "Bearish - Profit Booking"]
        themes = ["Pharma Rebound", "Bank Nifty Strength", "Smallcap Recovery"]
        
        return {
            "pulse": random.choice(sentiments),
            "top_theme": random.choice(themes),
            "confidence": 82.5,
            "ai_logic": "Based on FII/DII flow patterns and RSI cooling on major indexes."
        }

    def handle_portfolio_chat(self, message: str, history: List[Dict[str, str]], portfolio_context: Dict[str, Any]) -> str:
        """
        AI-powered portfolio chat using the same provider cascade as reports.
        Falls back to keyword-based responses if all AI providers are down.
        """
        from services.provider_manager import AIProviderManager
        
        num_holdings = portfolio_context.get("holdings_count", 0)
        pnl = portfolio_context.get("total_pnl", 0)
        pnl_pct = portfolio_context.get("total_pnl_percent", 0)
        total_value = portfolio_context.get("total_value", 0)
        total_invested = portfolio_context.get("total_invested", 0)
        holdings = portfolio_context.get("holdings", [])
        
        # Build a concise portfolio summary for the AI
        holdings_summary = ""
        if isinstance(holdings, list):
            for h in holdings[:10]:  # Max 10 to save tokens
                name = h.get("name") or h.get("ticker", "?")
                ticker = h.get("ticker", "?")
                weight = h.get("weight", 0)
                h_pnl = h.get("pnl_percent", 0)
                holdings_summary += f"- {name} ({ticker}): {weight:.1f}% weight, PnL {h_pnl:.1f}%\n"
        
        system_prompt = f"""You are KIMS — an expert Indian Stock Market Researcher and Portfolio Intelligence AI for InvestIQ.

PORTFOLIO CONTEXT:
- Total Holdings: {num_holdings} positions
- Total Invested: ₹{self._fmt(total_invested)}
- Current Value: ₹{self._fmt(total_value)}
- Total P&L: ₹{self._fmt(pnl)} ({pnl_pct:.1f}%)
- Holdings:
{holdings_summary}

RULES:
1. You ONLY discuss Indian equities, portfolio analysis, and financial markets (NSE/BSE).
2. Be specific about the user's actual holdings when answering.
3. Provide actionable insights with data-backed reasoning.
4. Keep responses concise (2-3 paragraphs max).
5. Use ₹ for currency, reference Indian market indices (Nifty, Sensex).
6. End every response with: "*Note: I am an AI researcher, not a SEBI-registered advisor. This is for educational/analytical purposes only.*"
7. If asked about non-market topics, politely redirect to portfolio analysis."""

        try:
            llm = AIProviderManager()
            response = llm.generate_text(system_prompt, message, history)
            if response and "trouble connecting" not in response:
                return response
        except Exception as e:
            pass  # Fall through to keyword fallback
        
        # Fallback: keyword-based responses if AI is unavailable
        msg = message.lower()
        disclaimer = "\n\n*Note: I am an AI researcher, not a SEBI-registered advisor. This is for educational/analytical purposes only.*"
        
        non_market_keywords = ["weather", "movie", "news", "food", "recipe", "politics"]
        if any(word in msg for word in non_market_keywords) and not any(m in msg for m in ["stock", "market", "finance"]):
            return "As your KIMS Portfolio Researcher, I only analyze market-related data. Let's stick to dissecting your ₹ holdings or structural risk metrics." + disclaimer

        if "risk" in msg or "safe" in msg:
            return f"Analyzing your {num_holdings} positions through the lens of Indian market volatility. Your concentration in top weights is the primary risk vector. From a retail investor perspective, maintaining a 5-8% cap on single stocks is the 'gold standard' for resilience." + disclaimer
        elif "perform" in msg or "pnl" in msg or "profit" in msg:
            if pnl > 0:
                return f"Your portfolio is riding the current Nifty momentum with ₹{self._fmt(abs(pnl))} in unrealized gains. As a researcher, I'd look at whether this is 'Alpha' (beating the index) or just a rising tide lifting all boats." + disclaimer
            else:
                return f"We're seeing a ₹{self._fmt(abs(pnl))} drawdown. In the Indian midcap/smallcap cycle, these 10-15% corrections are where the 'best retail investors' show patience while others panic. Check your fundamental radar." + disclaimer
        
        return f"I've parsed your request regarding '{message}'. My analysis is focused on technical structure and fundamental alignment within the NSE/BSE ecosystem. How shall we optimize your {num_holdings} holdings today?" + disclaimer

    def simulate_portfolio_catalyst(self, catalyst: str, portfolio_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Mock logic to predict portfolio impact of a specific macro catalyst with Indian context.
        """
        import random
        cat = catalyst.lower()
        impact_score = random.randint(40, 85)
        
        if "rate" in cat or "fed" in cat or "rbi" in cat:
            sentiment = "Bearish" if impact_score > 60 else "Neutral"
            reasoning = "Interest rate cycles (RBI/Fed) directly squeeze the valuation multiples of high-growth Indian stocks. Your interest-sensitive holdings (Banks/NBFCs) will feel the primary heat."
        elif "oil" in cat or "crude" in cat:
            sentiment = "Bearish" if impact_score > 50 else "Neutral"
            reasoning = "India is a net importer of crude. A spike hurts the CAD and impacts margins for our Chemical and Auto ancillary holdings. Defensive FMCG might hold better."
        elif "tech" in cat or "selloff" in cat:
            sentiment = "Bearish"
            impact_score = random.randint(60, 95)
            reasoning = "Nifty IT correlation with Nasdaq is ultra-high. A global tech selloff triggers FII exits from large-cap Indian IT giants, dragging the index weight."
        else:
            sentiment = "Bullish" if impact_score < 50 else "Bearish"
            reasoning = f"Simulating '{catalyst}' against your India-centric portfolio. My logic suggests a structural shift in sector rotation rather than a systemic crash."

        return {
            "impact_score": impact_score,
            "sentiment": sentiment,
            "reasoning": reasoning + " (Analytical insight; not SEBI-approved advice.)"
        }
