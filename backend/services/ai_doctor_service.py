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

        # 2. Deterministic narrative generation (no random placeholders)
        if not holdings:
            diagnosis = "No data available. Add transactions to start tracking portfolio performance."
        elif concentration >= 30:
            diagnosis = (
                f"Your portfolio is anchored by {ticker} ({round(concentration, 1)}%). "
                "A drawdown in this position can disproportionately impact your overall returns. "
                "Consider trimming to reduce single-asset risk."
            )
        elif concentration >= 15:
            diagnosis = (
                f"Your portfolio shows moderate concentration in {ticker} ({round(concentration, 1)}%). "
                "Small rebalancing trims can help smooth volatility without disrupting your thesis."
            )
        else:
            diagnosis = (
                "Your portfolio appears reasonably diversified. "
                "Maintain your allocation and periodically rebalance to keep weights aligned."
            )

        if total_pnl < 0:
            diagnosis += " You are currently in drawdown; prioritize downside risk controls over aggressive adding."
        else:
            diagnosis += " You are currently in positive P&L; protect gains by rebalancing back to target weights."

        # 3. Prescriptions (Actionable Advice)
        prescriptions = []
        if concentration >= 30 and ticker:
            prescriptions.append(f"Trim {ticker} toward ~20% weight and redeploy to underweighted holdings.")
        if position_count < 5:
            prescriptions.append("Add 2-3 additional positions across different sectors to reduce concentration risk.")
        if total_pnl < 0:
            prescriptions.append("Review per-position risk and tighten exits (stop-loss levels) to limit future drawdowns.")
        else:
            prescriptions.append("Rebalance back to current winners/losers split to avoid drift and lock in risk-adjusted gains.")

        doctor_rating = "Healthy" if (total_pnl >= 0 and concentration < 30) else "Under Observation"
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
