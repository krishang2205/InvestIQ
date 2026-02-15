"""
Data Download Script for Stock AI Forecasting System
Downloads OHLCV data for specified tickers using yfinance

File path: stock_ai/scripts/data/download_data.py

Usage:
    python download_data.py --tickers AAPL MSFT GOOGL --start 2018-01-01 --end 2024-01-01
    python download_data.py --universe sp500 --start 2019-01-01
"""

import argparse
import logging
from pathlib import Path
from datetime import datetime
from typing import List, Optional
import pandas as pd
import yfinance as yf
from tqdm import tqdm
import time

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class StockDataDownloader:
    """Download and save stock OHLCV data."""
    
    def __init__(self, output_dir: str = "../../data/raw"):
        """
        Initialize downloader.
        
        Args:
            output_dir: Directory to save downloaded data
        """
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
    def download_ticker(
        self, 
        ticker: str, 
        start_date: str, 
        end_date: Optional[str] = None,
        retry_count: int = 3
    ) -> Optional[pd.DataFrame]:
        """
        Download data for a single ticker with retry logic.
        
        Args:
            ticker: Stock ticker symbol
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD), defaults to today
            retry_count: Number of retries on failure
            
        Returns:
            DataFrame with OHLCV data or None if failed
        """
        if end_date is None:
            end_date = datetime.now().strftime('%Y-%m-%d')
            
        for attempt in range(retry_count):
            try:
                logger.info(f"Downloading {ticker} (attempt {attempt + 1}/{retry_count})")
                
                # Download data
                stock = yf.Ticker(ticker)
                df = stock.history(start=start_date, end=end_date)
                
                if df.empty:
                    logger.warning(f"No data returned for {ticker}")
                    return None
                
                # Rename columns to standard format
                df = df.rename(columns={
                    'Open': 'open',
                    'High': 'high',
                    'Low': 'low',
                    'Close': 'close',
                    'Volume': 'volume'
                })
                
                # Keep only OHLCV columns
                df = df[['open', 'high', 'low', 'close', 'volume']]
                
                # Reset index to make Date a column
                df.reset_index(inplace=True)
                df.rename(columns={'Date': 'date'}, inplace=True)
                
                # Add ticker column
                df['ticker'] = ticker
                
                # Validate basic data quality
                if len(df) < 100:
                    logger.warning(f"{ticker}: Only {len(df)} rows downloaded, may be insufficient")
                
                # Check for all-zero volumes
                zero_volume_pct = (df['volume'] == 0).sum() / len(df) * 100
                if zero_volume_pct > 10:
                    logger.warning(f"{ticker}: {zero_volume_pct:.1f}% zero-volume days")
                
                logger.info(f"✓ {ticker}: {len(df)} rows from {df['date'].min()} to {df['date'].max()}")
                return df
                
            except Exception as e:
                logger.error(f"Error downloading {ticker} (attempt {attempt + 1}): {str(e)}")
                if attempt < retry_count - 1:
                    time.sleep(2 ** attempt)  # Exponential backoff
                    
        logger.error(f"✗ Failed to download {ticker} after {retry_count} attempts")
        return None
    
    def download_multiple(
        self,
        tickers: List[str],
        start_date: str,
        end_date: Optional[str] = None,
        save_format: str = 'csv'
    ) -> dict:
        """
        Download data for multiple tickers.
        
        Args:
            tickers: List of ticker symbols
            start_date: Start date (YYYY-MM-DD)
            end_date: End date (YYYY-MM-DD)
            save_format: 'csv' or 'parquet'
            
        Returns:
            Dictionary with download statistics
        """
        stats = {
            'total': len(tickers),
            'successful': 0,
            'failed': 0,
            'failed_tickers': []
        }
        
        logger.info(f"Starting download for {len(tickers)} tickers")
        logger.info(f"Date range: {start_date} to {end_date or 'today'}")
        
        for ticker in tqdm(tickers, desc="Downloading"):
            df = self.download_ticker(ticker, start_date, end_date)
            
            if df is not None:
                # Save to file
                filename = f"{ticker}.{save_format}"
                filepath = self.output_dir / filename
                
                if save_format == 'csv':
                    df.to_csv(filepath, index=False)
                elif save_format == 'parquet':
                    df.to_parquet(filepath, index=False)
                else:
                    raise ValueError(f"Unsupported format: {save_format}")
                
                stats['successful'] += 1
                logger.debug(f"Saved {ticker} to {filepath}")
            else:
                stats['failed'] += 1
                stats['failed_tickers'].append(ticker)
            
            # Rate limiting - be nice to Yahoo Finance
            time.sleep(0.5)
        
        # Print summary
        logger.info("\n" + "="*60)
        logger.info("DOWNLOAD SUMMARY")
        logger.info("="*60)
        logger.info(f"Total tickers: {stats['total']}")
        logger.info(f"Successful: {stats['successful']}")
        logger.info(f"Failed: {stats['failed']}")
        
        if stats['failed_tickers']:
            logger.warning(f"Failed tickers: {', '.join(stats['failed_tickers'])}")
        
        logger.info(f"Data saved to: {self.output_dir.absolute()}")
        logger.info("="*60)
        
        return stats


def get_nifty50_tickers() -> List[str]:
    """
    Get list of Nifty 50 tickers.
    
    Returns:
        List of ticker symbols (with .NS suffix for NSE)
    """
    try:
        # Download Nifty 50 list from Wikipedia
        url = 'https://en.wikipedia.org/wiki/NIFTY_50'
        tables = pd.read_html(url)
        nifty_table = tables[1]  # The constituents table
        
        # Extract symbols and add .NS suffix for Yahoo Finance
        tickers = nifty_table['Symbol'].tolist()
        tickers = [f"{ticker}.NS" for ticker in tickers]
        
        logger.info(f"Retrieved {len(tickers)} Nifty 50 tickers")
        return tickers
    except Exception as e:
        logger.warning(f"Error fetching Nifty 50 from Wikipedia: {str(e)}")
        # Fallback to hardcoded list
        logger.info("Using hardcoded Nifty 50 list")
        return get_nifty50_hardcoded()


def get_nifty50_hardcoded() -> List[str]:
    """Hardcoded Nifty 50 list as fallback."""
    return [
        'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
        'HINDUNILVR.NS', 'ITC.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS',
        'LT.NS', 'AXISBANK.NS', 'ASIANPAINT.NS', 'MARUTI.NS', 'TITAN.NS',
        'SUNPHARMA.NS', 'ULTRACEMCO.NS', 'BAJFINANCE.NS', 'NESTLEIND.NS', 'WIPRO.NS',
        'HCLTECH.NS', 'ONGC.NS', 'NTPC.NS', 'TATAMOTORS.NS', 'TATASTEEL.NS',
        'M&M.NS', 'POWERGRID.NS', 'ADANIENT.NS', 'BAJAJFINSV.NS', 'TECHM.NS',
        'JSWSTEEL.NS', 'HINDALCO.NS', 'INDUSINDBK.NS', 'CIPLA.NS', 'COALINDIA.NS',
        'DIVISLAB.NS', 'EICHERMOT.NS', 'GRASIM.NS', 'APOLLOHOSP.NS', 'DRREDDY.NS',
        'ADANIPORTS.NS', 'BRITANNIA.NS', 'BAJAJ-AUTO.NS', 'HEROMOTOCO.NS', 'SBILIFE.NS',
        'TATACONSUM.NS', 'BPCL.NS', 'UPL.NS', 'LTIM.NS', 'HDFCLIFE.NS'
    ]


def get_default_universe() -> List[str]:
    """
    Get a curated default universe of Indian stocks.
    50 Large-cap + 50 Mid-cap + 50 Small-cap NSE stocks
    
    Returns:
        List of ticker symbols (with .NS suffix for NSE)
    """
    # 50 Large-cap NSE stocks (Market cap > ₹20,000 Cr)
    large_cap = [
        # Top Banks & Financial Services
        'HDFCBANK.NS', 'ICICIBANK.NS', 'SBIN.NS', 'KOTAKBANK.NS', 'AXISBANK.NS',
        'INDUSINDBK.NS', 'BAJFINANCE.NS', 'BAJAJFINSV.NS', 'HDFCLIFE.NS', 'SBILIFE.NS',
        # IT & Technology
        'TCS.NS', 'INFY.NS', 'WIPRO.NS', 'HCLTECH.NS', 'TECHM.NS',
        'LTIM.NS', 'PERSISTENT.NS', 'COFORGE.NS', 'MPHASIS.NS', 'LTI.NS',
        # Energy & Oil
        'RELIANCE.NS', 'ONGC.NS', 'BPCL.NS', 'IOC.NS', 'ADANIGREEN.NS',
        # Consumer Goods & Retail
        'HINDUNILVR.NS', 'ITC.NS', 'NESTLEIND.NS', 'BRITANNIA.NS', 'DABUR.NS',
        'GODREJCP.NS', 'MARICO.NS', 'TATACONSUM.NS', 'DMART.NS', 'JUBLFOOD.NS',
        # Automobiles
        'MARUTI.NS', 'TATAMOTORS.NS', 'M&M.NS', 'BAJAJ-AUTO.NS', 'EICHERMOT.NS',
        'HEROMOTOCO.NS', 'ASHOKLEY.NS', 'TVSMOTOR.NS', 'BALKRISIND.NS', 'APOLLOTYRE.NS',
        # Pharma & Healthcare
        'SUNPHARMA.NS', 'DRREDDY.NS', 'CIPLA.NS', 'DIVISLAB.NS', 'APOLLOHOSP.NS',
        'BIOCON.NS', 'AUROPHARMA.NS', 'LUPIN.NS', 'TORNTPHARM.NS', 'ALKEM.NS'
    ]
    
    # 50 Mid-cap NSE stocks (Market cap ₹5,000-20,000 Cr)
    mid_cap = [
        # Banks & Finance
        'FEDERALBNK.NS', 'BANDHANBNK.NS', 'IDFCFIRSTB.NS', 'PNB.NS', 'BANKBARODA.NS',
        'CHOLAFIN.NS', 'M&MFIN.NS', 'LICHSGFIN.NS', 'MUTHOOTFIN.NS', 'SBICARD.NS',
        # IT & Technology
        'OFSS.NS', 'MINDTREE.NS', 'ZOMATO.NS', 'NYKAA.NS', 'PAYTM.NS',
        # Cement & Construction
        'ULTRACEMCO.NS', 'GRASIM.NS', 'AMBUJACEM.NS', 'ACC.NS', 'SHREECEM.NS',
        'JKCEMENT.NS', 'RAMCOCEM.NS', 'LT.NS', 'DLF.NS', 'OBEROIRLTY.NS',
        # Industrial & Manufacturing
        'ABB.NS', 'SIEMENS.NS', 'BOSCHLTD.NS', 'HAVELLS.NS', 'VOLTAS.NS',
        'CUMMINSIND.NS', 'THERMAX.NS', 'CROMPTON.NS', 'POLYCAB.NS', 'KEI.NS',
        # Consumer & Retail
        'TRENT.NS', 'ABFRL.NS', 'PAGEIND.NS', 'PIIND.NS', 'VBL.NS',
        'MCDOWELL-N.NS', 'RADICO.NS', 'VAIBHAVGBL.NS', 'SHOPERSTOP.NS', 'TATAELXSI.NS',
        # Pharma & Chemicals
        'LALPATHLAB.NS', 'METROPOLIS.NS', 'PFIZER.NS', 'ABBOTINDIA.NS', 'SYNGENE.NS'
    ]
    
    # 50 Small-cap NSE stocks (Market cap < ₹5,000 Cr)
    small_cap = [
        # Banks & Finance
        'CSBBANK.NS', 'RBLBANK.NS', 'AUBANK.NS', 'EQUITASBNK.NS', 'UJJIVAN.NS',
        'IIFLWAM.NS', 'MANAPPURAM.NS', 'IIFL.NS', 'CDSL.NS', 'CAMS.NS',
        # IT & Technology
        'ROUTE.NS', 'KPITTECH.NS', 'CYIENT.NS', 'SONATSOFTW.NS', 'RATEGAIN.NS',
        'INTELLECT.NS', 'HAPPSTMNDS.NS', 'DATAPATTNS.NS', 'ZENSAR.NS', 'SASKEN.NS',
        # Manufacturing & Industrial
        'STARCEMENT.NS', 'HEIDELBERG.NS', 'ORIENTCEM.NS', 'INDIACEM.NS', 'JKPAPER.NS',
        'KAJARIACER.NS', 'CERA.NS', 'PGHH.NS', 'FINEORG.NS', 'GRINDWELL.NS',
        # Consumer & Retail
        'RELAXO.NS', 'VMART.NS', 'BATA.NS', 'APLAPOLLO.NS', 'SYMPHONY.NS',
        'GREENPLY.NS', 'SUNFLAG.NS', 'NESCO.NS', 'GMBREW.NS', 'TIINDIA.NS',
        # Pharma & Healthcare
        'IPCALAB.NS', 'LAURUSLABS.NS', 'GLENMARK.NS', 'GRANULES.NS', 'NATCOPHARM.NS',
        'CAPLIPOINT.NS', 'JBCHEPHARM.NS', 'FDC.NS', 'AJANTPHARM.NS', 'BLISSGVS.NS'
    ]
    
    # Combine all three categories
    return large_cap + mid_cap + small_cap


def main():
    parser = argparse.ArgumentParser(
        description='Download stock OHLCV data for forecasting system'
    )
    
    parser.add_argument(
        '--tickers',
        nargs='+',
        help='List of ticker symbols (e.g., AAPL MSFT GOOGL)'
    )
    
    parser.add_argument(
        '--universe',
        choices=['default', 'nifty50', 'largecap', 'midcap', 'smallcap'],
        help='Use a predefined universe: default (150 NSE stocks: 50 large+50 mid+50 small), nifty50, largecap (50), midcap (50), smallcap (50)'
    )
    
    parser.add_argument(
        '--start',
        type=str,
        required=True,
        help='Start date (YYYY-MM-DD)'
    )
    
    parser.add_argument(
        '--end',
        type=str,
        default=None,
        help='End date (YYYY-MM-DD), defaults to today'
    )
    
    parser.add_argument(
        '--output-dir',
        type=str,
        default='../../data/raw',
        help='Output directory for downloaded data'
    )
    
    parser.add_argument(
        '--format',
        choices=['csv', 'parquet'],
        default='csv',
        help='Output file format'
    )
    
    args = parser.parse_args()
    
    # Determine ticker list
    if args.tickers:
        tickers = args.tickers
    elif args.universe == 'nifty50':
        tickers = get_nifty50_tickers()
        if not tickers:
            logger.error("Failed to fetch Nifty 50 list, exiting")
            return
    elif args.universe == 'default':
        tickers = get_default_universe()
    elif args.universe == 'largecap':
        all_stocks = get_default_universe()
        tickers = all_stocks[:50]  # First 50 are large-cap
        logger.info("Using 50 large-cap NSE stocks")
    elif args.universe == 'midcap':
        all_stocks = get_default_universe()
        tickers = all_stocks[50:100]  # Next 50 are mid-cap
        logger.info("Using 50 mid-cap NSE stocks")
    elif args.universe == 'smallcap':
        all_stocks = get_default_universe()
        tickers = all_stocks[100:150]  # Last 50 are small-cap
        logger.info("Using 50 small-cap NSE stocks")
    else:
        logger.error("Must specify either --tickers or --universe")
        parser.print_help()
        return
    
    # Initialize downloader
    downloader = StockDataDownloader(output_dir=args.output_dir)
    
    # Download data
    stats = downloader.download_multiple(
        tickers=tickers,
        start_date=args.start,
        end_date=args.end,
        save_format=args.format
    )
    
    # Exit with error code if any downloads failed
    if stats['failed'] > 0:
        exit(1)


if __name__ == "__main__":
    main()
#      # Download all 150 NSE stocks (will take ~10-15 minutes)
# python download_data.py --universe default --start 2020-01-01

# # Download only Nifty 50
# python download_data.py --universe nifty50 --start 2019-01-01

# # Download only large-cap stocks
# python download_data.py --universe largecap --start 2020-01-01 --end 2024-01-01

# # Download specific Indian stocks
# python download_data.py --tickers RELIANCE.NS TCS.NS INFY.NS --start 2021-01-01

# # Quick test with 5 stocks
# python download_data.py --tickers RELIANCE.NS HDFCBANK.NS TCS.NS INFY.NS ITC.NS --start 2022-01-01
