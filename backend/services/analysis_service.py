from backend.services.stock_service import StockService
from backend.services.report_logic import (
    compute_technical_signals,
    compute_volatility_risk,
    compute_sentiment_placeholder,
    compute_outlook,
    compute_analytical_weights,
    compute_peer_benchmarking
)

# ✅ NEW: dynamic peer selector
from backend.services.peer_service import get_default_peers


def build_intelligence_report(symbol: str, period: str, interval: str, peers: list):
    svc = StockService()

    # --- core data ---
    candles = svc.get_historical(symbol, period=period, interval=interval)
    quote = svc.get_quote(symbol)

    # --- analytics ---
    technical = compute_technical_signals(candles)
    risk = compute_volatility_risk(candles)
    sentiment = compute_sentiment_placeholder(quote, technical)

    # ✅ FIX: if peers missing/empty, auto-generate based on symbol
    if not isinstance(peers, list):
        peers = []
    peers = [p.strip().upper() for p in peers if isinstance(p, str) and p.strip()]
    peers = [p for p in peers if p != symbol]

    if len(peers) == 0:
        peers = get_default_peers(symbol, limit=4)   # ✅ dynamic peers here

    peer_data = compute_peer_benchmarking(svc, symbol, peers)

    weights = compute_analytical_weights(technical, sentiment)
    outlook = compute_outlook(technical, risk, sentiment)

    return {
        "symbol": symbol,
        "meta": {"period": period, "interval": interval},
        "quote": quote,
        "price_behavior": {"candles": candles[-220:]},
        "technical_signals": technical,
        "risk_factors": risk,
        "market_sentiment": sentiment,
        "analytical_weighting": weights,
        "peer_benchmarking": peer_data,
        "outlook": outlook
    }