import time
import logging
import uuid
from typing import Dict, Any, Callable
from db.database import supabase
from functools import wraps

logger = logging.getLogger(__name__)

class PerformanceMetricsService:
    """
    Asynchronously logs specific performance metrics (like LLM latency, token counts)
    to the Supabase telemetry tables for real-time dashboarding.
    """
    
    @staticmethod
    def log_latency(job_id: str, provider: str, duration_sec: float, success: bool):
        try:
            logger.debug(f"Logging AI latency metric: {duration_sec}s for {provider}")
            metric_data = {
                "id": str(uuid.uuid4()),
                "job_id": job_id,
                "provider": provider,
                "duration_seconds": duration_sec,
                "success": success
            }
            # Attempt to insert, ignore if table doesn't exist yet
            supabase.table("ai_metrics").insert(metric_data).execute()
        except Exception as e:
            # We explicitly catch and swallow telemetry errors so they don't break the app
            logger.warning(f"Telemetry logging failed, skipping. {e}")

def measure_generation_time(provider_name: str="gemini"):
    """
    Decorator to wrap any LLM generation call, automatically measuring
    latency and pushing it to the metrics service.
    Requires the decorated function to receive/return job_id in some identifiable way,
    or we can generate a random tracking ID.
    """
    def decorator(f: Callable):
        @wraps(f)
        def wrapper(*args, **kwargs):
            start_time = time.time()
            success = True
            try:
                result = f(*args, **kwargs)
                return result
            except Exception as e:
                success = False
                raise e
            finally:
                duration = time.time() - start_time
                job_id = kwargs.get('job_id', str(uuid.uuid4()))
                PerformanceMetricsService.log_latency(job_id, provider_name, duration, success)
        return wrapper
    return decorator
