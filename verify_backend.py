import requests
import json

BASE_URL = "http://127.0.0.1:5001/api/market"

endpoints = [
    "/indices",
    "/mood",
    "/movers",
    "/news"
]

print("Verifying Backend Endpoints...")
print("-" * 30)

for ep in endpoints:
    url = f"{BASE_URL}{ep}"
    try:
        response = requests.get(url, timeout=10)
        print(f"GET {ep}: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            # Print a snippet
            snippet = str(data)[:100] + "..." if len(str(data)) > 100 else str(data)
            print(f"Response: {snippet}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Failed to connect to {ep}: {e}")
    print("-" * 30)
