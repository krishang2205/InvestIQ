import sys
import os
import json

# Add backend to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from reports.orchestrator import ReportGenerationOrchestrator
from reports.dependencies import report_di

def test_chat_scenario():
    print("🚀 Initializing InvestIQ Chat System Test...")
    
    # Mock some report data - similar to what would be in Supabase
    mock_report = {
        "header": {
            "symbol": "RELIANCE.NS",
            "company": "Reliance Industries Limited"
        },
        "snapshot": {
            "keyMetrics": [
                {"label": "P/E Ratio", "value": "25.4x"},
                {"label": "Market Cap", "value": "18500B INR"},
                {"label": "Dividend Yield", "value": "0.45%"}
            ]
        },
        "financialAnalysis": {
            "text": "Reliance shows strong growth in retail and telecom. Debt-to-equity remains stable at 0.6."
        }
    }
    
    # We need a job_id that 'exists' in the mock DB or just bypass DB for this unit test
    # Since orchestrator.handle_chat calls db.table("reports").select(...), 
    # we would normally need the MockDbClient to have this data.
    
    print("\n--- TEST 1: Beginner Mentor Query ---")
    msg1 = "What is P/E ratio and why does Reliance have 25.4?"
    
    # For testing, we might need to mock the DB response inside the DI
    # or just use a helper that doesn't hit the DB.
    # Given the task constraints, I'll implement a standalone test that 
    # directly exercises the PromptRegistry and ProviderManager.
    
    try:
        from utils.prompts import PromptRegistry
        prompt = PromptRegistry.construct_chat_prompt(mock_report, msg1)
        
        llm = report_di.get_llm_manager()
        print(f"User: {msg1}")
        response = llm.generate_chat_response(prompt)
        print(f"\nAI Analyst:\n{response}")
        
        print("\n--- TEST 2: Scenario Projection ('What-If') ---")
        msg2 = "What if Reliance revenue grows by 20% next year?"
        prompt2 = PromptRegistry.construct_chat_prompt(mock_report, msg2)
        
        print(f"User: {msg2}")
        response2 = llm.generate_chat_response(prompt2)
        print(f"\nAI Analyst:\n{response2}")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    test_chat_scenario()
