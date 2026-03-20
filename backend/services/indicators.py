import pandas as pd

def to_df(candles):
    if not candles:
        return pd.DataFrame()

    df = pd.DataFrame(candles)

    for col in ["close", "high", "low", "open", "volume"]:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce")

    return df

def sma(series, period=20):
    return series.rolling(period).mean()

def ema(series, span=20):
    return series.ewm(span=span, adjust=False).mean()

def rsi(series, period=14):
    delta = series.diff()
    gain = delta.where(delta > 0, 0).rolling(period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(period).mean()
    rs = gain / (loss + 1e-9)
    return 100 - (100 / (1 + rs))

def macd(series, fast=12, slow=26, signal=9):
    fast_ema = ema(series, fast)
    slow_ema = ema(series, slow)
    line = fast_ema - slow_ema
    sig = ema(line, signal)
    hist = line - sig
    return line, sig, hist

def atr(df, period=14):
    high_low = df["high"] - df["low"]
    high_close = (df["high"] - df["close"].shift()).abs()
    low_close = (df["low"] - df["close"].shift()).abs()
    tr = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    return tr.rolling(period).mean()