import logging
from typing import Optional
from config.settings import conf
from db.database import supabase
from services.provider_manager import AIProviderManager
from reports.exceptions import LLMConfigurationError

logger = logging.getLogger(__name__)

class ReportContainer:
    """
    Dependency Injection Container for the Intelligent Reporting Module.
    Ensures that services are instantiated as singletons lazily, 
    and handles graceful degradation if providers are offline.
    """
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ReportContainer, cls).__new__(cls)
            cls._instance._initialize_services()
        return cls._instance

    def _initialize_services(self):
        logger.info("Initializing Intelligence Report Dependency Container...")
        self._db_client = supabase
        
        try:
            self._llm_manager = AIProviderManager()
        except Exception as e:
            logger.error(f"Failed to wire AIProviderManager: {e}")
            self._llm_manager = None
            
        self._is_ready = True

    def get_db_client(self):
        """Returns the configured Supabase client."""
        if not self._db_client:
            raise RuntimeError("Database client was not initialized properly.")
        return self._db_client

    def get_llm_manager(self) -> AIProviderManager:
        """Returns the fallback-enabled Generative AI Manager."""
        if not self._llm_manager:
            raise LLMConfigurationError("The LLM Manager dependency is missing or failed to initialize.")
        return self._llm_manager

    def verify_health(self) -> bool:
        """Validates that all core dependencies are wired and responsive."""
        return self._is_ready and self._db_client is not None and self._llm_manager is not None

# Global DI container for the module
report_di = ReportContainer()
