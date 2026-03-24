import math
from typing import List, Dict, Any
from datetime import datetime

class PortfolioIntelligence:
    """
    PortfolioIntelligence is the AI-driven analytics layer of InvestIQ.
    It specializes in deep-risk assessment, sentiment analysis, 
    and unique retail-centric financial metrics.
    """

    def __init__(self, portfolio_service=None):
        self.service = portfolio_service

    def get_herd_divergence_score(self, holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates how much the portfolio differs from the Nifty 50.
        A higher score means more 'Unique Alpha' potential.
        """
        # Mock benchmark data for demonstration
        NIFTY_50_TOP = ["RELIANCE", "TCS", "HDFCBANK", "ICICIBANK", "INFY"]
        
        overlap_count = 0
        total_holdings = len(holdings)
        
        for h in holdings:
            if h["ticker"] in NIFTY_50_TOP:
                overlap_count += 1
        
        divergence = 100 - ((overlap_count / total_holdings) * 100) if total_holdings > 0 else 100
        
        return {
            "score": round(divergence, 1),
            "label": "High Alpha" if divergence > 70 else "Market Mirror",
            "message": f"Your portfolio is {round(divergence)}% unique compared to major indices."
        }

    def simulate_stress_test(self, holdings: List[Dict[str, Any]], scenario: str = "covid_2020") -> Dict[str, Any]:
        """
        Simulates how the current portfolio would have performed in historical crashes.
        """
        scenarios = {
            "covid_2020": {"impact": -0.35, "label": "2020 COVID Crash"},
            "lehman_2008": {"impact": -0.55, "label": "2008 Financial Crisis"},
            "inflation_2022": {"impact": -0.15, "label": "2022 Tech Sell-off"}
        }
        
        selected = scenarios.get(scenario, scenarios["covid_2020"])
        
        # Calculate potential loss
        total_invested = sum(h.get("total_invested", 0) for h in holdings)
        potential_loss = total_invested * selected["impact"]
        
        return {
            "scenario": selected["label"],
            "impact_percent": selected["impact"] * 100,
            "potential_value_drop": round(potential_loss, 2),
            "recovery_estimate_months": 12 if scenario == "covid_2020" else 24
        } if total_invested > 0 else {}

    def get_tax_friction_estimate(self, total_pnl: float) -> Dict[str, Any]:
        """
        Estimates the 'Real Net Profit' after Indian LTCG/STCG and brokerage.
        """
        if total_pnl <= 0:
            return {"tax_impact": 0, "net_pnl": total_pnl}
            
        # Simplified Indian Tax Logic
        # LTCG > 1 year = 10% after 1L exemption
        # STCG < 1 year = 15%
        avg_tax_rate = 0.12 # Weighted blend for mock purposes
        
        tax_amount = total_pnl * avg_tax_rate
        brokerage_estimate = total_pnl * 0.002 # 20 bps
        
        return {
            "estimated_tax": round(tax_amount, 2),
            "estimated_brokerage": round(brokerage_estimate, 2),
            "total_friction": round(tax_amount + brokerage_estimate, 2),
            "net_profit": round(total_pnl - tax_amount - brokerage_estimate, 2)
        }
