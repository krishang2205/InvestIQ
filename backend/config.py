import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Config:
    ENV: str = os.getenv("ENV", "development")
    PORT: int = int(os.getenv("PORT", "5000"))
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"

    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")

    YAHOO_REGION: str = os.getenv("YAHOO_REGION", "IN")
    DEFAULT_PERIOD: str = os.getenv("DEFAULT_PERIOD", "6mo")
    DEFAULT_INTERVAL: str = os.getenv("DEFAULT_INTERVAL", "1d")

    NEWS_API_KEY: str = os.getenv("NEWS_API_KEY", "")