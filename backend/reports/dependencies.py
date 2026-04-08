import logging
import os
from typing import Optional
from config.settings import conf
from services.provider_manager import AIProviderManager
from reports.exceptions import LLMConfigurationError
from datetime import datetime

logger = logging.getLogger(__name__)

# --- In-Memory Mock Database (fallback for local dev without Supabase) ---
MOCK_REPORTS_DB = {}

class MockResponse:
    def __init__(self, data):
        self.data = data

class MockTable:
    def __init__(self, table_name):
        self.table_name = table_name
        self._current_op = None
        self._payload = None
        self._where_col = None
        self._where_val = None
        self._order_col = None
        self._limit = None

    def insert(self, payload):
        self._current_op = 'insert'
        self._payload = payload
        return self

    def update(self, payload):
        self._current_op = 'update'
        self._payload = payload
        return self

    def select(self, cols):
        self._current_op = 'select'
        return self

    def eq(self, col, val):
        self._where_col = col
        self._where_val = val
        return self

    def order(self, col, desc=False):
        self._order_col = col
        return self

    def limit(self, l):
        self._limit = l
        return self

    def execute(self):
        if self._current_op == 'insert':
            if isinstance(self._payload, list):
                for p in self._payload:
                    if 'created_at' not in p: p['created_at'] = datetime.utcnow().isoformat()
                    MOCK_REPORTS_DB[p['id']] = p
            else:
                if 'created_at' not in self._payload:
                    self._payload['created_at'] = datetime.utcnow().isoformat()
                MOCK_REPORTS_DB[self._payload['id']] = self._payload
            return MockResponse(data=[self._payload])

        elif self._current_op == 'update':
            if self._where_col == 'id' and self._where_val in MOCK_REPORTS_DB:
                MOCK_REPORTS_DB[self._where_val].update(self._payload)
            return MockResponse(data=[self._payload])

        elif self._current_op == 'select':
            if self._where_col == 'id':
                val = MOCK_REPORTS_DB.get(self._where_val)
                return MockResponse(data=[val] if val else [])
            else:
                data_list = list(MOCK_REPORTS_DB.values())
                data_list.sort(key=lambda x: x.get('created_at', ''), reverse=True)
                if self._limit:
                    data_list = data_list[:self._limit]
                return MockResponse(data=data_list)
        return MockResponse(data=[])

class MockDbClient:
    def table(self, table_name):
        return MockTable(table_name)
# ----------------------------------------------------

class ReportContainer:
    """
    Dependency Injection Container for the Intelligent Reporting Module.
    Uses real Supabase client when DB_TYPE=supabase, otherwise falls back to mock.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ReportContainer, cls).__new__(cls)
            cls._instance._initialize_services()
        return cls._instance

    def _initialize_services(self):
        db_type = os.environ.get("DB_TYPE", "sqlite").lower()
        
        if db_type == "supabase":
            try:
                from supabase import create_client
                url = os.environ.get("SUPABASE_URL")
                key = os.environ.get("SUPABASE_KEY")
                if url and key:
                    self._db_client = create_client(url, key)
                    logger.info("Initializing Intelligence Report Container (Supabase DB Mode)...")
                else:
                    logger.warning("SUPABASE_URL/KEY missing, falling back to Mock DB.")
                    self._db_client = MockDbClient()
            except Exception as e:
                logger.error(f"Failed to create Supabase client for reports: {e}. Falling back to Mock DB.")
                self._db_client = MockDbClient()
        else:
            logger.info("Initializing Intelligence Report Container (MOCK DB Mode)...")
            self._db_client = MockDbClient()
        
        try:
            self._llm_manager = AIProviderManager()
        except Exception as e:
            logger.error(f"Failed to wire AIProviderManager: {e}")
            self._llm_manager = None
            
        self._is_ready = True

    def get_db_client(self):
        return self._db_client

    def get_llm_manager(self) -> AIProviderManager:
        if not self._llm_manager:
            raise LLMConfigurationError("The LLM Manager dependency is missing or failed to initialize.")
        return self._llm_manager

# Global DI container for the module
report_di = ReportContainer()

