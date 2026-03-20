import numpy as np
import pandas as pd
from backend.services.indicators import to_df, sma, rsi, macd, atr

def compute_technical_signals(candles):
    df = to_df(candles)
    if df.empty or len(df) < 60:
        return {"error": "Not enough data for indicators"}

    df["sma20"] = sma(df["close"], 20)
    df["sma50"] = sma(df["close"], 50)
    df["rsi14"] = rsi(df["close"], 14)

    macd_line, macd_signal, macd_hist = macd(df["close"])
    df["macd"] = macd_line
    df["macd_signal"] = macd_signal
    df["macd_hist"] = macd_hist

    last = df.iloc[-1]

    close = float(last["close"]) if pd.notna(last["close"]) else None
    sma20 = float(last["sma20"]) if pd.notna(last["sma20"]) else None
    sma50 = float(last["sma50"]) if pd.notna(last["sma50"]) else None
    rsi14 = float(last["rsi14"]) if pd.notna(last["rsi14"]) else None
    macd_h = float(last["macd_hist"]) if pd.notna(last["macd_hist"]) else None

    trend = "Neutral"
    if close is not None and sma50 is not None:
        trend = "Bullish" if close > sma50 else "Bearish"

    momentum = "Neutral"
    if rsi14 is not None and macd_h is not None:
        momentum = "Bullish" if (rsi14 > 55 and macd_h > 0) else "Neutral"

    breakout_risk = "Neutral"
    if close is not None and sma20 is not None and sma50 is not None:
        if close > sma20 and close > sma50:
            breakout_risk = "Low"
        elif close < sma20:
            breakout_risk = "High"

    return {
        "trend": {"label": trend, "based_on": "Close vs SMA50"},
        "momentum": {"label": momentum, "based_on": "RSI + MACD Histogram"},
        "breakout_risk": {"label": breakout_risk, "based_on": "SMA alignment"},
        "values": {
            "close": close,
            "sma20": sma20,
            "sma50": sma50,
            "rsi14": rsi14,
            "macd": float(last["macd"]) if pd.notna(last["macd"]) else None,
            "macd_signal": float(last["macd_signal"]) if pd.notna(last["macd_signal"]) else None,
            "macd_hist": macd_h,
        }
    }

def compute_volatility_risk(candles):
    df = to_df(candles)
    if df.empty or len(df) < 30:
        return {"error": "Not enough data for risk"}

    df["returns"] = df["close"].pct_change()
    returns = df["returns"].dropna()

    vol = float(returns.std() * np.sqrt(252) * 100) if not returns.empty else None

    df["atr14"] = atr(df, 14)
    last = df.iloc[-1]
    atr14 = float(last["atr14"]) if pd.notna(last["atr14"]) else None

    level = "Moderate"
    if vol is not None:
        level = "Low" if vol < 25 else "Moderate" if vol < 45 else "High"

    drivers = [
        "Annualized volatility based on daily returns",
        "ATR(14) captures average price swing range"
    ]

    return {
        "volatility_annual_pct": vol,
        "atr14": atr14,
        "risk_level": level,
        "drivers": drivers
    }

def compute_sentiment_placeholder(quote, technical):
    score = 0.55

    t = technical.get("trend", {}).get("label")
    m = technical.get("momentum", {}).get("label")

    if t == "Bullish":
        score += 0.10
    if m == "Bullish":
        score += 0.10

    score = float(min(score, 0.95))
    label = "Positive" if score >= 0.65 else "Neutral" if score >= 0.50 else "Negative"

    return {
        "score": score,
        "label": label,
        "note": "Sentiment placeholder (derived from price/technical signals)."
    }

def compute_analytical_weights(technical, sentiment):
    return {
        "technical": 40,
        "fundamental": 35,
        "sentiment": 25,
        "note": "Weights can be made user-adjustable later."
    }

def compute_outlook(technical, risk, sentiment):
    score = 50

    if technical.get("trend", {}).get("label") == "Bullish":
        score += 15
    if technical.get("momentum", {}).get("label") == "Bullish":
        score += 10
    if sentiment.get("label") == "Positive":
        score += 10

    rl = risk.get("risk_level", "Moderate")
    if rl == "High":
        score -= 15
    elif rl == "Low":
        score += 5

    score = max(0, min(100, int(score)))
    action = "BUY" if score >= 70 else "HOLD" if score >= 50 else "SELL"

    return {
        "overall_score": score,
        "confidence": 0.80 if score >= 70 else 0.65 if score >= 50 else 0.55,
        "suggested_action": action,
        "tactical_view": {
            "horizon": "0–3 months",
            "bias": "Bullish" if score >= 70 else "Neutral",
            "note": "Based on technical + volatility"
        },
        "structural_view": {
            "horizon": "12+ months",
            "bias": "Bullish" if action == "BUY" else "Neutral",
            "note": "Fundamentals + macro can improve this later"
        }
    }

def compute_peer_benchmarking(stock_service, symbol, peers):
    peer_list = peers[:3] if isinstance(peers, list) else []

    def build_row(ticker: str):
        q = stock_service.get_quote(ticker)
        f = stock_service.get_fundamentals(ticker)

        return {
            "company": ticker,
            "price": q.get("price"),
            "pe_ratio": f.get("pe_ratio"),
            "roe": f.get("roe"),
            "revenue_q": f.get("revenue_q")
        }

    rows = []
    for p in peer_list:
        try:
            rows.append(build_row(p))
        except Exception:
            rows.append({
                "company": p,
                "price": None,
                "pe_ratio": None,
                "roe": None,
                "revenue_q": None
            })

    # include base company too (optional but useful)
    base = build_row(symbol)

    return {
        "base_company": base,
        "peers": rows,
        "note": "P/E, ROE and revenue depend on Yahoo availability; some tickers may return null."
    }