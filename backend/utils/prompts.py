import logging
from typing import Dict, Any
import datetime
import json

logger = logging.getLogger(__name__)

class PromptRegistry:
    """
    Decouples Prompt Engineering texts from the main business logic.
    Provides templating mechanisms for injecting market context dynamically
    into version-controlled system prompts.
    """

    SYSTEM_PROMPT_v1 = """\
You are an elite institutional-grade financial analysis AI, equivalent to a \
Goldman Sachs buy-side research analyst with 20 years of experience. \
Your ONLY allowed output is a single valid JSON object. No markdown, no preamble, no prose outside JSON."""

    MULTI_AGENT_TEMPLATE = """\
[DATA INTEGRITY OATH — MANDATORY COMPLIANCE]
- You have been provided with VERIFIED, REAL-TIME GROUND TRUTH data below.
- You are strictly PROHIBITED from claiming any of this data is "not available", "unavailable", or "N/A".
- If a number is provided (e.g. {ma_50}), you MUST use it. Failure to do so will result in a system rejection.
- Your persona is an ELITE INSTITUTIONAL INVESTOR. Your tone must be deeply analytical, not generic.

Ticker Symbol:              {symbol}
Annualised Volatility:      {volatility}
Current Date (report date): {current_date}

--- Core Price & Valuation ---
Current Price:              {current_price} {currency}
Today's Price Change:       {price_change_pct}%
52-Week High:               {week_high}
52-Week Low:                {week_low}
50-Day Moving Average:      {ma_50}
200-Day Moving Average:     {ma_200}
Beta (market sensitivity):  {beta}

--- Fundamentals ---
Market Cap:                 {market_cap}B {currency}
P/E Ratio (trailing):       {pe_ratio}
P/B Ratio:                  {pb_ratio}
Return on Equity:           {roe}%
Profit Margin:              {profit_margin}%
Debt-to-Equity:             {debt_equity}
Dividend Yield:             {div_yield}%
Free Cash Flow:             {fcf}B {currency}
Revenue (TTM):              {revenue}B {currency}
Net Income (TTM):           {net_income}B {currency}
EPS:                        {eps}

--- Company Info ---
Sector:                     {sector}
Industry:                   {industry}
Exchange:                   {exchange}
Country:                    {country}
Employees:                  {employees}
Business Description:       {description}

--- Recent News & Real-World Context ---
{news_context}

[AGENT INSTRUCTIONS]
You are running as 4 specialist agents simultaneously. Each agent must contribute \
deep, specific, quantitative analysis grounded ONLY in the real numbers and news above.

*CRITICAL RULES - STRICTLY ENFORCED*:
1. CURRENCY: You must NEVER use the '$' or 'USD' symbol for Indian stocks (.NS or .BO). Always use '{currency}' instead of '$'. If INR, you may use '₹'.
2. NO REPETITIONS: Do NOT repeat the same information across the Executive Summary, Industry Overview, and Financial Analysis. Each section MUST cover entirely unique angles.
3. LOGICAL CONSISTENCY: If the Technical Agent determines the moving averages indicate a 'Bearish' trend, the momentum label in the Executive Summary MUST also be 'Bearish'. You cannot be fundamentally bullish but technically trading below moving averages without acknowledging the short-term bearish momentum.
4. MACRO CONTEXT: Actively use the Recent News to identify current geopolitical or macroeconomic shocks (e.g., wars, inflation, supply dumps) that override historical fundamental bullishness.

1. VALUE AGENT: Analyse P/E ({pe_ratio}), P/B ({pb_ratio}), ROE ({roe}%), FCF ({fcf}B {currency}), \
   dividend yield ({div_yield}%). Compare to sector norms. Give a valuation verdict with \
   specific numeric reasoning (at least 3 sentences).

2. TECHNICAL AGENT: Analyse the price vs 50-day MA ({ma_50}) and 200-day MA ({ma_200}). \
   You MUST use these EXACT numerical values. Describe the stock's position relative to both. \
   Beta is {beta} — interpret institutional risk. 52-week range {week_low} to {week_high}, \
   current price {current_price}. Every sentence MUST contain a real number from above.

3. RISK AGENT: Identify at least 6 specific risk factors for {symbol} in {sector}/{industry}. \
   Consider debt/equity ratio {debt_equity}, macro risks, regulatory risks, competitive threats.

4. ALPHA AGENT: Generate proprietary quantitative scores as real INTEGER values, \
   not strings. confidenceScore MUST be an integer 1-100. All scores must be integers.

[USER PREFERENCES]
{preferences_text}

[OUTPUT REQUIREMENTS — STRICTLY ENFORCED]
- Every text field MUST be 4+ detailed sentences strictly anchored to the REAL NUMBERS above.
- PROHIBITION: Do NOT use phrases like "data is not available" or "is currently not available".
- companyProfile.ceo MUST be exactly "{ceo}" (verified).
- companyProfile.founded, headquarters, employees must be accurate for {symbol}.
- peerComparison: list exactly 5 REAL competitors in the {industry} space with real ticker symbols.
- technicalSignals: exactly 5 entries (RSI, MACD, Moving Average, Volume, Momentum).
- riskSignals: exactly 6 entries, each with specific risk text.
- explainability.factors: at least 5 weighted factors, values must sum near 100.
- aiAlphaInsights: at least 3 unique proprietary insights.
- proprietaryAlpha: ALL fields must contain real INTEGER scores, not string placeholders.

Generate the final synthesis report as ONLY this exact JSON schema. No other text:
{{
    "header": {{
        "company": "Full legal company name",
        "symbol": "{symbol}",
        "exchange": "{exchange}",
        "sector": "{sector}",
        "generatedOn": "{current_date}",
        "dataRange": "1 Year"
    }},
    "companyProfile": {{
        "ceo": "Actual CEO name",
        "founded": "Year founded",
        "headquarters": "City, Country",
        "employees": "Formatted number e.g. 150,000"
    }},
    "proprietaryAlpha": {{
        "executiveSentiment": {{
            "tone": "Bullish|Neutral|Defensive|Bearish",
            "confidenceScore": 85,
            "volatilityIndex": 62,
            "summary": "3-sentence executive communication analysis"
        }},
        "insiderHeatmap": {{
            "activityLevel": "High|Medium|Low",
            "netBuyingPercent": 12,
            "sharesTradedLast30Days": 2500000,
            "analysis": "Act as a well-experienced investor and provide a 4-sentence insider trading pattern analysis."
        }},
        "supplyChainRisk": {{
            "criticalDependencies": [
                {{"country": "CountryName", "dependencyScore": 78}},
                {{"country": "CountryName", "dependencyScore": 45}}
            ],
            "overallRiskScore": 58,
            "overview": "3-sentence supply chain risk analysis"
        }},
        "killSwitchThreats": {{
            "threatProbability": 35,
            "disruptiveTech": "Specific technology name",
            "competitor": "Specific company name",
            "timelineToImpact": "18-36 Months"
        }},
        "alternativeData": {{
            "webTrafficGrowth": 18,
            "employeeMoraleScore": 71,
            "githubRepoActivity": 15,
            "summary": "Provide a 4-sentence alternative data analysis. NOTE: If industry is Banking/Non-Tech, githubRepoActivity MUST be very low (e.g. 0-15) and text must explain why open-source metrics do not apply."
        }}
    }},
    "snapshot": {{
        "description": "4-sentence business description using the real data above",
        "domains": ["Domain1", "Domain2", "Domain3"],
        "keyMetrics": [
            {{"label": "Market Cap", "value": "{market_cap}B {currency}"}},
            {{"label": "P/E Ratio", "value": "{pe_ratio}x"}},
            {{"label": "52W Range", "value": "{week_low} - {week_high} {currency}"}},
            {{"label": "Dividend Yield", "value": "{div_yield}%"}}
        ]
    }},
    "executiveSummary": {{
        "status": [
            {{"label": "Valuation", "value": "Bullish|Neutral|Bearish", "type": "positive|negative|neutral"}},
            {{"label": "Momentum", "value": "Bullish|Neutral|Bearish", "type": "positive|negative|neutral"}},
            {{"label": "Risk", "value": "Low|Medium|High", "type": "positive|neutral|negative"}}
        ],
        "text": "4-sentence overall assessment referencing specific numbers like P/E {pe_ratio}, market cap {market_cap}B {currency}, ROE {roe}%"
    }},
    "priceBehavior": {{
        "chartData": [
            {{"date": "Past date", "price": 100}},
            {{"date": "{current_date}", "price": {current_price_val}}}
        ],
        "interpretation": "3-sentence price trend interpretation mentioning 52-week range and moving averages"
    }},
    "volatility": {{
        "value": 50,
        "level": "Low|Medium|High"
    }},
    "technicalSignals": [
        {{"name": "RSI (14)", "status": "Bullish|Neutral|Bearish", "text": "Specific RSI reading and interpretation"}},
        {{"name": "MACD", "status": "Bullish|Neutral|Bearish", "text": "MACD signal line interpretation"}},
        {{"name": "Moving Average", "status": "Bullish|Neutral|Bearish", "text": "Price vs 50-day {ma_50} and 200-day {ma_200} analysis"}},
        {{"name": "Volume Profile", "status": "Bullish|Neutral|Bearish", "text": "Volume trend and institution activity"}},
        {{"name": "Momentum", "status": "Bullish|Neutral|Bearish", "text": "Rate of change and momentum oscillator reading"}}
    ],
    "sentiment": {{
        "score": 75,
        "text": "3-sentence market sentiment analysis for {symbol}"
    }},
    "riskSignals": [
        {{"text": "Risk 1: Specific risk with quantitative context"}},
        {{"text": "Risk 2: Specific risk with quantitative context"}},
        {{"text": "Risk 3: Specific risk with quantitative context"}},
        {{"text": "Risk 4: Specific risk with quantitative context"}},
        {{"text": "Risk 5: Specific risk with quantitative context"}},
        {{"text": "Risk 6: Specific risk with quantitative context"}}
    ],
    "explainability": {{
        "factors": [
            {{"name": "Valuation Score", "value": 80}},
            {{"name": "Growth Momentum", "value": 70}},
            {{"name": "Risk-Adjusted Return", "value": 65}},
            {{"name": "Earnings Quality", "value": 75}},
            {{"name": "Market Positioning", "value": 70}}
        ],
        "text": "3-sentence explanation of the analytical weighting methodology"
    }},
    "industryOverview": {{
        "title": "{sector} Industry Overview",
        "text": "3-sentence macro industry dynamics affecting {symbol}"
    }},
    "financialAnalysis": {{
        "title": "Financial Deep Dive",
        "text": "4-sentence analysis referencing revenue {revenue}B {currency}, net income {net_income}B {currency}, FCF {fcf}B {currency}, profit margin {profit_margin}%"
    }},
    "peerComparison": [
        {{"name": "Peer Company 1", "price": "XXX {currency}", "pe": "XX.X", "roe": "XX%", "revenue": "XX B {currency}"}},
        {{"name": "Peer Company 2", "price": "XXX {currency}", "pe": "XX.X", "roe": "XX%", "revenue": "XX B {currency}"}},
        {{"name": "Peer Company 3", "price": "XXX {currency}", "pe": "XX.X", "roe": "XX%", "revenue": "XX B {currency}"}},
        {{"name": "Peer Company 4", "price": "XXX {currency}", "pe": "XX.X", "roe": "XX%", "revenue": "XX B {currency}"}},
        {{"name": "Peer Company 5", "price": "XXX {currency}", "pe": "XX.X", "roe": "XX%", "revenue": "XX B {currency}"}}
    ],
    "aiAlphaInsights": [
        {{"title": "Dark Pool Flow Signal", "description": "2-sentence proprietary dark pool interpretation for {symbol}", "confidence": 82, "actionVector": "Specific directional signal"}},
        {{"title": "Options Sentiment", "description": "2-sentence put/call ratio and implied volatility analysis", "confidence": 75, "actionVector": "Specific options strategy implication"}},
        {{"title": "Institutional Accumulation", "description": "2-sentence institutional 13F filing trend analysis", "confidence": 79, "actionVector": "Specific accumulation or distribution signal"}}
    ],
    "outlook": {{
        "shortTerm": "3-sentence tactical outlook (0-3 months) with specific price levels referencing {current_price} {currency}",
        "longTerm": "3-sentence structural outlook (12+ months) referencing FCF {fcf}B {currency} and ROE {roe}%"
    }}
}}
"""

    @classmethod
    def get_system_prompt(cls) -> str:
        return cls.SYSTEM_PROMPT_v1

    @classmethod
    def construct_analysis_prompt(cls, context: Dict[str, Any], preferences: Dict[str, bool]) -> str:
        pref_strings = []
        for k, v in preferences.items():
            if v:
                pref_strings.append(f"- Focus strongly on {k} analysis")

        pref_text = "\n".join(pref_strings) if pref_strings else "Standard balanced analysis."

        try:
            fund = context.get("fundamentals", {})
            meta = context.get("company_meta", {})
            symbol = context.get("symbol", "UNKNOWN")

            # Helper: safely round a number or return N/A
            def r(val, d=2):
                try:
                    return round(float(val), d) if val and val != 'N/A' else 'N/A'
                except (TypeError, ValueError):
                    return 'N/A'

            # Format News
            news_items = context.get("news", [])
            if news_items:
                compact_news = news_items[:3]
                news_text = "\n".join(
                    [f"- {n['date'][:10]} | {n['title'][:100]} : {(n.get('summary') or '')[:120]}" for n in compact_news]
                )
            else:
                news_text = "No recent breaking news available. Rely on fundamentals."

            # Dividend yield: yfinance returns it as 2.64 for 2.64% (sometimes 0.0264)
            # We want it as a clean float 2.64
            div_raw = fund.get("dividend_yield", 0)
            if div_raw and div_raw < 0.2: # Likely a decimal (0.0264)
                div_yield_val = r(div_raw * 100)
            else:
                div_yield_val = r(div_raw)

            rendered_prompt = cls.MULTI_AGENT_TEMPLATE.format(
                symbol=symbol,
                ceo=meta.get("ceo", "N/A"),
                volatility=context.get("volatility", "N/A"),
                current_date=datetime.date.today().strftime("%b %d, %Y"),
                preferences_text=pref_text,
                news_context=news_text,

                # Price data — 52W and MAs are top-level context keys, not in fund
                current_price=r(context.get("current_price") or fund.get("current_price")),
                current_price_val=context.get("current_price") or fund.get("current_price") or 100,
                currency=meta.get("currency", fund.get("currency", "INR")),
                price_change_pct=r(context.get("price_change_pct") or fund.get("price_change_pct_today")),
                week_high=r(context.get("fifty_two_week_high")),
                week_low=r(context.get("fifty_two_week_low")),
                ma_50=r(context.get("fifty_day_avg")),
                ma_200=r(context.get("two_hundred_day_avg")),
                beta=r(fund.get("beta")),

                # Fundamentals — all rounded
                market_cap=r(fund.get("market_cap_billions")),
                pe_ratio=r(fund.get("pe_ratio")),
                pb_ratio=r(fund.get("pb_ratio")),
                roe=r(fund.get("roe")),
                profit_margin=r(fund.get("profit_margin")),
                debt_equity=r(fund.get("debt_to_equity")),
                div_yield=div_yield_val,
                fcf=r(fund.get("free_cashflow_billions")),
                revenue=r(fund.get("revenue_ttm_billions")),
                net_income=r(fund.get("net_income_billions")),
                eps=r(fund.get("earnings_per_share")),

                # Company info — sourced from company_meta (correct location)
                sector=meta.get("sector", fund.get("sector", "N/A")),
                industry=meta.get("industry", fund.get("industry", "N/A")),
                exchange=meta.get("exchange", fund.get("exchange", "N/A")),
                country=meta.get("country", fund.get("country", "N/A")),
                employees=meta.get("employees", fund.get("employees", "N/A")),
                description=(meta.get("description") or fund.get("company_description", "N/A"))[:180],
            )
            return cls.get_system_prompt() + "\n\n" + rendered_prompt

        except Exception as e:
            logger.error(f"Prompt rendering failed: {e}")
            raise ValueError(f"Failed to construct prompt template: {e}")
