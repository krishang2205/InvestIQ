from typing import Dict, List, Any


class AnalysisService:
    def calculate_indicators(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        closes = [item["close"] for item in history if item.get("close") is not None]

        if not closes:
            return {
                "latestClose": None,
                "sma20": None,
                "sma50": None,
                "trend": "No data",
                "momentum": "No data",
                "oneWeekReturnPercent": None,
                "oneMonthReturnPercent": None,
                "volatilityEstimate": None
            }

        latest_close = round(closes[-1], 2)
        sma20 = round(sum(closes[-20:]) / 20, 2) if len(closes) >= 20 else None
        sma50 = round(sum(closes[-50:]) / 50, 2) if len(closes) >= 50 else None

        if sma20 is not None and sma50 is not None:
            if latest_close > sma20 > sma50:
                trend = "Bullish"
            elif latest_close < sma20 < sma50:
                trend = "Bearish"
            else:
                trend = "Neutral"
        else:
            trend = "Insufficient data"

        one_week_return = None
        if len(closes) >= 6 and closes[-6] not in (None, 0):
            one_week_return = round(((closes[-1] - closes[-6]) / closes[-6]) * 100, 2)

        one_month_return = None
        if len(closes) >= 22 and closes[-22] not in (None, 0):
            one_month_return = round(((closes[-1] - closes[-22]) / closes[-22]) * 100, 2)

        if one_week_return is None:
            momentum = "Insufficient data"
        elif one_week_return > 4:
            momentum = "Strong"
        elif one_week_return > 0:
            momentum = "Moderate"
        else:
            momentum = "Weak"

        daily_returns = []
        for i in range(1, len(closes)):
            prev_close = closes[i - 1]
            curr_close = closes[i]
            if prev_close not in (None, 0):
                daily_returns.append(((curr_close - prev_close) / prev_close) * 100)

        volatility_estimate = None
        if daily_returns:
            mean_ret = sum(daily_returns) / len(daily_returns)
            variance = sum((r - mean_ret) ** 2 for r in daily_returns) / len(daily_returns)
            volatility_estimate = round(variance ** 0.5, 2)

        return {
            "latestClose": latest_close,
            "sma20": sma20,
            "sma50": sma50,
            "trend": trend,
            "momentum": momentum,
            "oneWeekReturnPercent": one_week_return,
            "oneMonthReturnPercent": one_month_return,
            "volatilityEstimate": volatility_estimate
        }

    def build_summary(self, overview: Dict[str, Any], indicators: Dict[str, Any]) -> Dict[str, Any]:
        change_percent = overview.get("changePercent")
        beta = overview.get("beta")
        trailing_pe = overview.get("trailingPE")
        dividend_yield = overview.get("dividendYield")

        if change_percent is None:
            sentiment = "Neutral"
        elif change_percent > 1.5:
            sentiment = "Positive"
        elif change_percent < -1.5:
            sentiment = "Negative"
        else:
            sentiment = "Neutral"

        if beta is None:
            risk = "Moderate"
        elif beta < 0.9:
            risk = "Low"
        elif beta > 1.2:
            risk = "High"
        else:
            risk = "Moderate"

        if trailing_pe is None:
            valuation = "Unavailable"
        elif trailing_pe < 20:
            valuation = "Reasonable"
        elif trailing_pe < 35:
            valuation = "Premium"
        else:
            valuation = "Expensive"

        income_profile = "No dividend signal"
        if dividend_yield is not None:
            if dividend_yield >= 2.0:
                income_profile = "Dividend supportive"
            elif dividend_yield > 0:
                income_profile = "Low dividend"
            else:
                income_profile = "No dividend signal"

        return {
            "trend": indicators.get("trend"),
            "momentum": indicators.get("momentum"),
            "sentiment": sentiment,
            "risk": risk,
            "valuation": valuation,
            "incomeProfile": income_profile
        }

    def generate_narrative(self, overview: Dict[str, Any], indicators: Dict[str, Any]) -> Dict[str, str]:
        company_name = overview.get("companyName") or overview.get("symbol")
        sector = overview.get("sector") or "the broader market"
        industry = overview.get("industry") or "its industry"
        price = overview.get("price")
        change_percent = overview.get("changePercent")
        market_cap = overview.get("marketCapFormatted")
        pe = overview.get("trailingPE")
        trend = indicators.get("trend")
        momentum = indicators.get("momentum")

        business_text = (
            f"{company_name} operates in the {sector} space, with business exposure linked to {industry}. "
            f"This profile helps position the company within its competitive segment and gives context for peer benchmarking."
        )

        market_text = (
            f"The stock is currently trading around {price}, with a daily move of {change_percent}%."
            if price is not None and change_percent is not None
            else f"Current market movement for {company_name} is available, but some real-time fields may be limited."
        )

        valuation_text = (
            f"The company has an approximate market capitalization of {market_cap} and a trailing P/E of {pe}. "
            f"These figures can be used to compare scale and valuation against sector peers."
            if market_cap is not None and pe is not None
            else f"Some valuation fields for {company_name} are partially available and should be interpreted together with peer comparison."
        )

        technical_text = (
            f"Technical reading currently suggests a {trend.lower()} trend with {momentum.lower()} momentum."
            if trend and momentum and trend != "No data"
            else f"Technical interpretation is limited because the historical series is insufficient or incomplete."
        )

        return {
            "business": business_text,
            "marketPosition": market_text,
            "valuation": valuation_text,
            "technicalView": technical_text
        }