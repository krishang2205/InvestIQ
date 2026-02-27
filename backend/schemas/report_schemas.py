from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class ReportGenerationRequestSchema:
    """
    Strict payload validation schema for Report Generation requests.
    Validates symbol formats, required fields, and preference configurations.
    """
    def __init__(self, data: Dict[str, Any]):
        self.data = data
        self.errors = {}
        self._validate()

    def _validate(self):
        symbol = self.data.get("symbol")
        if not symbol:
            self.errors["symbol"] = "Symbol is required"
        elif not isinstance(symbol, str):
            self.errors["symbol"] = "Symbol must be a string"
        elif len(symbol) > 15:
            self.errors["symbol"] = "Symbol string is excessively long"

        prefs = self.data.get("preferences")
        if prefs is not None:
            if not isinstance(prefs, dict):
                self.errors["preferences"] = "Preferences must be an object"
            else:
                valid_keys = {"fundamental", "technical", "sentiment", "macro"}
                for k, v in prefs.items():
                    if k not in valid_keys:
                        self.errors[f"preferences.{k}"] = "Invalid preference key"
                    elif not isinstance(v, bool):
                        self.errors[f"preferences.{k}"] = "Preference value must be boolean"

        user_id = self.data.get("user_id")
        if user_id is not None and not isinstance(user_id, str):
            self.errors["user_id"] = "User ID must be a string UUID"

    def is_valid(self) -> bool:
        return len(self.errors) == 0

    def get_errors(self) -> Dict[str, str]:
        return self.errors

    def get_validated_data(self) -> Dict[str, Any]:
        if not self.is_valid():
            raise ValueError("Attempted to access invalid data")
        
        return {
            "symbol": self.data.get("symbol", "").upper(),
            "preferences": self.data.get("preferences", {
                "fundamental": True,
                "technical": True,
                "sentiment": True,
                "macro": False
            }),
            "user_id": self.data.get("user_id")
        }

def validate_json_payload(payload):
    schema = ReportGenerationRequestSchema(payload)
    return schema.is_valid(), schema.get_errors()
