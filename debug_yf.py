import yfinance as yf
import pandas as pd

def test_indices():
    print("Testing Indices...")
    tickers = ['^NSEI', '^BSESN']
    for symbol in tickers:
        print(f"Fetching {symbol}...")
        try:
            ticker = yf.Ticker(symbol)
            # Try fast_info
            try:
                price = ticker.fast_info.last_price
                print(f"  fast_info price: {price}")
            except Exception as e:
                print(f"  fast_info failed: {e}")

            # Try history
            hist = ticker.history(period="2d")
            print(f"  history (2d):\n{hist}")
        except Exception as e:
            print(f"  Error: {e}")

def test_movers():
    print("\nTesting Movers Batch...")
    tickers = ['RELIANCE.NS', 'TCS.NS']
    try:
        data = yf.download(tickers, period="2d", group_by='ticker', progress=False)
        print("Batch Data Sample:")
        print(data)
        
        for t in tickers:
            if t in data.columns.levels[0]:
                print(f"\nData for {t}:")
                print(data[t])
            else:
                print(f"\nNo data for {t}")
    except Exception as e:
        print(f"Batch Error: {e}")

if __name__ == "__main__":
    test_indices()
    test_movers()
