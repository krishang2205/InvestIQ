import logging
from typing import Dict, Any
import datetime

logger = logging.getLogger(__name__)

class PromptRegistry:
    """
    Decouples Prompt Engineering texts from the main business logic.
    Provides templating mechanisms for injecting market context dynamically
    into version-controlled system prompts.
    """
    
    SYSTEM_PROMPT_v1 = """\
You are an institutional-grade financial analysis AI system.
Your only output format must be valid JSON fitting the required interface.
"""

    MULTI_AGENT_TEMPLATE = """\
[CONTEXT DATA]
Symbol: {symbol}
Volatility Index: {volatility}
Fundamental Data: {fundamentals}
Current Live Date: {current_date}

[AGENT INSTRUCTIONS]
1. Assess the fundamental data for long-term health (Value Agent).
2. Assess the volatility and momentum vectors (Technical Agent).
3. Identify regulatory/market risk (Risk Agent).
4. CRITICAL TIMING: The priceBehavior.chartData timeline MUST be strictly historical, calculating backwards exactly from the Current Live Date ({current_date}).

[USER PREFERENCES]
{preferences_text}

Generate the final synthesis report following the InvestIQ schema exactly. You MUST return ONLY a valid JSON object matching this exact structure:
{{
    "header": {{"company": "String", "symbol": "String", "exchange": "String", "sector": "String", "generatedOn": "{current_date}", "dataRange": "String"}},
    "companyProfile": {{"ceo": "String", "founded": "String", "headquarters": "String", "employees": "String"}},
    "proprietaryAlpha": {{
        "executiveSentiment": {{"tone": "String", "confidenceScore": "Integer (1-100)", "volatilityIndex": "Integer (1-100)", "summary": "String"}},
        "insiderHeatmap": {{"activityLevel": "String", "netBuyingPercent": "Integer", "sharesTradedLast30Days": "Integer", "analysis": "String"}},
        "supplyChainRisk": {{"criticalDependencies": [{{"country": "String", "dependencyScore": "Integer (1-100)"}}], "overallRiskScore": "Integer (1-100)", "overview": "String"}},
        "killSwitchThreats": {{"threatProbability": "Integer (1-100)", "disruptiveTech": "String", "competitor": "String", "timelineToImpact": "String"}},
        "alternativeData": {{"webTrafficGrowth": "Integer (-100 to 100)", "employeeMoraleScore": "Integer (1-100)", "githubRepoActivity": "Integer (1-100)", "summary": "String"}}
    }},
    "snapshot": {{"description": "String", "domains": ["String"], "keyMetrics": [{{"label": "String", "value": "String"}}]}},
    "executiveSummary": {{"status": [{{"label": "String", "value": "String", "type": "positive|negative|neutral"}}], "text": "String"}},
    "priceBehavior": {{"chartData": [{{"date": "Past Month/Year", "price": 100}}, {{"date": "Past Month/Year", "price": 105}}, {{"date": "{current_date}", "price": 110}}], "interpretation": "String"}},
    "volatility": {{"value": 50, "level": "Medium"}},
    "technicalSignals": [{{"name": "String", "status": "String", "text": "String"}}],
    "sentiment": {{"score": 75, "text": "String"}},
    "riskSignals": [{{"text": "String"}}],
    "explainability": {{"factors": [{{"name": "String", "value": 80}}], "text": "String"}},
    "industryOverview": {{"title": "String", "text": "String"}},
    "financialAnalysis": {{"title": "String", "text": "String"}},
    "peerComparison": [{{"name": "String", "price": "String", "pe": "String", "roe": "String", "revenue": "String"}}],
    "aiAlphaInsights": [{{"title": "Dark Pool Estimate | Options Flow Sentiment | Web Scraping Vector", "description": "Highly advanced proprietary quantitative algorithmic deduction (at least 2 sentences)", "confidence": 88, "actionVector": "Specific mechanical trading outcome"}}],
    "outlook": {{"shortTerm": "String", "longTerm": "String"}}
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
            # Safely extract context vars, defaulting if missing
            symbol = context.get("symbol", "UNKNOWN")
            volatility = context.get("volatility", "Normal")
            fundamentals = context.get("fundamentals", {})
            
            rendered_prompt = cls.MULTI_AGENT_TEMPLATE.format(
                symbol=symbol,
                volatility=volatility,
                fundamentals=fundamentals,
                preferences_text=pref_text,
                current_date=datetime.date.today().strftime("%b %d, %Y")
            )
            return cls.get_system_prompt() + "\n\n" + rendered_prompt
        except Exception as e:
            logger.error(f"Prompt rendering failed: {e}")
            raise ValueError(f"Failed to construct prompt template: {e}")
