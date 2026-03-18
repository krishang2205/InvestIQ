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
            
            # ── Step 1: Fetch real live market data from yfinance ─────────────
            market_data = financial_ingestion_engine.fetch_market_context(symbol)
            
            # ── Step 2: Enrich context for the LLM prompt ────────────────────
            # Pass live fundamentals so Gemini's narrative is grounded in reality
            meta = market_data.get("company_meta", {})
            fund = market_data.get("fundamentals", {})
            prompt_context = {
                "symbol": symbol,
                "volatility": f"{market_data.get('volatility', 'N/A')}% annualised",
                "fundamentals": {
                    "current_price": market_data.get("current_price"),
                    "currency": meta.get("currency", "USD"),
                    "exchange": meta.get("exchange"),
                    "sector": meta.get("sector"),
                    "industry": meta.get("industry"),
                    "market_cap_billions": fund.get("market_cap_billions"),
                    "pe_ratio": fund.get("pe_ratio"),
                    "pb_ratio": fund.get("pb_ratio"),
                    "roe_percent": fund.get("roe"),
                    "profit_margin_percent": fund.get("profit_margin"),
                    "debt_to_equity": fund.get("debt_to_equity"),
                    "dividend_yield_percent": fund.get("dividend_yield"),
                    "52w_high": market_data.get("fifty_two_week_high"),
                    "52w_low": market_data.get("fifty_two_week_low"),
                    "50d_avg": market_data.get("fifty_day_avg"),
                    "200d_avg": market_data.get("two_hundred_day_avg"),
                    "price_change_pct_today": market_data.get("price_change_pct"),
                    "beta": fund.get("beta"),
                    "free_cashflow_billions": fund.get("free_cashflow_billions"),
                    "employees": meta.get("employees"),
                    "company_description": meta.get("description", ""),
                },
            }
            
            # ── Step 3: Build the AI prompt with real grounded context ────────
            prompt = PromptRegistry.construct_analysis_prompt(prompt_context, prefs)
            
            # ── Step 4: Run Gemini, inject real OHLCV chart data into output ──
            report_json = llm.generate_json(prompt, market_context=market_data)
            
            # ── Step 5: Cache and persist ────────────────────────────────────
            cache_engine.store_report(symbol, prefs, report_json)
            
            db.table("reports").update({
                "status": "completed",
                "report_data": report_json
            }).eq("id", job_id).execute()

        except ConnectionError as ce:
            # Symbol not found or yfinance failed
            logger.error(f"Market data fetch failed for {job_id} ({symbol}): {ce}")
            db.table("reports").update({
                "status": "failed", "error": str(ce)
            }).eq("id", job_id).execute()
        except Exception as e:
            logger.error(f"Orchestrator pipeline failed for {job_id}: {e}")
            db.table("reports").update({
                "status": "failed", "error": str(e)
            }).eq("id", job_id).execute()
            raise e

    @staticmethod
    def handle_chat(job_id: str, message: str, history: str = "") -> str:
        """
        Processes a chat message by retrieving the associated report data
        and using the LLM provider to generate a grounded response.
        
        Args:
            job_id: The unique ID of the previously generated report.
            message: The user's question or scenario projection request.
            history: Previous chat context for stateful conversation.
            
        Returns:
            str: The AI-generated response text.
            
        Raises:
            ValueError: If the report job doesn't exist or isn't completed.
        """
        db = report_di.get_db_client()
        llm = report_di.get_llm_manager()
        
        logger.debug(f"Retrieving report context for chat session: {job_id}")
        
        # 1. Fetch the original report data from Supabase/DB
        res = db.table("reports").select("report_data, status, symbol").eq("id", job_id).execute()
        
        if not res.data:
            raise ValueError(f"Report Job {job_id} not found.")
            
        record = res.data[0]
        if record["status"] != "completed":
            raise ValueError(f"Report Job {job_id} is in status '{record['status']}'. Chat is only available for completed reports.")
            
        report_data = record.get("report_data")
        symbol = record.get("symbol")
        
        if not report_data:
            logger.error(f"Report data missing for completed job {job_id}")
            raise ValueError("Report data is missing from the record.")

        # 2. Build the chat-specific prompt using our PromptRegistry
        # This injects the report JSON and history into the Strategic Analyst persona
        chat_prompt = PromptRegistry.construct_chat_prompt(
            report_data=report_data,
            message=message,
            history=history
        )
        
        logger.info(f"Generating chat response for {symbol} (Job: {job_id})")
        
        # 3. Use the AI provider manager to get a response
        # Note: We use the general generation method but since the prompt has 
        # instructions for prose/markdown, we expect a string response.
        response = llm.generate_chat_response(chat_prompt)
        
        return response
