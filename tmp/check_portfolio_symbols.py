import sqlite3
import os
import yfinance as yf

# Paths
db_path = os.path.join(os.path.dirname(__file__), '..', 'backend', 'data', 'investiq.sqlite3')
db_path = os.path.abspath(db_path)

if not os.path.exists(db_path):
    print(f"Error: Database file not found at {db_path}")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("Fetching unique symbols from transactions...")
cursor.execute("SELECT DISTINCT symbol FROM transactions")
rows = cursor.fetchall()
symbols = [row[0] for row in rows]
print(f"Symbols found: {symbols}")

print("\nTesting symbols with yfinance...")
failed_symbols = []
for sym in symbols:
    # Append .NS if it doesn't have it (basic heuristic used in backend)
    yf_sym = f"{sym}.NS" if "." not in sym else sym
    print(f"Checking {yf_sym}...")
    try:
        ticker = yf.Ticker(yf_sym)
        # Try to get info to trigger an actual data fetch
        info = ticker.info
        if not info or (info.get("regularMarketPrice") is None and info.get("currentPrice") is None):
            print(f"❌ {yf_sym} returned empty or invalid data.")
            failed_symbols.append(yf_sym)
        else:
            print(f"✅ {yf_sym} is OK.")
    except Exception as e:
        print(f"❌ {yf_sym} raised an error: {e}")
        failed_symbols.append(yf_sym)

print("\n--- SUMMARY ---")
if failed_symbols:
    print(f"The following symbols are failing and causing timeouts: {failed_symbols}")
else:
    print("All symbols in your portfolio appear to be working perfectly with yfinance.")

conn.close()
