import logging
from typing import Dict, Any

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

[AGENT INSTRUCTIONS]
1. Assess the fundamental data for long-term health (Value Agent).
2. Assess the volatility and momentum vectors (Technical Agent).
3. Identify regulatory/market risk (Risk Agent).

[USER PREFERENCES]
{preferences_text}

Generate the final synthesis report following the InvestIQ schema exactly.
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
                preferences_text=pref_text
            )
            return cls.get_system_prompt() + "\n\n" + rendered_prompt
        except Exception as e:
            logger.error(f"Prompt rendering failed: {e}")
            raise ValueError(f"Failed to construct prompt template: {e}")
