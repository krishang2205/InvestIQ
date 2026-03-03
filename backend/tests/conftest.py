import os
import pytest
from flask import Flask

# Ensures tests pass without requiring real API keys
os.environ["FLASK_ENV"] = "testing"
os.environ["SUPABASE_URL"] = "http://localhost:8000"
os.environ["SUPABASE_KEY"] = "mock_key_for_testing"
os.environ["GEMINI_API_KEY"] = "mock_gemini_key"

@pytest.fixture
def test_app():
    """
    Creates a dedicated standalone Flask server for the pytest context.
    Overrides normal db/api integrations context to prevent network calls.
    """
    app = Flask(__name__)
    app.config.update({
        "TESTING": True,
        "DEBUG": False,
        "SECRET_KEY": "test_secret_key"
    })

    # Register the isolated v2 reports blueprint
    from reports.api import reports_v2_bp
    app.register_blueprint(reports_v2_bp)

    yield app

@pytest.fixture
def test_client(test_app):
    """
    Yields the werkzeug test client for dispatching mock HTTP requests.
    """
    return test_app.test_client()

@pytest.fixture
def mock_supabase_dependency(monkeypatch):
    """
    Monkeypatches the internal Supabase singleton found in the DI container
    to return synthetic data dictionaries rather than connecting to Postgres.
    """
    class MockTable:
        def select(self, *args, **kwargs): return self
        def insert(self, *args, **kwargs): return self
        def update(self, *args, **kwargs): return self
        def eq(self, *args, **kwargs): return self
        def execute(self): 
            return type('MockResponse', (), {'data': [{'status': 'completed', 'report_data': {}}]})()

    class MockSupabase:
        def table(self, name): return MockTable()

    # Wire it into the DI container
    from reports.dependencies import report_di
    monkeypatch.setattr(report_di, '_db_client', MockSupabase())
    return MockSupabase()
