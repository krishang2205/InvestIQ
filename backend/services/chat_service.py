import logging
import json
from typing import List, Dict, Any, Optional
from services.provider_manager import AIProviderManager

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self, llm_manager: AIProviderManager):
        self.llm = llm_manager

    def process_chat(self, message: str, history: List[Dict[str, str]], report_context: Dict[str, Any]) -> str:
        """
        Handles general stock-specific Q&A for beginners.
        """
        symbol = report_context.get("header", {}).get("symbol", "the stock")
        company = report_context.get("header", {}).get("company", "the company")
        
        system_prompt = f"""
        You are the InvestIQ AI Mentor, a professional yet friendly financial expert helping beginners understand a specific stock report for {company} ({symbol}).
        
        CONTEXT:
        Below is the detailed financial report data for {company}. Use this as your primary source of truth.
        {json.dumps(report_context, indent=2)}
        
        GUIDELINES:
        - If the user is a beginner, use simple analogies to explain complex terms (P/E, ROE, Volatility, etc.).
        - Stick strictly to the provided report data for specific numbers or outlooks.
        - If the user asks something unrelated to {company} or general finance, politely steer them back to the report.
        - Keep responses concise (under 2-3 short paragraphs).
        - Use Markdown for formatting (bolding, lists).
        """
        
        # Combine history and current message into a prompt
        # For simplicity, we'll format it as a single string for the LLM manager's current interface
        # but a better way is to pass the message list. We will use a dedicated method in provider_manager.
        
        return self.llm.generate_text(system_prompt, message, history)

    def simulate_catalyst(self, catalyst: str, report_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Unique Feature: Catalyst Simulator.
        Predicts how a specific event impacts the stock using Alpha and Risk factors.
        """
        symbol = report_context.get("header", {}).get("symbol", "the stock")
        
        prompt = f"""
        Analyze how the following market catalyst would impact {symbol} based on its specific financial profile.
        
        CATALYST: "{catalyst}"
        
        REPORT CONTEXT (Alpha & Risk):
        {json.dumps(report_context.get('proprietaryAlpha', {}), indent=2)}
        {json.dumps(report_context.get('riskSignals', []), indent=2)}
        {json.dumps(report_context.get('industryOverview', {}), indent=2)}
        
        OUTPUT FORMAT (Strict JSON):
        {{
            "impact_score": (int 0-100, where 50 is neutral, >50 positive, <50 negative),
            "impact_level": "High" | "Medium" | "Low",
            "sentiment": "Bullish" | "Bearish" | "Neutral",
            "reasoning": "A simple explanation for beginners on why this catalyst affects this specific stock.",
            "affected_factors": ["Factor 1", "Factor 2"]
        }}
        """
        
        response_json = self.llm.generate_json(prompt)
        return response_json
