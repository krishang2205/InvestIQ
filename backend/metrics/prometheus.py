import time
from typing import Dict, Any
from flask import request
# from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST

# Placeholder for real prometheus classes. Architecture definition.
class MockCounter:
    def labels(self, *args, **kwargs): return self
    def inc(self): pass
class MockHistogram:
    def labels(self, *args, **kwargs): return self
    def observe(self, val): pass

# Core Metrics Defines
HTTP_REQUEST_DURATION = MockHistogram() # Histogram('http_request_duration_seconds', 'HTTP request duration', ['method', 'endpoint'])
HTTP_REQUEST_COUNT = MockCounter() # Counter('http_requests_total', 'Total HTTP Requests', ['method', 'endpoint', 'status'])
LLM_GENERATION_DURATION = MockHistogram() # Histogram('llm_generation_seconds', 'LLM Provider Latency', ['provider'])
LLM_FAILURE_COUNT = MockCounter() # Counter('llm_failures_total', 'LLM Provider Failures', ['provider', 'reason'])

def init_metrics_middleware(app):
    """
    Attaches Prometheus-compatible middleware to trace global application state.
    Exposes an internal `/metrics` endpoint for standard Grafana scraping.
    """
    
    @app.before_request
    def before_request():
        request.start_time = time.time()

    @app.after_request
    def after_request(response):
        if not hasattr(request, 'start_time'):
            return response
            
        # Do not measure the metrics endpoint itself
        if request.path == '/metrics':
            return response

        request_latency = time.time() - request.start_time
        
        # Observe the general latency
        HTTP_REQUEST_DURATION.labels(
            method=request.method, 
            endpoint=request.endpoint or request.path
        ).observe(request_latency)
        
        # Count the absolute request
        HTTP_REQUEST_COUNT.labels(
            method=request.method,
            endpoint=request.endpoint or request.path,
            status=response.status_code
        ).inc()

        return response
        
    @app.route('/metrics')
    def metrics_scrape_endpoint():
        """Scrape target for Promtail / Prometheus."""
        # return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}
        return "mock_prometheus_payload\\n", 200, {'Content-Type': 'text/plain'}
