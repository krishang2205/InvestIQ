import sys
import os
import json
import logging

# Setup path
sys.path.append(os.getcwd())

from services.provider_manager import AIProviderManager

# Configure root logger to see the "Trying xAI" messages
logging.basicConfig(level=logging.INFO)

def test_reliance():
    ai = AIProviderManager()
    
    # Identify symbol
    symbol = "RELIANCE.NS"
    prompt = f"Perform a deep-dive financial analysis for {symbol}."
    
    print(f"\n--- TESTING {symbol} ---")
    print(f"Providers Ready: {ai.providers_ready}")
    
    try:
        data = ai.generate_json(prompt)
        
        if "MOCK" in str(data.get("company_meta", {}).get("name", "")):
            print("❌ RESULT: MOCK")
        else:
            print(f"✅ RESULT: REAL ({data.get('company_meta', {}).get('name')})")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_reliance()
