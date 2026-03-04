import pytest
from reports.contracts import ReportPreferencesContract, ReportJobContract

def test_preferences_contract_defaults():
    """Validates that a blank preferences contract initializes with secure defaults."""
    prefs = ReportPreferencesContract()
    
    assert prefs.fundamental is True
    assert prefs.technical is True
    assert prefs.sentiment is True
    assert prefs.macro is False # Macro disabled by default for API token limits

def test_preferences_contract_serialization():
    """Asserts that dictionary serialization behaves exactly as required by the Orchestrator."""
    prefs = ReportPreferencesContract(macro=True, sentiment=False)
    output = prefs.to_dict()
    
    expected = {
        "fundamental": True,
        "technical": True,
        "sentiment": False,
        "macro": True
    }
    assert output == expected

def test_report_job_contract_state_mutations():
    """
    Ensures that the state machine behaviors embedded in the Job Contract record 
    act predictably before they are written to the database.
    """
    prefs = ReportPreferencesContract()
    job = ReportJobContract(
        job_id="test-uuid",
        symbol="MSFT",
        user_id="user-123",
        preferences=prefs
    )
    
    assert job.status == "pending"
    assert not job.is_completed()
    assert not job.is_failed()
    
    # Simulate pipeline failure
    job.status = "failed"
    job.error_message = "Network timeout"
    
    assert job.is_failed()
    
    serialized = job.serialize_for_client()
    assert serialized["error"] == "Network timeout"
    assert serialized["job_id"] == "test-uuid"
    assert serialized["status"] == "failed"
