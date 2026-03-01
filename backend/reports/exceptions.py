import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class ReportDomainException(Exception):
    """Base exception for all Intelligent Report domain errors."""
    def __init__(self, message: str, status_code: int = 500, payload: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.payload = payload
        logger.error(f"DomainException({status_code}): {message}")

    def to_dict(self) -> Dict[str, Any]:
        rv = dict(self.payload or ())
        rv['error'] = self.message
        return rv

class LLMConfigurationError(ReportDomainException):
    """Raised when the generative AI models fail to configure or authenticate."""
    def __init__(self, message: str = "LLM Provider is not properly configured.", payload=None):
        super().__init__(message, status_code=503, payload=payload)

class ReportGenerationTimeoutError(ReportDomainException):
    """Raised when the models take too long to generate a synthesis."""
    def __init__(self, message: str = "The AI generation sequence timed out.", payload=None):
        super().__init__(message, status_code=504, payload=payload)
        
class DataIngestionError(ReportDomainException):
    """Raised when external financial data sources are unreachable."""
    def __init__(self, message: str = "Failed to ingest required financial context.", payload=None):
        super().__init__(message, status_code=502, payload=payload)

class InvalidAnalysisPreferenceError(ReportDomainException):
    """Raised when user requests an analysis dimension that is disabled or invalid."""
    def __init__(self, message: str = "The requested analysis preference is invalid.", payload=None):
        super().__init__(message, status_code=400, payload=payload)
