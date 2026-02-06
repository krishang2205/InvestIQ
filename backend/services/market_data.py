import yfinance as yf
import pandas as pd
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketDataService:
    """
    Service to fetch real-time market data using yfinance.
    Handles Indices, Market Mood (VIX), Top Movers, and News.
    """
    
    def __init__(self):
        # Using Yahoo Finance Tickers for Indian Markets
        self.indices_tickers = {
            'NIFTY 50': '^NSEI',
            'SENSEX': '^BSESN',
            'BANK NIFTY': '^NSEBANK',
            'NIFTY IT': '^CNXIT', 
            'NIFTY MIDCAP': '^NSMIDCP' 
        }

    def _get_ticker_data(self, symbol):
        """
        Helper to fetch a single ticker's info and price.
        """
        try:
            ticker = yf.Ticker(symbol)
            # Try fast_info first (available in newer yfinance versions)
            try:
                price = ticker.fast_info.last_price
                prev_close = ticker.fast_info.previous_close
            except:
                # Fallback to history
                hist = ticker.history(period="2d")
                if hist.empty:
                    return None
                price = hist['Close'].iloc[-1]
                prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else price
            
            change = price - prev_close
            pct_change = (change / prev_close) * 100 if prev_close else 0
            
            return {
                'price': round(price, 2),
                'change': round(change, 2),
                'percentChange': round(pct_change, 2)
            }
        except Exception as e:
            logger.error(f"Error fetching {symbol}: {e}")
            return None

    def get_indices(self):
        """
        Fetches data for all configured indices.
        Returns a list of dictionaries with index data.
        """
        results = []
        for name, symbol in self.indices_tickers.items():
            data = self._get_ticker_data(symbol)
            if data:
                results.append({
                    'name': name,
                    'symbol': symbol,
                    **data
                })
            else:
                 # Return explicit error state for this index so UI knows it failed
                results.append({
                    'name': name,
                    'symbol': symbol,
                    'price': 0,
                    'change': 0,
                    'percentChange': 0,
                    'error': True
                })
                
        return results
