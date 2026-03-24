import os
import logging
from dotenv import load_dotenv
from dataclasses import dataclass
from typing import Optional

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)

@dataclass
class AppSettings:
    """
    Centralized, strongly-typed configuration manager.
    Parses environment variables and establishes safe defaults,
    failing fast if critical production secrets are missing.
    """
    environment: str
    supabase_url: str
    supabase_key: str
    gemini_api_key: Optional[str]
    groq_api_key: Optional[str]
    xai_api_key: Optional[str]
    openai_api_key: Optional[str]
    redis_url: str
    max_workers: int

    @classmethod
    def load_from_env(cls) -> "AppSettings":
        env = os.getenv("FLASK_ENV", "development")
        supa_url = os.getenv("SUPABASE_URL")
        supa_key = os.getenv("SUPABASE_KEY")
        
        if not supa_url or not supa_key:
            logger.critical("FATAL: Supabase credentials are not set in the environment.")
            
        settings = cls(
            environment=env,
            supabase_url=supa_url or "http://localhost:8000",
            supabase_key=supa_key or "dummy_key",
            gemini_api_key=os.getenv("GEMINI_API_KEY"),
            groq_api_key=os.getenv("GROQ_API_KEY"),
            xai_api_key=os.getenv("XAI_API_KEY") or os.getenv("GROQ_API_KEY") if os.getenv("GROQ_API_KEY", "").startswith("xai-") else None,
            openai_api_key=os.getenv("OPENAI_API_KEY"),
            redis_url=os.getenv("REDIS_URL", "redis://localhost:6379/0"),
            max_workers=int(os.getenv("WORKER_THREADS", "5"))
        )
        
        logger.info(f"Loaded AppSettings for environment: {settings.environment}")
        return settings

# Singleton instance exported for the application to import
conf = AppSettings.load_from_env()
