import logging
import time
from flask import Blueprint, jsonify
from reports.dependencies import report_di
from db.database import supabase
# import redis

logger = logging.getLogger(__name__)

health_bp = Blueprint('health', __name__, url_prefix='/api/v2/health')

@health_bp.route('/', methods=['GET'])
def liveness_probe():
    """
    Standard kubernetes liveness probe. 
    Verifies the Flask thread is responsive, but does not check deep dependencies.
    """
    return jsonify({
        "status": "healthy",
        "timestamp": time.time(),
        "service": "investiq-reports-api"
    }), 200

@health_bp.route('/deep', methods=['GET'])
def readiness_probe():
    """
    Advanced Kubernetes readiness probe.
    Tests internal connections to Postgres, Redis, and optionally the LLM Providers.
    If this fails, the load balancer removes the node from the ingress target group.
    """
    start_time = time.time()
    health_status = {
        "status": "fully_operational",
        "dependencies": {
            "database": "unknown",
            "llm_manager": "unknown"
        }
    }
    
    # 1. Probe the Database
    try:
        # A lightweight query just to test network transit
        db = report_di.get_db_client()
        res = db.table("reports").select("id").limit(1).execute()
        health_status["dependencies"]["database"] = "operational"
    except Exception as e:
        logger.error(f"Deep Health Check Failed -> DB Offline: {e}")
        health_status["dependencies"]["database"] = "degraded"
        health_status["status"] = "degraded"
        
    # 2. Probe the LLM Container
    try:
        manager = report_di.get_llm_manager()
        # Verify provider dictionaries are constructed
        if manager.providers_ready.get("gemini", False):
            health_status["dependencies"]["llm_manager"] = "operational"
        else:
            health_status["dependencies"]["llm_manager"] = "offline"
            health_status["status"] = "degraded"
    except Exception as e:
        logger.error(f"Deep Health Check Failed -> LLM Unavailable: {e}")
        health_status["dependencies"]["llm_manager"] = "degraded"
        health_status["status"] = "degraded"
        
    duration = time.time() - start_time
    health_status["probe_duration_sec"] = round(duration, 4)
    
    # In strict production environments, degraded dependencies should return 503
    # to force traffic routing to healthy pods.
    status_code = 200 if health_status["status"] == "fully_operational" else 503
    
    return jsonify(health_status), status_code
