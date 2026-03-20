import yfinance as yf

# Simple mapping (later you can replace with NSE sector-based peers)
SECTOR_PEERS = {
    "Consumer Defensive": ["HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "DABUR.NS"],
    "Energy": ["RELIANCE.NS", "ONGC.NS", "BPCL.NS", "IOC.NS"],
    "Financial Services": ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS"],
    "Technology": ["INFY.NS", "TCS.NS", "WIPRO.NS", "HCLTECH.NS"],
}

def _safe(v, default=None):
    return v if v is not None else default

def get_stock_report(symbol: str):
    stock = yf.Ticker(symbol)
    info = stock.info or {}

    # --- Price / Basic ---
    price = info.get("currentPrice")
    sector = info.get("sector")

    # --- Chart data (6 months) ---
    hist = stock.history(period="6mo")
    chart = []
    if not hist.empty:
        for idx, row in hist.iterrows():
            chart.append({
                "date": str(idx.date()),
                "close": float(row["Close"])
            })

    # --- Peers by sector ---
    peers = SECTOR_PEERS.get(sector, [])
    # keep selected symbol first + unique
    peers = [symbol] + [p for p in peers if p != symbol]

    peer_rows = []
    for p in peers:
        t = yf.Ticker(p)
        pi = t.info or {}
        peer_rows.append({
            "symbol": p,
            "price": _safe(pi.get("currentPrice")),
            "pe": _safe(pi.get("trailingPE")),
            "roe": _safe(pi.get("returnOnEquity")),      # often decimal like 0.14
            "revenue": _safe(pi.get("totalRevenue")),
        })

    return {
        "symbol": symbol,
        "sector": sector,
        "price": price,
        "chart": chart,
        "peers": peer_rows
    }