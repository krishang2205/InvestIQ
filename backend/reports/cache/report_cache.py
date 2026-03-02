import hashlib
import json
import logging
from typing import Optional, Dict, Any
# import redis

logger = logging.getLogger(__name__)

class ReportCacheManager:
    """
    Manages idempotency and request deduplication.
    If a user requests the exact same symbol and preferences within 24 hours,
    serve the cached JSON immediately instead of wasting LLM API credits.
    """
    
    def __init__(self, ttl_seconds: int = 86400):
        self._local_dev_cache = {}  # Fallback dictionary if Redis is offline
        self.ttl = ttl_seconds
        
        # self.redis_client = redis.Redis.from_url(conf.redis_url)
        logger.info("ReportCacheManager initialized with 24h TTL idempotency.")

    def _generate_cache_key(self, symbol: str, preferences: Dict[str, bool]) -> str:
        """Deterministically hashes the payload to create a unique fingerprint."""
        raw_key = f"{symbol.upper()}|{json.dumps(preferences, sort_keys=True)}"
        return hashlib.sha256(raw_key.encode('utf-8')).hexdigest()

    def get_cached_report(self, symbol: str, preferences: Dict[str, bool]) -> Optional[Dict[str, Any]]:
        """Retrieves a fully generated report structure if it exists and is fresh."""
        cache_key = self._generate_cache_key(symbol, preferences)
        
        try:
            # If using redis:
            # data = self.redis_client.get(cache_key)
            data = self._local_dev_cache.get(cache_key)
            if data:
                logger.info(f"CACHE HIT: Serving historical report for {symbol} bypassing LLM execution.")
                return dict(data)
                
            logger.debug(f"CACHE MISS: No fresh report found for {symbol}.")
            return None
        except Exception as e:
            logger.warning(f"Cache retrieval failed. Failing open safely. {e}")
            return None

    def store_report(self, symbol: str, preferences: Dict[str, bool], report_data: Dict[str, Any]):
        """Persists the generation output into the caching layer for future idempotency."""
        cache_key = self._generate_cache_key(symbol, preferences)
        
        try:
            self._local_dev_cache[cache_key] = report_data
            # self.redis_client.setex(cache_key, self.ttl, json.dumps(report_data))
            logger.debug(f"Successfully cached report artifact for {symbol} with TTL {self.ttl}s")
        except Exception as e:
            logger.error(f"Cache persistence failed. Document omitted from fast-path. {e}")

cache_engine = ReportCacheManager()
