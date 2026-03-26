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
        Calculates the 'Uniqueness Index' relative to the Nifty 50.
        Uses sector weightings to detect 'Market Mirroring'.
        """
        # Benchmark weights (approximate for April 2024)
        BENCHMARK_SECTORS = {
            "financial_services": 33.5,
            "it": 13.8,
            "oil_gas_fuels": 11.2,
            "fmcg": 9.4,
            "automobile": 6.2
        }
        
        # 1. Calculate Portfolio Sector Weights
        portfolio_sectors = {}
        total_value = sum(h.get("total_invested", 0) for h in holdings)
        
        if total_value <= 0:
            return {"score": 100, "label": "Blank Slate"}

        for h in holdings:
            sector = h.get("sector", "others").lower()
            weight = (h["total_invested"] / total_value) * 100
            portfolio_sectors[sector] = portfolio_sectors.get(sector, 0) + weight
            
        # 2. Compare Weights (Mean Squared Error style divergence)
        divergence_sum = 0
        for sector, b_weight in BENCHMARK_SECTORS.items():
            p_weight = portfolio_sectors.get(sector, 0)
            divergence_sum += abs(p_weight - b_weight)
            
        # 3. Normalize to a 0-100 score
        # A perfectly mirrored portfolio would have near 0 divergence
        # An entirely different portfolio would have ~70+
        uniqueness_score = min(100, divergence_sum * 1.5)
        
        # 4. Final Narrative
        label = "True Alpha Seeker" if uniqueness_score > 60 else "Market Passenger"
        if uniqueness_score < 25:
            label = "Index Shadow"
            
        return {
            "score": round(float(uniqueness_score), 1),
            "label": label,
            "sector_overlap": {s: round(float(portfolio_sectors.get(s, 0)), 1) for s in BENCHMARK_SECTORS},
            "insight": f"Your portfolio is {round(float(uniqueness_score))}% decoupled from the Nifty 50 benchmark."
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

    def get_tax_friction_estimate(self, holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates the real-world friction of exiting the current portfolio positions.
        Considers Indian Income Tax rules:
        - STCG (Short Term Capital Gains): 15% if held < 12 months.
        - LTCG (Long Term Capital Gains): 10% if held > 12 months (after 1L exemption).
        - Plus 4% Health & Education Cess.
        """
        total_stcg = Decimal("0")
        total_ltcg = Decimal("0")
        total_brokerage = Decimal("0")
        
        current_time = datetime.now()
        
        for h in holdings:
            pnl = Decimal(str(h.get("pnl", 0)))
            if pnl <= 0: continue
            
            # Mocking 'days_held' for simulation
            # In production, this would come from the 'transactions' table join
            days_held = h.get("days_held", 400) # Default to LTCG for demo
            
            # Standard Equity Brokerage (approx 0.05% or flat 20)
            brokerage = Decimal(str(h["current_value"])) * Decimal("0.0005")
            total_brokerage += brokerage
            
            if days_held < 365:
                total_stcg += pnl
            else:
                total_ltcg += pnl

        # Apply Tax Rates
        tax_stcg = total_stcg * Decimal("0.15")
        
        # LTCG has 1 Lakh exemption (cumulative across all stocks)
        taxable_ltcg = max(Decimal("0"), total_ltcg - Decimal("100000"))
        tax_ltcg = taxable_ltcg * Decimal("0.10")
        
        base_tax = tax_stcg + tax_ltcg
        cess = base_tax * Decimal("0.04") # 4% Cess
        
        total_tax = base_tax + cess
        
        return {
            "breakdown": {
                "stcg_taxable": float(total_stcg),
                "ltcg_taxable": float(total_ltcg),
                "stcg_tax": float(tax_stcg),
                "ltcg_tax": float(tax_ltcg),
                "cess": float(cess)
            },
            "total_tax_estimated": float(total_tax),
            "brokerage_fees": float(total_brokerage),
            "total_friction": float(total_tax + total_brokerage),
            "net_capital_gain": float(sum(Decimal(str(h.get("pnl", 0))) for h in holdings) - total_tax - total_brokerage),
            "friction_ratio_percent": float((total_tax + total_brokerage) / sum(Decimal(str(h.get("pnl", 0))) for h in holdings) * 100) if any(h.get("pnl", 0) > 0 for h in holdings) else 0
        }
