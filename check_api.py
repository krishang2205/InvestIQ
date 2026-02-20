import requests
import json

BASE_URL = "http://127.0.0.1:5001/api/market"

def check_endpoint(endpoint):
    url = f"{BASE_URL}/{endpoint}"
    print(f"Checking {url}...")
    try:
        response = requests.get(url, timeout=30)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(json.dumps(data, indent=2)[:1000]) # Print first 1000 chars
            
            if endpoint == 'movers':
                print("\nGainers Count:", len(data.get('gainers', [])))
                print("Losers Count:", len(data.get('losers', [])))
        else:
            print("Error Response:", response.text)
    except Exception as e:
        print(f"Request Failed: {e}")

if __name__ == "__main__":
    print("--- Testing News ---")
    check_endpoint('news')
