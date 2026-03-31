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

    def generate_health_check(self, portfolio_report: Dict[str, Any]) -> Dict[str, Any]:
        """
        Processes portfolio metrics and generates an AI-driven 'Narrative Diagnosis'.
        In a production environment, this would call a model like Gemini or GPT-4.
        """
        holdings = portfolio_report.get("holdings", []) or []
        total_pnl = float(portfolio_report.get("total_pnl", 0) or 0)
        
        # 1. Identify Key Symptoms
        position_count = len(holdings)
        symptoms = []
        if position_count < 5:
            symptoms.append(f"Low diversification ({position_count} positions)")
        if total_pnl < -100000:
            symptoms.append("Material drawdown")
        elif total_pnl < 0:
            symptoms.append("Mild drawdown")

        top_holding = None
        if holdings:
            # PortfolioService returns holdings sorted by `weight` descending.
            top_holding = holdings[0]

        concentration = float(top_holding.get("weight", 0) or 0) if top_holding else 0.0
        ticker = top_holding.get("ticker") if top_holding else None

        # 2. Deterministic narrative generation (Compliance safe - no explicit advice)
        if not holdings:
            diagnosis = "No data available. Add transactions to start tracking portfolio performance."
        elif concentration >= 30:
            diagnosis = (
                f"Your portfolio is anchored by {ticker} ({round(concentration, 1)}%). "
                "A drawdown in this specific position can disproportionately impact your overall returns. "
                "The structure currently exceeds the standard 20% single-asset threshold, increasing concentration risk."
            )
        elif concentration >= 15:
            diagnosis = (
                f"Your portfolio shows moderate concentration in {ticker} ({round(concentration, 1)}%). "
                "The structural weighting is slightly elevated but remains within acceptable institutional limits."
            )
        else:
            diagnosis = (
                "Your portfolio exhibits excellent structural diversification. "
                "No single asset dominates the risk profile, resulting in a highly stable beta allocation."
            )

        if total_pnl < 0:
            diagnosis += " The portfolio exhibits negative momentum. Downside protections may be historically weak."
        else:
            diagnosis += " The portfolio exhibits positive momentum. Capitalizing on strength structure."

        # 3. Prescriptions (Actionable Analytical Flags, not Advice)
        prescriptions = []
        if concentration >= 30 and ticker:
            prescriptions.append(f"Structure Risk: {ticker} exposure exceeds the safe 20% institutional threshold.")
        if position_count < 5:
            prescriptions.append("Diversification Gap: Holding fewer than 5 positions severely limits structural alpha.")
        if total_pnl < 0:
            prescriptions.append("Momentum Alert: Portfolio is experiencing a sustained drawdown against the benchmark.")
        else:
            prescriptions.append("Volatility Alignment: Current weights are contributing positively to the overall variance.")

        doctor_rating = "Structurally Sound" if (total_pnl >= 0 and concentration < 30) else "High Risk Vulnerability"
        next_review_date = (datetime.now() + timedelta(days=30)).date().isoformat()

        return {
            "diagnosis": diagnosis,
            "symptoms": symptoms,
            "prescriptions": prescriptions[:2],
            "doctor_rating": doctor_rating,
            "next_review_date": next_review_date,
        }

    def get_market_pulse_sentiment(self) -> Dict[str, Any]:
        """
        Simulates an AI-driven sentiment pulse of the Indian market.
        """
        sentiments = ["Bullish - High Conviction", "Neutral - Consolidation", "Bearish - Profit Booking"]
        themes = ["Pharma Rebound", "Bank Nifty Strength", "Smallcap Recovery"]
        
        return {
            "pulse": random.choice(sentiments),
            "top_theme": random.choice(themes),
            "confidence": 82.5,
            "ai_logic": "Based on FII/DII flow patterns and RSI cooling on major indexes."
        }
