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
        
        # NIFTY 50 Tickers (Large Cap)
        self.largecap_tickers = [
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

        # NIFTY MIDCAP 100 Tickers (Top 20 Selection)
        self.midcap_tickers = [
            'TRENT.NS', 'BEL.NS', 'TATAELXSI.NS', 'INDHOTEL.NS', 'FEDERALBNK.NS',
            'IDFCFIRSTB.NS', 'ASHOKLEY.NS', 'CUMMINSIND.NS', 'ASTRAL.NS', 'POLYCAB.NS',
            'COFORGE.NS', 'PERSISTENT.NS', 'MRF.NS', 'SRF.NS', 'VOLTAS.NS',
            'AUROPHARMA.NS', 'LUPIN.NS', 'ALKEM.NS', 'OBEROIRLTY.NS', 'PIIND.NS'
        ]

        # NIFTY SMALLCAP 100 Tickers (Top 20 Selection)
        self.smallcap_tickers = [
            'BSE.NS', 'CDSL.NS', 'IEX.NS', 'MCX.NS', 'SUZLON.NS',
            'CENTURYPLY.NS', 'KEI.NS', 'ANGELONE.NS', 'NBCC.NS', 'HUDCO.NS',
            'RVNL.NS', 'IRFC.NS', 'SJVN.NS', 'NHPC.NS', 'IDBI.NS',
            'KALYANKJIL.NS', 'SONACOMS.NS', 'CYIENT.NS', 'BSOFT.NS', 'GLENMARK.NS'
        ]

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
            
            # Use symbol as name default, can be enhanced with dictionary mapping for speed
            name = symbol.replace('.NS', '')

            return {
                'symbol': symbol,
                'name': name,
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
                    'price': data['price'],
                    'change': data['change'],
                    'percentChange': data['percentChange']
                })
            else:
                results.append({
                    'name': name, 'symbol': symbol, 'price': 0, 'change': 0, 'percentChange': 0, 'error': True
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
            vix_score = max(0, min(100, (30 - vix) / (30 - 10) * 100))
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

    def get_top_movers(self, category='large_cap'):
        """
        Batch fetches data to find Top Gainers, Losers, and 52W High/Low.
        Args:
            category (str): 'large_cap', 'mid_cap', 'small_cap'
        """
        try:
            # Select Tickers based on Category
            if category == 'mid_cap':
                tickers = self.midcap_tickers
            elif category == 'small_cap':
                tickers = self.smallcap_tickers
            else:
                tickers = self.largecap_tickers

            # Batch download for 1 year period (needed for 52W High/Low)
            # Fetching 1y data for ~50 tickers is reasonably fast (1-2s).
            batch_data = yf.download(tickers, period="1y", group_by='ticker', progress=False, threads=True)
            
            processed_data = []

            for symbol in tickers:
                try:
                    # Check if symbol is in columns (Top Level)
                    if symbol not in batch_data.columns.levels[0]:
                        continue
                        
                    stats = batch_data[symbol]
                    if stats.empty: 
                        continue
                    
                    # 1. Price Data
                    current_price = float(stats['Close'].iloc[-1])
                    if len(stats) > 1:
                        prev_close = float(stats['Close'].iloc[-2])
                    else:
                        prev_close = float(stats['Open'].iloc[-1])

                    change = current_price - prev_close
                    percent_change = (change / prev_close) * 100

                    # 2. 52-Week Data
                    # Calculate High/Low over the fetched period (1y)
                    fifty_two_week_high = float(stats['High'].max())
                    fifty_two_week_low = float(stats['Low'].min())

                    # Determine Proximity (within 2% of High/Low)
                    is_52w_high = current_price >= (fifty_two_week_high * 0.98)
                    is_52w_low = current_price <= (fifty_two_week_low * 1.02)

                    processed_data.append({
                        'symbol': symbol,
                        'name': symbol.replace('.NS', ''), 
                        'price': round(current_price, 2),
                        'change': round(change, 2),
                        'percentChange': round(percent_change, 2),
                        'fiftyTwoWeekHigh': round(fifty_two_week_high, 2),
                        'fiftyTwoWeekLow': round(fifty_two_week_low, 2),
                        'is52WHigh': is_52w_high,
                        'is52WLow': is_52w_low
                    })
                except Exception as e:
                    continue

            # --- Sorters ---
            
            # Gainers
            gainers = [x for x in processed_data if x['percentChange'] > 0]
            gainers.sort(key=lambda x: x['percentChange'], reverse=True)

            # Losers
            losers = [x for x in processed_data if x['percentChange'] < 0]
            losers.sort(key=lambda x: x['percentChange']) # Ascending

            # 52W High (Stocks closest to their 52W High)
            # We sort by how close they are to the High (Price / High ratio)
            # Or just return those flagged High. 
            # Better strategy: Sort by "Percentile" of 52W Range? 
            # Simple: Sort by % Below 52W High (Ascending)
            high_52w = sorted(processed_data, key=lambda x: (x['fiftyTwoWeekHigh'] - x['price']) / x['fiftyTwoWeekHigh'])
            
            # 52W Low (Stocks closest to their 52W Low)
            # Sort by % Above 52W Low (Ascending)
            low_52w = sorted(processed_data, key=lambda x: (x['price'] - x['fiftyTwoWeekLow']) / x['fiftyTwoWeekLow'])

            return {
                'gainers': gainers[:10],
                'losers': losers[:10],
                'fiftyTwoWeekHigh': high_52w[:10],
                'fiftyTwoWeekLow': low_52w[:10]
            }

        except Exception as e:
            logger.error(f"Error in batch movers fetch: {e}")
            return {'gainers': [], 'losers': [], 'fiftyTwoWeekHigh': [], 'fiftyTwoWeekLow': []}

    def get_news(self):
        """
        Fetches market news using yfinance.
        """
        try:
            # Get news from a major stock (Reliance) as proxy for market news
            # ^NSEI often returns limited or no news in some yfinance versions
            ticker = yf.Ticker("RELIANCE.NS")
            news = ticker.news
            
            formatted_news = []
            for item in news[:5]: # Top 5 news items
                # Handle nested 'content' structure if present
                news_item = item.get('content', item)
                
                # Title
                title = news_item.get('title')
                
                # Link: Check clickThroughUrl object or link field
                link_data = news_item.get('clickThroughUrl')
                link = link_data.get('url') if isinstance(link_data, dict) else news_item.get('link')
                
                # Publisher: Check provider object or publisher field
                provider_data = news_item.get('provider')
                publisher = provider_data.get('displayName') if isinstance(provider_data, dict) else news_item.get('publisher')
                
                # Time Parsing
                relative_time = "Just now"
                pub_date = news_item.get('pubDate')
                ts = news_item.get('providerPublishTime')
                
                if pub_date:
                    try:
                        # Handle ISO format "2024-02-19T13:00:00Z"
                        dt_object = datetime.fromisoformat(pub_date.replace('Z', '+00:00'))
                        relative_time = dt_object.strftime("%H:%M")
                    except:
                        pass
                elif ts:
                    try:
                        dt_object = datetime.fromtimestamp(ts)
                        relative_time = dt_object.strftime("%H:%M")
                    except:
                        pass
                
                formatted_news.append({
                    'title': title,
                    'summary': news_item.get('summary', ''),
                    'link': link,
                    'source': publisher, # Frontend expects 'source'
                    'time': relative_time,
                    'type': news_item.get('type', 'NEWS')
                })
            
            return formatted_news
        except Exception as e:
            logger.error(f"Error fetching news: {e}")
            return []
