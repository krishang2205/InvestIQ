import logging
import time
import datetime
from typing import Dict, Any

import yfinance as yf
import pandas as pd

logger = logging.getLogger(__name__)


class FinancialDataAdapter:
    """
    Live financial data ingestion layer using yfinance.
    Fetches real OHLCV price history, fundamental metrics, and market context
    for any globally listed ticker symbol.
    """

    def __init__(self, timeout_sec: int = 10):
        self.timeout = timeout_sec
        logger.info(f"FinancialDataAdapter initialized (live yfinance mode, timeout={self.timeout}s)")

    def fetch_market_context(self, symbol: str) -> Dict[str, Any]:
        """
        Fetches real market data for the given symbol.
        Returns a rich context dict consumed by the LLM prompt builder.
        """
        start_time = time.time()
        symbol = symbol.upper().strip()

        # Indian stocks on NSE need .NS suffix; BSE need .BO
        # If user typed "RELIANCE" without suffix, try NSE first
        ticker_symbol = self._resolve_symbol(symbol)
        logger.info(f"Fetching live market data for {ticker_symbol} via yfinance...")

        try:
            ticker = yf.Ticker(ticker_symbol)
            info = ticker.info

            # Validate ticker returned actual data (not empty dict)
            if not info or info.get("regularMarketPrice") is None and info.get("currentPrice") is None:
                logger.warning(f"yfinance returned empty info for {ticker_symbol}. Symbol may be delisted or invalid.")
                raise ValueError(f"No market data found for symbol: {ticker_symbol}")

            # ── Core Price Data ──────────────────────────────────────────────
            current_price = (
                info.get("currentPrice") or
                info.get("regularMarketPrice") or
                info.get("previousClose") or 0.0
            )
            prev_close = info.get("previousClose") or info.get("regularMarketPreviousClose") or current_price
            price_change_pct = ((current_price - prev_close) / prev_close * 100) if prev_close else 0.0

            # ── Fundamental Metrics ──────────────────────────────────────────
            fundamentals = {
                "pe_ratio": info.get("trailingPE") or info.get("forwardPE"),
                "forward_pe": info.get("forwardPE"),
                "pb_ratio": info.get("priceToBook"),
                "market_cap_billions": round((info.get("marketCap") or 0) / 1e9, 2),
                "revenue_ttm_billions": round((info.get("totalRevenue") or 0) / 1e9, 2),
                "net_income_billions": round((info.get("netIncomeToCommon") or 0) / 1e9, 2),
                "earnings_per_share": info.get("trailingEps") or info.get("forwardEps"),
                "dividend_yield": round(info.get("dividendYield") or 0, 2),
                "roe": round((info.get("returnOnEquity") or 0) * 100, 2),
                "roa": round((info.get("returnOnAssets") or 0) * 100, 2),
                "profit_margin": round((info.get("profitMargins") or 0) * 100, 2),
                "debt_to_equity": info.get("debtToEquity"),
                "free_cashflow_billions": round((info.get("freeCashflow") or 0) / 1e9, 2),
                "beta": info.get("beta"),
            }

            # ── 52-Week Range ────────────────────────────────────────────────
            week_52_high = info.get("fiftyTwoWeekHigh") or info.get("yearHigh") or (current_price * 1.2)
            week_52_low  = info.get("fiftyTwoWeekLow")  or info.get("yearLow")  or (current_price * 0.8)
            fifty_day_avg = info.get("fiftyDayAverage") or current_price
            two_hundred_day_avg = info.get("twoHundredDayAverage") or current_price

            # ── Live 1-Year OHLCV History for Chart ─────────────────────────
            chart_data = self._fetch_price_history(ticker, ticker_symbol)
            
            # ── Live 1-Day Intraday History for 1D Chart ────────────────────
            intraday_data = self._fetch_intraday_history(ticker, ticker_symbol)

            # ── Recent News ──────────────────────────────────────────────────
            recent_news = []
            try:
                raw_news = ticker.news
                if raw_news:
                    for n in raw_news[:5]:
                        # yfinance structure: {'content': {'title': '...', 'pubDate': '...', 'summary': '...'}}
                        content = n.get("content") or n  # fallback if structure varies
                        title = content.get("title")
                        if title:
                            recent_news.append({
                                "title": title,
                                "date": content.get("pubDate", ""),
                                "summary": content.get("summary", "")[:200]
                            })
            except Exception as e:
                logger.warning(f"Failed to fetch news for {ticker_symbol}: {e}")

            # ── Company Metadata ─────────────────────────────────────────────
            officers = info.get("companyOfficers", [])
            ceo_name = "N/A"
            if officers:
                for off in officers:
                    title = str(off.get("title", "")).lower()
                    if "ceo" in title or "chief executive" in title:
                        ceo_name = off.get("name", "N/A")
                        break
                if ceo_name == "N/A":
                    ceo_name = officers[0].get("name", "N/A")

            company_meta = {
                "name": info.get("longName") or info.get("shortName") or symbol,
                "ceo": ceo_name,
                "sector": info.get("sector") or "Unknown",
                "industry": info.get("industry") or "Unknown",
                "exchange": info.get("exchange") or info.get("fullExchangeName") or "Unknown",
                "country": info.get("country") or "Unknown",
                "currency": info.get("currency") or "USD",
                "website": info.get("website"),
                "employees": info.get("fullTimeEmployees"),
                "description": info.get("longBusinessSummary", "")[:500] if info.get("longBusinessSummary") else "",
            }

            elapsed = time.time() - start_time
            logger.info(f"Live data fetch for {ticker_symbol} completed in {elapsed:.2f}s | Price: {current_price} {company_meta['currency']}")

            return {
                "symbol": ticker_symbol,
                "display_symbol": symbol,
                "current_price": current_price,
                "prev_close": prev_close,
                "price_change_pct": round(price_change_pct, 2),
                "fifty_two_week_high": week_52_high,
                "fifty_two_week_low": week_52_low,
                "fifty_day_avg": fifty_day_avg,
                "two_hundred_day_avg": two_hundred_day_avg,
                "fundamentals": fundamentals,
                "company_meta": company_meta,
                "chart_data": chart_data,         # Real OHLCV for chart injection
                "intraday_data": intraday_data,   # Real tick-by-tick for 1D chart
                "news": recent_news,              # Top 5 latest news articles
                "sentiment_score": 0.0,            # Placeholder; overridden by AI
                "volatility": self._compute_volatility(chart_data),
            }

        except ValueError as ve:
            logger.error(f"Symbol resolution failed for {ticker_symbol}: {ve}")
            raise ConnectionError(f"Symbol not found: {ve}")
        except Exception as e:
            logger.error(f"yfinance data fetch failed for {ticker_symbol}: {e}")
            raise ConnectionError(f"Failed to fetch live market data for {ticker_symbol}: {e}")

    # ────────────────────────────────────────────────────────────────────────────
    # Helpers
    # ────────────────────────────────────────────────────────────────────────────

    def _resolve_symbol(self, symbol: str) -> str:
        """
        Automatically appends .NS suffix for known Indian tickers if no suffix
        is present, so users can type 'RELIANCE' and get 'RELIANCE.NS'.
        """
        if "." in symbol:
            return symbol  # Already has suffix (e.g. RELIANCE.NS or AAPL)

        # Try as-is first (covers US tickers like AAPL, TSLA)
        # Indian market heuristic: common Nifty 500 tickers without a dot → .NS
        indian_hints = {
            "RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK", "SBIN",
            "WIPRO", "HINDUNILVR", "KOTAKBANK", "BAJFINANCE", "LT",
            "AXISBANK", "MARUTI", "TITAN", "SUNPHARMA", "ASIANPAINT",
            "NESTLEIND", "ULTRACEMCO", "TECHM", "POWERGRID", "NTPC",
            "HCLTECH", "ADANIENT", "ADANIPORTS", "TMPV", "TATASTEEL",
            "ONGC", "BPCL", "IOC", "COALINDIA", "ITC", "BHARTIARTL",
        }
        if symbol in indian_hints:
            return f"{symbol}.NS"

        # Default: return as-is and let yfinance handle it
        return symbol

    def _fetch_price_history(self, ticker: yf.Ticker, symbol: str) -> list:
        """
        Downloads historical daily closing prices (5y duration) and returns them as 
        the chart_data array format expected by the report schema.
        """
        try:
            hist = ticker.history(period="5y", interval="1d", auto_adjust=True)
            if hist.empty:
                logger.warning(f"Empty price history for {symbol}, using fallback.")
                return []

            chart_data = []
            for date_idx, row in hist.iterrows():
                date_str = date_idx.strftime("%b %d, %Y") if hasattr(date_idx, 'strftime') else str(date_idx)[:10]
                chart_data.append({
                    "date": date_str,
                    "price": round(float(row["Close"]), 2),
                    "open": round(float(row["Open"]), 2),
                    "high": round(float(row["High"]), 2),
                    "low": round(float(row["Low"]), 2),
                    "volume": int(row["Volume"]) if not pd.isna(row["Volume"]) else 0,
                })

            logger.info(f"Fetched {len(chart_data)} days of real price history for {symbol}")
            return chart_data
        except Exception as e:
            logger.warning(f"Price history fetch failed for {symbol}: {e}")
            return []

    def _fetch_intraday_history(self, ticker: yf.Ticker, symbol: str) -> list:
        """
        Downloads 1-day intraday data at 5-minute intervals for real-time 1D charting.
        """
        try:
            hist = ticker.history(period="1d", interval="5m", auto_adjust=True)
            if hist.empty:
                logger.warning(f"Empty intraday history for {symbol}, using fallback.")
                return []

            intraday_data = []
            for date_idx, row in hist.iterrows():
                # Format to HH:MM AM/PM
                time_str = date_idx.strftime("%I:%M %p") if hasattr(date_idx, 'strftime') else str(date_idx)[11:16]
                intraday_data.append({
                    "date": time_str,
                    "price": round(float(row["Close"]), 2)
                })

            logger.info(f"Fetched {len(intraday_data)} intraday ticks for {symbol}")
            return intraday_data
        except Exception as e:
            logger.warning(f"Failed to fetch intraday data for {symbol}: {e}")
            return []

    def _compute_volatility(self, chart_data: list) -> float:
        """
        Computes annualised volatility (standard deviation of daily returns * sqrt(252))
        from the real price history. Returns 0 if insufficient data.
        """
        if len(chart_data) < 5:
            return 0.0
        try:
            prices = [d["price"] for d in chart_data]
            returns = [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]
            if not returns:
                return 0.0
            mean = sum(returns) / len(returns)
            variance = sum((r - mean) ** 2 for r in returns) / len(returns)
            std_dev = variance ** 0.5
            annualised = std_dev * (252 ** 0.5)
            return round(annualised * 100, 2)  # As a percentage
        except Exception:
            return 0.0


financial_ingestion_engine = FinancialDataAdapter()
