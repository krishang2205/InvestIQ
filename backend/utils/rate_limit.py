import time
import logging
from functools import wraps
from flask import request, jsonify

logger = logging.getLogger(__name__)

class RateLimiter:
    """
    In-memory Token Bucket rate limiting algorithm.
    For true production, this would be backed by Redis `INCR` and `EXPIRE`.
    This serves as our fallback resilient rate limit enforcement.
    """
    def __init__(self, capacity: int, refill_rate_per_sec: float):
        self.capacity = capacity
        self.refill_rate = refill_rate_per_sec
        self.buckets = {}  # Map of IP/UserToken -> dict(tokens, last_refill)
        
    def _refill(self, key: str):
        now = time.time()
        if key not in self.buckets:
            self.buckets[key] = {'tokens': self.capacity, 'last_refill': now}
            return
            
        bucket = self.buckets[key]
        time_passed = now - bucket['last_refill']
        tokens_to_add = time_passed * self.refill_rate
        
        bucket['tokens'] = min(self.capacity, bucket['tokens'] + tokens_to_add)
        bucket['last_refill'] = now

    def consume(self, key: str, tokens: int = 1) -> bool:
        self._refill(key)
        bucket = self.buckets[key]
        
        if bucket['tokens'] >= tokens:
            bucket['tokens'] -= tokens
            return True
        return False

# Global ratelimiter instance (e.g. 10 requests per minute)
global_limiter = RateLimiter(capacity=10, refill_rate_per_sec=10/60.0)

def rate_limit(limit_type="ip"):
    def decorator(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            key = request.remote_addr if limit_type == "ip" else request.headers.get("Authorization", "anonymous")
            
            if not global_limiter.consume(key):
                logger.warning(f"Rate limit exceeded for {key}")
                return jsonify({
                    "error": "Rate limit exceeded. Please try again later.",
                    "retry_after": 60 
                }), 429
                
            return f(*args, **kwargs)
        return wrapped
    return decorator
