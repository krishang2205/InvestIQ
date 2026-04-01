import yfinance as yf

symbols = ['TATAMOTORS.NS', 'TMPV.NS', 'TML.NS', 'TMLCV.NS', 'TATAMTRDVR.NS']

print("Checking symbols on Yahoo Finance...")
for symbol in symbols:
    try:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        if 'symbol' in info:
            print(f"✅ {symbol}: {info.get('longName', 'No Name')}")
        else:
            print(f"❌ {symbol}: Not Found")
    except Exception as e:
        print(f"❌ {symbol}: Error - {str(e)}")
