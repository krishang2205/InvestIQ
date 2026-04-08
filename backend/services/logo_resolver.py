import os
import json
import logging
import yfinance as yf

logger = logging.getLogger(__name__)

TICKER_WEBSITES = {
    'ONGC': 'ongcindia.com',
    'UPL': 'upl-ltd.com',
    'HINDALCO': 'hindalco.com',
    'HDFCLIFE': 'hdfclife.com',
    'DIVISLAB': 'divislabs.com',
    'DRREDDY': 'drreddys.com',
    'SBILIFE': 'sbilife.co.in',
    'BAJAJ-AUTO': 'bajajauto.com',
    'GRASIM': 'grasim.com',
    'BPCL': 'bharatpetroleum.in',
    'EICHERMOT': 'eichermotors.com',
    'COALINDIA': 'coalindia.in',
    'TATASTEEL': 'tatasteel.com',
    'JSWSTEEL': 'jsw.in',
    'ADANIPORTS': 'adaniports.com',
    'ADANIENT': 'adanienterprises.com',
    'SUNPHARMA': 'sunpharma.com',
    'CIPLA': 'cipla.com',
    'ITC': 'itcportal.com',
    'HINDUNILVR': 'hul.co.in',
    'NESTLEIND': 'nestle.in',
    'BRITANNIA': 'britannia.co.in',
    'APOLLOHOSP': 'apollohospitals.com',
    'TITAN': 'titan.co.in',
    'M&M': 'mahindra.com',
    'MARUTI': 'marutisuzuki.com',
    'POWERGRID': 'powergrid.in',
    'NTPC': 'ntpc.co.in',
    'HEROMOTOCO': 'heromotocorp.com',
    'ULTRACEMCO': 'ultratechcement.com',
    'TCS': 'tcs.com',
    'INFY': 'infosys.com',
    'WIPRO': 'wipro.com',
    'HCLTECH': 'hcltech.com',
    'TECHM': 'techmahindra.com',
    'LTIM': 'ltimindtree.com',
    'AXISBANK': 'axisbank.com',
    'BAJFINANCE': 'bajajfinserv.in',
    'BAJAJFINSV': 'bajajfinserv.in',
    'BHARTIARTL': 'airtel.in',
    'ASIANPAINT': 'asianpaints.com',
    'HDFCBANK': 'hdfcbank.com',
    'ICICIBANK': 'icicibank.com',
    'INDUSINDBK': 'indusind.com',
    'KOTAKBANK': 'kotak.com',
    'SBIN': 'sbi.co.in',
    'LT': 'larsentoubro.com',
    'RELIANCE': 'ril.com',
    'TATACONSUM': 'tataconsumer.com',
    'TMPV': 'tatamotors.com',
    'TATAMOTORS': 'tatamotors.com',
}

class LogoResolverService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
        self.cache_file = os.path.join(self.data_dir, 'logo_cache.json')
        self._ensure_cache_file()
        
    def _ensure_cache_file(self):
        if not os.path.exists(self.data_dir):
            os.makedirs(self.data_dir)
        if not os.path.exists(self.cache_file):
            with open(self.cache_file, 'w') as f:
                json.dump({}, f)

    def _load_cache(self):
        try:
            with open(self.cache_file, 'r') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Error loading logo_cache.json: {e}")
            return {}

    def _save_cache(self, cache):
        try:
            with open(self.cache_file, 'w') as f:
                json.dump(cache, f, indent=4)
        except Exception as e:
            logger.error(f"Error saving logo_cache.json: {e}")

    def resolve_ticker_to_domain(self, ticker):
        """
        Resolves a ticker (like 'RELIANCE') to a root domain (like 'ril.com') 
        using offline data, yfinance, and local JSON caching.
        """
        clean_ticker = str(ticker).replace('.NS', '').replace('.BO', '').strip().upper()
        
        # 1. Hardcoded Override
        if clean_ticker in TICKER_WEBSITES:
            return TICKER_WEBSITES[clean_ticker]
            
        # 2. Local JSON Cache
        cache = self._load_cache()
        if clean_ticker in cache:
            return cache[clean_ticker]
            
        # 3. Yfinance Lookup
        try:
            # We must append .NS suffix here for Indian companies if it's missing for yfinance to work. 
            yf_symbol = clean_ticker if '.' in clean_ticker else f"{clean_ticker}.NS"
            info = yf.Ticker(yf_symbol).info
            website = info.get('website')
            if website:
                # 'http://www.example.com' -> 'example.com'
                domain = website.replace('http://', '').replace('https://', '').replace('www.', '').rstrip('/')
                if '/' in domain:
                    domain = domain.split('/')[0]
                
                if domain and '.' in domain:
                    # Cache & Return
                    cache[clean_ticker] = domain
                    self._save_cache(cache)
                    return domain
        except Exception as e:
            logger.warning(f"Error fetching website from yfinance for {clean_ticker}: {e}")
            
        # 4. Fallback Guess
        generic_domain = f"{clean_ticker.lower()}.com"
        cache[clean_ticker] = generic_domain
        self._save_cache(cache)
        return generic_domain
