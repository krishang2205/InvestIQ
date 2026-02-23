import os
import json
import uuid
import logging
import copy
import google.generativeai as genai
from typing import Dict, Any, Optional
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger(__name__)

class ReportService:
    """
    Intelligent Report Generation Service with Background Processing.
    """
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.is_configured = False
        self.executor = ThreadPoolExecutor(max_workers=3)
        self.jobs: Dict[str, Dict[str, Any]] = {}  # In-memory store (to be replaced by DB)
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
            logger.warning("GEMINI_API_KEY environment variable is not set. LLM disabled.")

    def health_check(self) -> bool:
        return self.is_configured

    def fetch_base_context(self, symbol: str) -> Dict[str, Any]:
        """Fetch real context from APIs. Using mock for now."""
        logger.info(f"Gathering base context for {symbol}")
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

    def submit_report_job(self, symbol: str, preferences: Dict[str, bool]) -> str:
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = {"status": "pending", "symbol": symbol, "report_data": None, "error": None}
        
        # Fire background task
        self.executor.submit(self._generate_report_background, job_id, symbol, preferences)
        return job_id

    def get_job_status(self, job_id: str) -> Optional[Dict[str, Any]]:
        return self.jobs.get(job_id)

    def _generate_report_background(self, job_id: str, symbol: str, preferences: Dict[str, bool]):
        logger.info(f"[Job {job_id}] Started background generation for {symbol}")
        self.jobs[job_id]["status"] = "processing"
        
        if not self.is_configured:
            self.jobs[job_id]["status"] = "failed"
            self.jobs[job_id]["error"] = "LLM not configured"
            return
            
        try:
            context = self.fetch_base_context(symbol)
            prompt = self.build_multi_agent_prompt(symbol, context, preferences)
            
            response = self.model.generate_content(
                prompt,
                generation_config=genai.GenerationConfig(response_mime_type="application/json")
            )
            
            report_data = json.loads(response.text)
            self.jobs[job_id]["report_data"] = report_data
            self.jobs[job_id]["status"] = "completed"
            logger.info(f"[Job {job_id}] Generation sequence completed successfully.")
            
        except Exception as e:
            logger.error(f"[Job {job_id}] Generation failed: {str(e)}")
            self.jobs[job_id]["status"] = "failed"
            self.jobs[job_id]["error"] = str(e)

