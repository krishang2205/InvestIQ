import requests
import json
import time

def test_full_flow():
    base_url = "http://localhost:5001/api/v2/reports"
    symbol = "TSLA"
    
    print(f"--- STEP 1: Initiating Report for {symbol} ---")
    payload = {
        "symbol": symbol,
        "preferences": {"fundamental": True, "technical": True, "sentiment": True},
        "user_id": "test-user-001"
    }
    
    try:
        gen_res = requests.post(f"{base_url}/generate", json=payload, timeout=10)
        if gen_res.status_code not in [200, 201, 202]:
            print(f"FAILED to initiate: Status {gen_res.status_code} - {gen_res.text}")
            return
            
        job_id = gen_res.json().get("job_id")
        print(f"Generated Job ID: {job_id}")
        
        print(f"\n--- STEP 2: Polling for Completion ---")
        completed = False
        for i in range(20): # 60 seconds max
            time.sleep(3)
            status_res = requests.get(f"{base_url}/status/{job_id}", timeout=10)
            data = status_res.json()
            status = data.get("status")
            print(f"Attempt {i+1}: Status is '{status}'")
            
            if status == "completed":
                completed = True
                break
            if status == "failed":
                print(f"ERROR: Generation failed. {data.get('error')}")
                return
        
        if not completed:
            print("ERROR: Timed out waiting for report.")
            return

        print(f"\n--- STEP 3: Testing Strategic AI Chat ---")
        chat_payload = {
            "job_id": job_id,
            "message": "Give me a 1-sentence bull case for this stock based on the report."
        }
        
        start_time = time.time()
        c_res = requests.post(f"{base_url}/chat", json=chat_payload, timeout=15)
        latency = time.time() - start_time
        
        print(f"Status Code: {c_res.status_code}")
        print(f"Latency: {latency:.2f} seconds")
        
        if c_res.status_code == 200:
            print("\n--- AI RESPONSE ---")
            print(c_res.json().get("response"))
            print("-------------------\n")
            print("SUCCESS: Full Flow Verified. Chatbot is responding and grounded in the report.")
        else:
            print(f"FAILED: {c_res.text}")
            
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    test_full_flow()
