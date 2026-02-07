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

    def get_market_mood(self):
        """
        Calculates Market Mood Index based on India VIX and Nifty 50 Trend.
        Returns: { score: 0-100, label: str, zone: str }
        """
        try:
            # 1. Fetch India VIX
            vix_ticker = yf.Ticker("^INDIAVIX")
            try:
                vix = vix_ticker.fast_info.last_price
            except:
                hist = vix_ticker.history(period="1d")
                vix = hist['Close'].iloc[-1] if not hist.empty else 15.0 # Fallback average

            # 2. Fetch Nifty 50 Trend (Price vs SMA50)
            nifty = yf.Ticker("^NSEI")
            hist = nifty.history(period="3mo") # Need enough data for SMA
            
            if hist.empty:
                return {'score': 50, 'label': 'Neutral', 'zone': 'yellow'}

            current_price = hist['Close'].iloc[-1]
            sma_50 = hist['Close'].rolling(window=50).mean().iloc[-1]
            
            # 3. Calculate Score
            # VIX Contribution (60%): Lower VIX = Higher Score (Greed)
            # Normalizing VIX: 10 (Greed) to 30 (Fear)
            # If VIX <= 10, Score component is 100. If VIX >= 30, Score component is 0.
            vix_score = max(0, min(100, (30 - vix) / (30 - 10) * 100))
            
            # Trend Contribution (40%): Price > SMA = Bullish (Add score)
            trend_score = 100 if current_price > sma_50 else 0
            
            final_score = (vix_score * 0.6) + (trend_score * 0.4)
            final_score = round(final_score, 1)

            # Determine Label
            if final_score <= 25:
                label, zone = "Extreme Fear", "red"
            elif final_score <= 45:
                label, zone = "Fear", "orange"
            elif final_score <= 55:
                label, zone = "Neutral", "yellow"
            elif final_score <= 75:
                label, zone = "Greed", "lightgreen"
            else:
                label, zone = "Extreme Greed", "green"

            return {
                'score': final_score,
                'label': label,
                'zone': zone,
                'vix': round(vix, 2),
                'timestamp': datetime.now().isoformat()
            }

        except Exception as e:
            logger.error(f"Error calculating market mood: {e}")
            return {'score': 50, 'label': 'Neutral', 'zone': 'yellow'}
