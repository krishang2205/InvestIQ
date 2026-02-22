import os
import json
import logging
import google.generativeai as genai
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class ReportService:
    """
    Intelligent Report Generation Service handling LLM interactions and data syndication.
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.is_configured = False
        self._configure_llm()

    def _configure_llm(self) -> None:
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.5-pro')
                self.is_configured = True
                logger.info("Gemini LLM successfully configured for Report Service.")
            except Exception as e:
                logger.error(f"Failed to configure Gemini LLM: {str(e)}")
        else:
            logger.warning("GEMINI_API_KEY environment variable is not set. LLM features will be disabled.")

    def health_check(self) -> bool:
        return self.is_configured

    def fetch_base_context(self, symbol: str) -> Dict[str, Any]:
        logger.info(f"Gathering base context for {symbol}")
        return {
            "symbol": symbol,
            "data_source_status": "mock",
            "base_price": 100.0,
            "trend_data": [100, 102, 101, 105, 108]
        }

    def _format_error_response(self, error_msg: str) -> Dict[str, Any]:
        return {
            "error": True,
            "message": error_msg,
            "report_data": None
        }

    def build_multi_agent_prompt(self, symbol: str, context: Dict[str, Any], preferences: Dict[str, bool]) -> str:
        base_prompt = f"""
You are the central synthesis engine for the InvestIQ platform. 
Your goal is to generate a comprehensive, JSON-formatted financial report for the stock symbol: {symbol}.

Available context data:
{json.dumps(context, indent=2)}

User Analytical Preferences:
{json.dumps(preferences, indent=2)}

You must adopt the following multi-agent methodology:
1. THE VALUE INVESTOR: Analyze the context looking for intrinsic value.
2. THE MOMENTUM TRADER: Analyze the price trend data looking for breakouts.
3. THE MACRO RISK ANALYST: Analyze the sector and global exposure.

Your output must be a synthesis of these three viewpoints.
You must output valid JSON ONLY matching the requested schema.
        """
        return base_prompt

    def generate_report(self, symbol: str, preferences: Dict[str, bool]) -> Dict[str, Any]:
        if not self.is_configured:
            return self._format_error_response("LLM is not configured properly.")

        logger.info(f"Initiating report generation for {symbol} with preferences {preferences}")
        context = self.fetch_base_context(symbol)
        prompt = self.build_multi_agent_prompt(symbol, context, preferences)

        try:
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(
                    response_mime_type="application/json",
                )
            )
            json_str = response.text
            report_data = json.loads(json_str)
            logger.info(f"Successfully generated structured report for {symbol}")
            return {
                "error": False,
                "report_data": report_data
            }
        except Exception as e:
            logger.error(f"Error during LLM generation for {symbol}: {str(e)}")
            return self._format_error_response(f"Generation failed: {str(e)}")
