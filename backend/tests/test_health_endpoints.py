import pytest
import json
from unittest.mock import patch

def test_liveness_probe_returns_200(test_client):
    """
    Asserts that the basic Kubernetes liveness probe rapidly returns standard HTTP 200
    confirming that the Flask main thread is unbound and routing traffic.
    """
    # Need to manually register the health blueprint on test_app for this specific suite
    from reports.health import health_bp
    
    # Using app context to ensure we don't break subsequent tests
    test_client.application.register_blueprint(health_bp)
    
    response = test_client.get('/api/v2/health/')
    assert response.status_code == 200
    
    data = response.get_json()
    assert data["status"] == "healthy"
    assert "investiq-reports-api" in data["service"]

def test_deep_readiness_probe_success(test_client, mock_supabase_dependency):
    """
    Verifies that when all internal subsystems (DB, LLMs) are actively connected,
    the readiness endpoint provides a 200 Fully Operational flag to load balancers.
    """
    with patch('reports.dependencies.ReportContainer.get_llm_manager') as mock_llm:
        # Configure the mock to pretend it's completely ready
        instance = mock_llm.return_value
        instance.providers_ready = {"gemini": True}
        
        response = test_client.get('/api/v2/health/deep')
        
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "fully_operational"
        assert data["dependencies"]["database"] == "operational"
        assert data["dependencies"]["llm_manager"] == "operational"

def test_deep_readiness_probe_degraded(test_client, mock_supabase_dependency):
    """
    Verifies that if a downstream dependency collapses (e.g. LLM API Key revoked),
    the endpoint signals a 503 so Kubernetes can evict the pod from rotation.
    """
    with patch('reports.dependencies.ReportContainer.get_llm_manager') as mock_llm:
        instance = mock_llm.return_value
        instance.providers_ready = {"gemini": False} # Simulate outage
        
        response = test_client.get('/api/v2/health/deep')
        
        assert response.status_code == 503
        data = response.get_json()
        assert data["status"] == "degraded"
        assert data["dependencies"]["llm_manager"] == "offline"
