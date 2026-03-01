from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional
from datetime import datetime

@dataclass
class ReportPreferencesContract:
    """
    Strongly typed Data Transfer Object (DTO) defining the boundary
    for what analysis parameters the Report engine accepts.
    """
    fundamental: bool = True
    technical: bool = True
    sentiment: bool = True
    macro: bool = False
    
    def to_dict(self) -> Dict[str, bool]:
        return {
            "fundamental": self.fundamental,
            "technical": self.technical,
            "sentiment": self.sentiment,
            "macro": self.macro
        }

@dataclass
class ReportJobContract:
    """
    Represents the state of an asynchronous report generation job 
    as it moves through the pipeline (Pending -> Processing -> Completed/Failed).
    """
    job_id: str
    symbol: str
    user_id: Optional[str]
    preferences: ReportPreferencesContract
    status: str = "pending"
    created_at: datetime = field(default_factory=datetime.utcnow)
    error_message: Optional[str] = None
    report_data: Optional[Dict[str, Any]] = None

    def is_failed(self) -> bool:
        return self.status == "failed"
        
    def is_completed(self) -> bool:
        return self.status == "completed"

    def serialize_for_client(self) -> Dict[str, Any]:
        return {
            "job_id": self.job_id,
            "symbol": self.symbol,
            "status": self.status,
            "error": self.error_message,
            "report_data": self.report_data,
            "timestamp": self.created_at.isoformat()
        }
