import yfinance as yf
import pandas as pd
from datetime import datetime


class YahooDataProvider:
    def get_quote(self, symbol: str):
        t = yf.Ticker(symbol)

        price_f = None
        prev_f = None
        currency = None
        exchange = None

        # 1) Try fast_info first
        try:
            info = t.fast_info if hasattr(t, "fast_info") else {}
            price = info.get("last_price", None)
            prev_close = info.get("previous_close", None)
            currency = info.get("currency", None)
            exchange = info.get("exchange", None)

            if price is not None and pd.notna(price):
                price_f = float(price)
            if prev_close is not None and pd.notna(prev_close):
                prev_f = float(prev_close)
        except Exception:
            pass

        # 2) Fallback: history is more reliable (especially for NSE tickers)
        if price_f is None or prev_f is None:
            try:
                hist = t.history(period="5d", interval="1d")
                if hist is not None and not hist.empty and "Close" in hist.columns:
                    closes = hist["Close"].dropna()
                    if len(closes) >= 1 and price_f is None:
                        price_f = float(closes.iloc[-1])
                    if len(closes) >= 2 and prev_f is None:
                        prev_f = float(closes.iloc[-2])
            except Exception:
                pass

        day_change = (price_f - prev_f) if (price_f is not None and prev_f is not None) else None
        day_change_pct = ((day_change / prev_f) * 100) if (day_change is not None and prev_f) else None

        return {
            "symbol": symbol,
            "price": price_f,
            "previous_close": prev_f,
            "day_change": day_change,
            "day_change_pct": day_change_pct,
            "currency": currency,
            "exchange": exchange,
            "updated_at": datetime.utcnow().isoformat() + "Z"
        }

    def get_historical(self, symbol: str, period: str = "6mo", interval: str = "1d"):
        try:
            df = yf.download(
                symbol,
                period=period,
                interval=interval,
                progress=False,
                auto_adjust=False  # ✅ removes the warning
            )
        except Exception as e:
            raise RuntimeError(f"Yahoo download failed for {symbol}: {e}")

        if df is None or df.empty:
            return []

        # ✅ FIX: yfinance sometimes returns MultiIndex columns -> row["Open"] becomes Series
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)

        df = df.reset_index()

        # ✅ Detect datetime column safely
        dt_col = "Datetime" if "Datetime" in df.columns else "Date"

        def to_float(x, default: float = 0.0) -> float:
            if isinstance(x, pd.Series):
                x = x.iloc[0] if len(x) else default
            return float(x) if pd.notna(x) else default

        candles = []
        for _, row in df.iterrows():
            dt_val = pd.to_datetime(row.get(dt_col), errors="coerce")
            if pd.isna(dt_val):
                continue

            candles.append({
                "time": dt_val.to_pydatetime().isoformat(),
                "open": to_float(row.get("Open")),
                "high": to_float(row.get("High")),
                "low": to_float(row.get("Low")),
                "close": to_float(row.get("Close")),
                "volume": to_float(row.get("Volume"), default=0.0),
            })

        return candles

    def get_fundamentals(self, symbol: str):
        """
        Returns fundamentals using yfinance info.
        Not always available for all tickers, so we keep safe fallbacks.
        """
        t = yf.Ticker(symbol)

        try:
            info = t.info or {}
        except Exception:
            info = {}

        def to_float(x):
            try:
                return float(x) if x is not None and pd.notna(x) else None
            except Exception:
                return None

        pe = to_float(info.get("trailingPE") or info.get("forwardPE"))
        roe = to_float(info.get("returnOnEquity"))  # ratio (0.18 = 18%)
        revenue = to_float(info.get("totalRevenue"))

        # Try quarterly revenue from quarterly_financials if totalRevenue is missing
        revenue_q = None
        try:
            qf = t.quarterly_financials
            if qf is not None and not qf.empty:
                for key in ["Total Revenue", "TotalRevenue", "Revenue"]:
                    if key in qf.index:
                        s = qf.loc[key].dropna()
                        if len(s) > 0:
                            revenue_q = to_float(s.iloc[0])
                            break
        except Exception:
            pass

        if revenue_q is None:
            revenue_q = revenue

        return {
            "pe_ratio": pe,
            "roe": roe,
            "revenue_q": revenue_q
        }