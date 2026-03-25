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
        Provides both numerical impact and an AI-driven behavioral warning.
        """
        scenarios = {
            "covid_2020": {
                "impact": -0.35, 
                "label": "2020 COVID Crash",
                "narrative": "A rapid liquidity shock where everything correlated to 1.0 except Gold and Pharma."
            },
            "lehman_2008": {
                "impact": -0.55, 
                "label": "2008 Financial Crisis",
                "narrative": "A prolonged banking-led collapse; credit markets froze and realty took a decade to recover."
            },
            "inflation_2022": {
                "impact": -0.18, 
                "label": "2022 Rate Hike Regime",
                "narrative": "Growth stocks with high P/E were punished as the cost of capital rose globally."
            },
            "dotcom_2000": {
                "impact": -0.45,
                "label": "2000 Tech Bubble",
                "narrative": "Pure valuation bubble; tech-heavy portfolios lost 80% of their peak value."
            }
        }
        
        selected = scenarios.get(scenario, scenarios["covid_2020"])
        total_invested = sum(h.get("total_invested", 0) for h in holdings)
        
        if total_invested <= 0:
            return {"error": "No holdings found for simulation."}

        # Sector-specific adjustments (More realistic simulation)
        adjusted_impact = selected["impact"]
        for h in holdings:
            sector = h.get("sector", "").lower()
            if scenario == "covid_2020" and sector in ["pharma", "fmcg"]:
                adjusted_impact += 0.05 # Defensive boost
            elif scenario == "inflation_2022" and sector == "it":
                adjusted_impact -= 0.05 # Growth-tech penalty

        potential_loss = total_invested * adjusted_impact
        
        return {
            "scenario": selected["label"],
            "base_impact": round(selected["impact"] * 100, 1),
            "adjusted_impact": round(adjusted_impact * 100, 1),
            "potential_value_drop": round(float(potential_loss), 2),
            "ai_insight": selected["narrative"],
            "resilience_score": round(100 + (adjusted_impact * 100)) # 0-100 scale
        }

    def get_portfolio_doctor_summary(self, holdings: List[Dict[str, Any]]) -> str:
        """
        Generates a quick text summary (AI-style) based on concentration and sector risk.
        To be replaced by real LLM call in the final commit.
        """
        if not holdings: return "No data available."
        
        top_holding = holdings[0]
        concentration = top_holding["weight"]
        
        summary = f"Your portfolio is heavily anchored by {top_holding['ticker']} ({concentration}%). "
        
        if concentration > 30:
            summary += "WARNING: High single-stock risk. A 10% drop in this ticker wipes out your entire annual target."
        elif concentration > 15:
            summary += "Moderate concentration detected. Ensure you have high conviction in this leader."
        else:
            summary += "Excellent diversification. No single asset dominates your risk profile."
            
        return summary

    def calculate_xirr(self, cash_flows: List[Dict[str, Any]], current_value: float) -> float:
        """
        Calculates the internal rate of return (XIRR) for the portfolio.
        Uses the Newton-Raphson method to solve for IRR:
        sum(Ci / (1 + r)^((Di - D0) / 365)) = 0
        """
        # Prepare cash flows: negative for buys, positive for sells and current value
        flows = []
        for cf in cash_flows:
            # tx_date should be a datetime object or ISO string
            date_obj = datetime.fromisoformat(cf["date"]) if isinstance(cf["date"], str) else cf["date"]
            amount = -abs(cf["amount"]) if cf["type"] == "buy" else abs(cf["amount"])
            flows.append((date_obj, amount))
            
        # Add the terminal value (as if we sold everything today)
        flows.append((datetime.now(), current_value))
        
        if not flows or len(flows) < 2:
            return 0.0

        def xnpv(rate, flows):
            d0 = flows[0][0]
            return sum([f[1] / (1 + rate)**((f[0] - d0).days / 365.0) for f in flows])

        def xnpv_derivative(rate, flows):
            d0 = flows[0][0]
            return sum([- (f[1] * (f[0] - d0).days / 365.0) / (1 + rate)**((f[0] - d0).days / 365.0 + 1) for f in flows])

        # Iterative solver (Newton-Raphson)
        rate = 0.1 # Initial guess 10%
        for _ in range(100):
            try:
                f_val = xnpv(rate, flows)
                f_prime = xnpv_derivative(rate, flows)
                
                if abs(f_prime) < 1e-9: break
                
                new_rate = rate - (f_val / f_prime)
                if abs(new_rate - rate) < 1e-6:
                    return round(new_rate * 100, 2)
                rate = new_rate
            except (OverflowError, ZeroDivisionError):
                break
                
        return round(rate * 100, 2)

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
