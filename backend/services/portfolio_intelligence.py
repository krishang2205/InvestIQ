import math
import random
from typing import List, Dict, Any
from datetime import datetime
from decimal import Decimal

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

    def get_rebalancing_suggestions(self, holdings: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyzes the portfolio for 'Over-concentration' and 'Stagnant Capital'.
        Returns 100% compliant data analytics (flags), avoiding 'Buy/Sell' terms.
        """
        suggestions = []
        total_value = sum(h.get("total_invested", 0) for h in holdings)
        
        if total_value <= 0: return []
        
        # Rule 1: Flag over-concentrated positions (> 25% weight)
        for h in holdings:
            if h["weight"] > 25:
                excess_weight = h["weight"] - 20 # Target 20%
                exposure_value = (excess_weight / 100) * total_value
                suggestions.append({
                    "type": "OVERWEIGHT",
                    "ticker": h["ticker"],
                    "reason": f"Exposure is {h['weight']}%, which exceeds the standard 20% institutional maximum holding threshold.",
                    "amount": round(float(exposure_value), 2),
                    "impact": "High single-stock vulnerability."
                })
        
        # Rule 2: Flag under-represented high-momentum sectors
        # Mocking momentum sectors for April 2024
        momentum_sectors = ["automobile", "pharma"]
        portfolio_sectors = {h.get("sector", "").lower() for h in holdings}
        
        for sector in momentum_sectors:
            if sector not in portfolio_sectors:
                suggestions.append({
                    "type": "UNDER-EXPOSED",
                    "ticker": sector.upper(),
                    "reason": f"Zero historical exposure to the {sector.title()} sector, which is currently in a macro-uptrend.",
                    "amount": 0, # Do not prescribe buy amounts
                    "impact": "Missing structural alpha."
                })
                
        return suggestions

    def calculate_xirr(self, cash_flows: List[Dict[str, Any]], current_value: float) -> Dict[str, Any]:
        """
        Calculates the internal rate of return (XIRR).
        Returns a dict with 'value', 'type' (annualized/absolute), and 'is_new'.
        """
        if not cash_flows:
            return {"value": 0.0, "type": "absolute", "is_new": True}

        # Calculate time window
        flows = []
        tx_dates = []
        for cf in cash_flows:
            try:
                dt = datetime.fromisoformat(str(cf["date"])) if isinstance(cf["date"], str) else cf["date"]
                tx_dates.append(dt)
                amount = -abs(float(cf["amount"])) if cf["type"] == "buy" else abs(float(cf["amount"]))
                flows.append((dt, amount))
            except Exception:
                continue
        
        now = datetime.now()
        flows.append((now, float(current_value)))
        
        if not tx_dates:
            return {"value": 0.0, "type": "absolute", "is_new": True}

        # PORTFOLIO AGE CHECK
        first_tx = min(tx_dates)
        days_active = (now - first_tx).days
        
        # Calculate Absolute Return for base comparison
        total_invested = sum(abs(f[1]) for f in flows if f[1] < 0)
        absolute_profit = float(current_value) - total_invested
        absolute_pct = (absolute_profit / total_invested * 100) if total_invested > 0 else 0.0

        # CRITICAL: If portfolio is < 1 day old, XIRR is mathematically infinite
        # Return Absolute % instead so the UI shows something real (e.g. 24.1%)
        if days_active < 1:
            return {
                "value": round(absolute_pct, 2),
                "type": "absolute",
                "days": days_active,
                "is_new": True
            }

        # Newton-Raphson Solver for XIRR
        def xnpv(rate, flows):
            d0 = flows[0][0]
            return sum([f[1] / (1 + rate)**((f[0] - d0).days / 365.0) for f in flows])

        def xnpv_derivative(rate, flows):
            d0 = flows[0][0]
            return sum([- (f[1] * (f[0] - d0).days / 365.0) / (1 + rate)**((f[0] - d0).days / 365.0 + 1) for f in flows])

        rate = 0.1
        for _ in range(50):
            try:
                f_val = xnpv(rate, flows)
                f_prime = xnpv_derivative(rate, flows)
                if abs(f_prime) < 1e-9: break
                new_rate = rate - (f_val / f_prime)
                if abs(new_rate - rate) < 1e-6:
                    return {"value": round(new_rate * 100, 2), "type": "annualized", "days": days_active}
                rate = new_rate
            except Exception:
                break
                
        # If solver fails to converge (extreme high returns), return absolute % 
        # as a 'least-evil' fallback instead of 10.00 default.
        return {
            "value": round(absolute_pct, 2), 
            "type": "absolute", 
            "days": days_active,
            "solver_failed": True
        }

    def get_benchmark_comparison(self, days: int = 365) -> Dict[str, Any]:
        """
        Fetches real performance of the Nifty 50 for the given period.
        """
        if not self.service or not self.service.market_data:
            return {"benchmark": "NIFTY 50", "return": 12.0}
            
        # Ensure 'days' is at least 1 to avoid API errors
        query_days = max(1, days)
        benchmark_return = self.service.market_data.get_index_performance("^NSEI", query_days)
        
        return {
            "benchmark": "NIFTY 50",
            "return": float(benchmark_return),
            "period_days": query_days
        }

    def calculate_fundamental_radar(self, holdings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates the 4 Premium Metrics:
        1. Weighted Average P/E Ratio
        2. Portfolio Beta (Volatility)
        3. Dividend Cashflow Predictor
        4. Market Cap Distribution (Large, Mid, Small)
        """
        total_value = sum(float(h.get("current_value", 0)) for h in holdings)
        if total_value <= 0:
            return {
                "avg_pe": 0.0,
                "pe_label": "N/A",
                "beta": 1.0,
                "beta_label": "Mirror",
                "dividend_yield": 0.0,
                "dividend_cashflow": 0.0,
                "market_cap": {"Large": 100.0, "Mid": 0.0, "Small": 0.0}
            }

        weighted_pe = 0.0
        weighted_beta = 0.0
        weighted_yield = 0.0
        market_cap_split = {"Large": 0.0, "Mid": 0.0, "Small": 0.0}

        pe_contributing_weight = 0.0

        for h in holdings:
            val = float(h.get("current_value", 0))
            weight = val / total_value
            
            # Market Cap Split
            mcap = h.get("marketCap", "Large")
            if mcap in market_cap_split:
                market_cap_split[mcap] += weight * 100
            else:
                market_cap_split["Large"] += weight * 100
                
            # Beta
            beta = h.get("beta")
            weighted_beta += float(beta if beta is not None else 1.0) * weight
            
            # Dividend Yield
            dy = float(h.get("dividendYield", 0.0))
            # Critical Bugfix: yfinance occasionally returns Dividend Yield as a whole percentage
            # (e.g., 1.96 instead of 0.0196). We normalize this to a true decimal ratio.
            if dy > 0.30:
                dy = dy / 100.0
                
            weighted_yield += dy * weight

            # P/E (Exclude negative or missing P/E from the weighted average properly)
            pe = h.get("trailingPE")
            if pe is not None:
                pe_float = float(pe)
                if pe_float > 0:
                    weighted_pe += pe_float * weight
                    pe_contributing_weight += weight

        # Normalize P/E if some companies had no P/E
        if pe_contributing_weight > 0:
            weighted_pe = weighted_pe / pe_contributing_weight

        # Labels
        pe_label = "Undervalued" if weighted_pe > 0 and weighted_pe < 22 else "Premium" if weighted_pe > 35 else "Fair"
        if weighted_pe == 0:
            pe_label = "N/A"
            
        beta_label = "Defensive" if weighted_beta < 0.9 else "Aggressive" if weighted_beta > 1.15 else "Neutral"
        
        # Indian retail investors expect annual cashflow values
        annual_cashflow = total_value * weighted_yield

        return {
            "avg_pe": round(weighted_pe, 1),
            "pe_label": pe_label,
            "beta": round(weighted_beta, 2),
            "beta_label": beta_label,
            "dividend_yield": round(weighted_yield * 100, 2), # convert to percentage e.g. 1.5%
            "dividend_cashflow": round(annual_cashflow, 0),
            "market_cap": {k: round(v, 1) for k, v in market_cap_split.items()}
        }

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
        total_pnl = sum(Decimal(str(h.get("pnl", 0))) for h in holdings)
        
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
            "net_capital_gain": float(total_pnl - total_tax - total_brokerage),
            "friction_ratio_percent": float((total_tax + total_brokerage) / total_pnl * 100) if total_pnl > 0 else 0
        }
