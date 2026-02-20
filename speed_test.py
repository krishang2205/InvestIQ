import time
import requests

URL = "http://127.0.0.1:5001/api/market/movers?category=large_cap"

def measure():
    start = time.time()
    response = requests.get(URL)
    end = time.time()
    print(f"Time: {end - start:.4f} seconds | Status: {response.status_code}")

print("Call 1 (Cold/Warm):")
measure()

print("Call 2 (Cached):")
measure()
