import logging
from typing import Dict, Any, Optional
import uuid

from reports.contracts import ReportJobContract, ReportPreferencesContract
from reports.dependencies import report_di
from reports.queue.worker import worker_pool
from reports.ingestion.financial_adapter import financial_ingestion_engine
from reports.cache.report_cache import cache_engine
from utils.prompts import PromptRegistry

logger = logging.getLogger(__name__)

class ReportGenerationOrchestrator:
    """
    The Core Application Service (Use-Case Interactor) for the bounds of Report Generation.
    Coordinates between Caching, DB, Queues, Data ingestion, and the AI providers.
    """
    
    @staticmethod
    def initiate_report(symbol: str, user_id: str, prefs: Dict[str, bool]) -> str:
        db = report_di.get_db_client()
        job_id = str(uuid.uuid4())
        
        # 1. Look for a cached response first
        cached = cache_engine.get_cached_report(symbol, prefs)
        if cached:
            logger.info(f"Serving cache for {job_id}")
            # Insert direct-completed record for historical matching
            db.table("reports").insert({
                "id": job_id, "user_id": user_id, "symbol": symbol,
                "status": "completed", "report_data": cached
            }).execute()
            return job_id

        # 2. Persist initial pending state
        logger.debug(f"Creating new Job Record in DB: {job_id}")
        db.table("reports").insert({
            "id": job_id, "user_id": user_id, "symbol": symbol, "status": "pending"
        }).execute()
        
        # 3. Offload to local queue or Celery
        worker_pool.submit_job(
            job_id=job_id,
            target_func=ReportGenerationOrchestrator._background_process,
            args=(),
            kwargs={"job_id": job_id, "symbol": symbol, "prefs": prefs}
        )
        return job_id

    @staticmethod
    def _background_process(job_id: str, symbol: str, prefs: Dict[str, bool]):
        db = report_di.get_db_client()
        llm = report_di.get_llm_manager()
        
        try:
            db.table("reports").update({"status": "processing"}).eq("id", job_id).execute()
            
            # Fetch contextual market data
            market_data = financial_ingestion_engine.fetch_market_context(symbol)
            
            # Formulate the multi-agent context window
            prompt = PromptRegistry.construct_analysis_prompt(market_data, prefs)
            
            # Ping AI
            report_json = llm.generate_json(prompt)
            
            # Cache for future incoming requests
            cache_engine.store_report(symbol, prefs, report_json)
            
            db.table("reports").update({
                "status": "completed",
                "report_data": report_json
            }).eq("id", job_id).execute()
        except Exception as e:
            logger.error(f"Orchestrator pipeline failed for {job_id}: {e}")
            db.table("reports").update({
                "status": "failed", "error": str(e)
            }).eq("id", job_id).execute()
            raise e
