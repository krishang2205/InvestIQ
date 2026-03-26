import random
from typing import List, Dict, Any

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
        holdings = portfolio_report.get("holdings", [])
        total_pnl = portfolio_report.get("total_pnl", 0)
        
        # 1. Identify Key Symptoms
        symptoms = []
        if len(holdings) < 5:
            symptoms.append("Extreme Concentration")
        if total_pnl < -100000:
            symptoms.append("Deep Drawdown")
        
        # 2. Mock AI Narrative Generation
        diagnoses = [
            "Your portfolio shows strong momentum in Blue Chips, but you're blind to the upcoming inflation friction in IT services.",
            "The Doctor's Note: You've over-diversified into laggards. Trimming the bottom 2-3 positions could boost your capital efficiency by 12%.",
            "High conviction detected in Energy. While profitable now, your 'Stress Resilience' is low for a commodity-cycle reversal.",
            "Excellent risk management. Your Beta is lower than the index, yet you've captured 85% of the upside."
        ]
        
        # 3. Prescriptions (Actionable Advice)
        prescriptions = [
            "Consider adding Gold/Hedges to improve your Resilience Score above 70.",
            "Stop-loss levels for your top holdings are too wide; tighten them to protect gains.",
            "Your Herd Overlap is too high. Look for 'Hidden Gems' in the Midcap 100 to differentiate."
        ]
        
        return {
            "diagnosis": random.choice(diagnoses),
            "symptoms": symptoms,
            "prescriptions": prescriptions[:2],
            "doctor_rating": "Healthy" if total_pnl > 0 else "Under Observation",
            "next_review_date": "2024-04-26"
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
