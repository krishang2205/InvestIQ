import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class SecuritySanitizer:
    """
    Prevents Prompt Injection attacks and strips unescaped characters 
    before arbitrary user input ever reaches the LLM architecture.
    """
    
    # Simple regex to strip markdown links, xml blocks, or common injection markers
    DANGEROUS_PATTERNS = [
        re.compile(r"\[.*?\]\(.*?\)"), # Markdown links
        re.compile(r"<.*?>"),          # HTML/XML tags
        re.compile(r"(ignore\b|forget\b)(.*)(instructions|rules)", re.IGNORECASE)
    ]

    @classmethod
    def sanitize_symbol(cls, symbol: str) -> str:
        """Removes anything that isn't alphanumeric or dot (for indices)."""
        if not symbol:
            return ""
        
        # Keep only A-Z, 0-9, and .
        clean = re.sub(r'[^A-Za-z0-9\.]', '', symbol)
        return clean.upper()

    @classmethod
    def sanitize_prompt_text(cls, raw_text: str) -> str:
        """Strips out obvious prompt injection attempts from generalized text blocks."""
        if not raw_text:
            return ""
            
        cleaned = str(raw_text)
        for pattern in cls.DANGEROUS_PATTERNS:
            # Replace matches with safe brackets to indicate censorship
            cleaned = pattern.sub("[REDACTED]", cleaned)
            
        if cleaned != raw_text:
            logger.warning("Sanitizer engaged: Potential prompt injection or invalid formatting blocked.")
            
        return cleaned

    @classmethod
    def scrub_pii(cls, user_data: Dict[str, Any]) -> Dict[str, Any]:
        """Ensures email addresses or SSNs in a generic record are censored before logging."""
        scrubbed = dict(user_data)
        if "email" in scrubbed:
            scrubbed["email"] = "[REDACTED]@masked.com"
        if "phone" in scrubbed:
            scrubbed["phone"] = "***-***-****"
        return scrubbed
