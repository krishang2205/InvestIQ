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
        
        # NIFTY 50 Tickers (Full List)
        self.movers_tickers = [
            'ADANIENT.NS', 'ADANIPORTS.NS', 'APOLLOHOSP.NS', 'ASIANPAINT.NS', 'AXISBANK.NS',
            'BAJAJ-AUTO.NS', 'BAJFINANCE.NS', 'BAJAJFINSV.NS', 'BPCL.NS', 'BHARTIARTL.NS',
            'BRITANNIA.NS', 'CIPLA.NS', 'COALINDIA.NS', 'DIVISLAB.NS', 'DRREDDY.NS',
            'EICHERMOT.NS', 'GRASIM.NS', 'HCLTECH.NS', 'HDFCBANK.NS', 'HDFCLIFE.NS',
            'HEROMOTOCO.NS', 'HINDALCO.NS', 'HINDUNILVR.NS', 'ICICIBANK.NS', 'ITC.NS',
            'INDUSINDBK.NS', 'INFY.NS', 'JSWSTEEL.NS', 'KOTAKBANK.NS', 'LT.NS',
            'LTIM.NS', 'M&M.NS', 'MARUTI.NS', 'NESTLEIND.NS', 'NTPC.NS',
            'ONGC.NS', 'POWERGRID.NS', 'RELIANCE.NS', 'SBILIFE.NS', 'SBIN.NS',
            'SUNPHARMA.NS', 'TATACONSUM.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS', 'TCS.NS',
            'TECHM.NS', 'TITAN.NS', 'ULTRACEMCO.NS', 'UPL.NS', 'WIPRO.NS'
        ]

    def _get_ticker_data(self, symbol):
        # ... (Method remains for individual calls if needed, but unused in new get_top_movers)
        pass 

    # ... (get_indices and get_market_mood remain unchanged)

    def get_top_movers(self):
        """
        Batch fetches Nifty 50 data to find Top Gainers and Losers.
        """
        try:
            # Batch download for 1 day period
            # group_by='ticker' ensures a MultiIndex dataframe if multiple tickers
            batch_data = yf.download(self.movers_tickers, period="1d", group_by='ticker', progress=False, threads=True)
            
            processed_data = []

            for symbol in self.movers_tickers:
                try:
                    # Handle case where download failed for specific symbol or data is missing
                    if symbol not in batch_data.columns.levels[0]:
                        continue
                        
                    ticker_df = batch_data[symbol]
                    
                    if ticker_df.empty or len(ticker_df) < 1:
                        continue

                    # Get Price and Prev Close
                    # yfinance batch 'Close' might have NaN if market just opened or bad data
                    # We take the last available valid index
                    current_close = ticker_df['Close'].iloc[-1]
                    
                    # For change, we need previous close. 
                    # If period='1d', yfinance often returns just today's OHLC.
                    # We utilize the 'Open' as a proxy for 'Prev Close' if 'Prev Close' isn't explicitly available,
                    # OR we calculate change from the day's open (Intraday Change) which is often what users care about for "Movers".
                    # BETTER: yfinance batch doesn't give 'previousClose' property easily in DataFrame.
                    # We will use (Close - Open) for "Day's Change" approx, or we need 2d history.
                    # Let's fetch 2d history to be accurate about "Change from Yesterday".
                    pass
                except Exception:
                    continue

            # RE-STRATEGY: yf.download with period='2d' to get yesterday's close
            batch_data = yf.download(self.movers_tickers, period="2d", group_by='ticker', progress=False, threads=True)
            
            processed_data = []
            
            for symbol in self.movers_tickers:
                try:
                    stats = batch_data[symbol]
                    if stats.empty: 
                        continue
                    
                    # Ensure we have data
                    # If only 1 row (today), we can't calc change from yesterday accurately without prev close info.
                    # But often row 0 is yesterday, row 1 is today.
                    
                    current_price = stats['Close'].iloc[-1]
                    
                    if len(stats) > 1:
                        prev_close = stats['Close'].iloc[-2]
                    else:
                        prev_close = stats['Open'].iloc[-1] # Fallback to Open if only 1 data point

                    change = current_price - prev_close
                    percent_change = (change / prev_close) * 100

                    processed_data.append({
                        'symbol': symbol,
                        'name': symbol.replace('.NS', ''), # Simple name cleaning
                        'price': round(float(current_price), 2),
                        'change': round(float(change), 2),
                        'percentChange': round(float(percent_change), 2)
                    })
                except Exception as e:
                    # logger.warning(f"Skipping {symbol}: {e}")
                    continue

            # Strict Filter
            gainers = [x for x in processed_data if x['percentChange'] > 0]
            losers = [x for x in processed_data if x['percentChange'] < 0]

            # Sort
            gainers.sort(key=lambda x: x['percentChange'], reverse=True)
            losers.sort(key=lambda x: x['percentChange']) # Ascending (most negative first)

            # Return Top 10 to ensure UI has enough data
            return {
                'gainers': gainers[:10],
                'losers': losers[:10]
            }

        except Exception as e:
            logger.error(f"Error in batch movers fetch: {e}")
            return {'gainers': [], 'losers': []}

    def get_news(self):
        """
        Fetches market news using yfinance.
        """
        try:
            # Get news from NIFTY 50 ticker
            nifty = yf.Ticker("^NSEI")
            news = nifty.news
            
            formatted_news = []
            for item in news[:5]: # Top 5 news items
                publish_time = item.get('providerPublishTime')
                relative_time = "Just now"
                if publish_time:
                    dt_object = datetime.fromtimestamp(publish_time)
                    relative_time = dt_object.strftime("%H:%M") # Simple time format
                
                formatted_news.append({
                    'title': item.get('title'),
                    'link': item.get('link'),
                    'publisher': item.get('publisher'),
                    'time': relative_time,
                    'type': item.get('type', 'NEWS')
                })
            
            return formatted_news
        except Exception as e:
            logger.error(f"Error fetching news: {e}")
            return []
