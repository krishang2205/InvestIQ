import yfinance as yf

SECTOR_PEERS = {
    "Consumer Defensive": ["HINDUNILVR.NS", "ITC.NS", "NESTLEIND.NS", "DABUR.NS", "BRITANNIA.NS"],
    "Energy": ["RELIANCE.NS", "ONGC.NS", "BPCL.NS", "IOC.NS", "GAIL.NS"],
    "Financial Services": ["HDFCBANK.NS", "ICICIBANK.NS", "SBIN.NS", "KOTAKBANK.NS", "AXISBANK.NS"],
    "Technology": ["TCS.NS", "INFY.NS", "HCLTECH.NS", "WIPRO.NS", "TECHM.NS"],
    "Industrials": ["LT.NS", "SIEMENS.NS", "ABB.NS", "BEL.NS", "ADANIPORTS.NS"],
}

def get_default_peers(symbol: str, limit: int = 4):
    """
    Returns peers for a symbol based on sector.
    If sector not found, returns empty list.
    """
    try:
        t = yf.Ticker(symbol)
        info = t.info or {}
        sector = info.get("sector")

        peers = SECTOR_PEERS.get(sector, [])[:]
        if symbol in peers:
            peers.remove(symbol)

        return peers[:limit]
    except Exception:
        return []