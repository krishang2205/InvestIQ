import os
import json
import uuid
import logging
import copy
import google.generativeai as genai
from typing import Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor
from db.database import supabase

logger = logging.getLogger(__name__)

class ReportService:
    """
    Intelligent Report Generation Service with DB Persistence.
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.is_configured = False
        self.executor = ThreadPoolExecutor(max_workers=3)
        self._configure_llm()

    def _configure_llm(self) -> None:
        if self.api_key:
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-2.5-pro')
                self.is_configured = True
            except Exception as e:
                logger.error(f"Failed to configure Gemini LLM: {str(e)}")
        else:
            logger.warning("GEMINI_API_KEY environment variable is not set. LLM disabled.")

    def health_check(self) -> bool:
        return self.is_configured

    def fetch_base_context(self, symbol: str) -> Dict[str, Any]:
        """Fetch real context from APIs. Using mock for now."""
        return {
            "symbol": symbol,
            "data_source_status": "online",
            "base_price": 4350.0,
            "trend_data": "upward steady"
        }

    def build_multi_agent_prompt(self, symbol: str, context: Dict[str, Any], preferences: Dict[str, bool]) -> str:
        return f"""
        You are the InvestIQ Synthesis Engine.
        Generate a comprehensive, JSON-formatted financial report for: {symbol}.
        Context: {json.dumps(context)}
        Preferences: {json.dumps(preferences)}
        
        Adopt a multi-agent methodology:
        1. Value Investor viewpoint
        2. Momentum Trader viewpoint
        3. Macro Risk Analyst viewpoint
        
        Output MUST be pure JSON matching our UI schema exactly.
        """

    def submit_report_job(self, symbol: str, preferences: Dict[str, bool], user_id: str = None) -> str:
        job_id = str(uuid.uuid4())
        
        # Insert to DB
        data = {
            "id": job_id,
            "user_id": user_id,
            "symbol": symbol,
            "status": "pending"
        }
        supabase.table("reports").insert(data).execute()
        
        # Fire background task
        self.executor.submit(self._generate_report_background, job_id, symbol, preferences)
        return job_id

    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        response = supabase.table("reports").select("*").eq("id", job_id).execute()
        return response.data[0] if response.data else None
        
    def get_history(self, limit=10):
        response = supabase.table("reports").select("*").order("created_at", desc=True).limit(limit).execute()
        return response.data

    def _generate_report_background(self, job_id: str, symbol: str, preferences: Dict[str, bool]):
        logger.info(f"[Job {job_id}] Started background generation for {symbol}")
        supabase.table("reports").update({"status": "processing"}).eq("id", job_id).execute()
        
        if not self.is_configured:
            supabase.table("reports").update({"status": "failed", "error": "LLM not configured"}).eq("id", job_id).execute()
            return
            
        try:
            context = self.fetch_base_context(symbol)
            prompt = self.build_multi_agent_prompt(symbol, context, preferences)
            
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )
            
            report_data = json.loads(response.text)
            supabase.table("reports").update({
                "status": "completed", 
                "report_data": report_data
            }).eq("id", job_id).execute()
            logger.info(f"[Job {job_id}] DB updated successfully.")
            
        except Exception as e:
            logger.error(f"[Job {job_id}] Generation failed: {str(e)}")
            supabase.table("reports").update({"status": "failed", "error": str(e)}).eq("id", job_id).execute()


