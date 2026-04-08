import logging
from typing import Dict, Any, Optional
import uuid
import time

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
        pipeline_started = time.perf_counter()
        
        try:
            db.table("reports").update({"status": "processing:fetching_data"}).eq("id", job_id).execute()
            
            # ── Step 1: Fetch real live market data from yfinance ─────────────
            stage_started = time.perf_counter()
            market_data = financial_ingestion_engine.fetch_market_context(symbol)
            logger.info(
                f"Job <{job_id}> stage=fetching_data completed in {time.perf_counter() - stage_started:.2f}s"
            )
            
            db.table("reports").update({"status": "processing:analyzing_context"}).eq("id", job_id).execute()
            # ── Step 2: Enrich context for the LLM prompt ────────────────────
            # Pass live fundamentals so Gemini's narrative is grounded in reality
            stage_started = time.perf_counter()
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
            logger.info(
                f"Job <{job_id}> stage=analyzing_context completed in {time.perf_counter() - stage_started:.2f}s"
            )
            
            # ── Step 3: Build the AI prompt with real grounded context ────────
            stage_started = time.perf_counter()
            prompt = PromptRegistry.construct_analysis_prompt(prompt_context, prefs)
            logger.info(
                f"Job <{job_id}> stage=prompt_build completed in {time.perf_counter() - stage_started:.2f}s"
            )
            
            # ── Step 4: Run Gemini, inject real OHLCV chart data into output ──
            db.table("reports").update({"status": "processing:generating_report"}).eq("id", job_id).execute()
            stage_started = time.perf_counter()
            report_json = llm.generate_json(prompt, market_context=market_data)
            # Preserve latest fetched headlines for UI sentiment context (no prompt/schema change).
            if isinstance(report_json, dict):
                report_json["marketNews"] = market_data.get("news", [])[:5]
            logger.info(
                f"Job <{job_id}> stage=generating_report completed in {time.perf_counter() - stage_started:.2f}s"
            )
            
            # ── Step 5: Cache and persist ────────────────────────────────────
            db.table("reports").update({"status": "processing:finalizing"}).eq("id", job_id).execute()
            stage_started = time.perf_counter()
            cache_engine.store_report(symbol, prefs, report_json)
            
            db.table("reports").update({
                "status": "completed",
                "report_data": report_json
            }).eq("id", job_id).execute()
            logger.info(
                f"Job <{job_id}> stage=finalizing completed in {time.perf_counter() - stage_started:.2f}s"
            )
            logger.info(
                f"Job <{job_id}> pipeline=completed total_elapsed={time.perf_counter() - pipeline_started:.2f}s"
            )

        except ConnectionError as ce:
            # Symbol not found or yfinance failed
            logger.error(f"Market data fetch failed for {job_id} ({symbol}): {ce}")
            db.table("reports").update({
                "status": "failed", "error": str(ce)
            }).eq("id", job_id).execute()
        except Exception as e:
            logger.error(f"Orchestrator pipeline failed for {job_id}: {e}")
            logger.info(
                f"Job <{job_id}> pipeline=failed total_elapsed={time.perf_counter() - pipeline_started:.2f}s"
            )
            db.table("reports").update({
                "status": "failed", "error": str(e)
            }).eq("id", job_id).execute()
            raise e
