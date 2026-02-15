"""
Quick script to download market index data for market-relative features

File path: stock_ai/scripts/data/download_market_index.py

Usage:
    python download_market_index.py
"""

import yfinance as yf
import pandas as pd
from pathlib import Path
from datetime import datetime
import sys

def download_nifty50(start_date='2019-01-01', end_date=None):
    """Download Nifty 50 index data."""
    if end_date is None:
        end_date = datetime.now().strftime('%Y-%m-%d')
    
    print("="*60)
    print("NIFTY 50 INDEX DOWNLOAD")
    print("="*60)
    print(f"Ticker: ^NSEI")
    print(f"Date range: {start_date} to {end_date}")
    print()
    
    try:
        # Download from Yahoo Finance
        print("Connecting to Yahoo Finance...")
        ticker = yf.Ticker('^NSEI')
        
        print("Downloading data...")
        df = ticker.history(start=start_date, end=end_date)
        
        if df.empty:
            print("\n❌ ERROR: No data returned!")
            print("\nTroubleshooting:")
            print("1. Check internet connection")
            print("2. Yahoo Finance might be blocking requests")
            print("3. Try: ^NSEI (Indian), ^GSPC (S&P 500), or ^DJI (Dow Jones)")
            return None
        
        print(f"✓ Downloaded {len(df)} rows")
        
        # Format data
        df = df.reset_index()
        print(f"Columns received: {df.columns.tolist()}")
        
        df = df.rename(columns={
            'Date': 'date',
            'Open': 'open',
            'High': 'high',
            'Low': 'low',
            'Close': 'close',
            'Volume': 'volume'
        })
        
        # Keep only OHLCV
        df = df[['date', 'open', 'high', 'low', 'close', 'volume']]
        df['ticker'] = '^NSEI'
        
        print(f"Date range: {df['date'].min().date()} to {df['date'].max().date()}")
        print(f"Sample close prices: {df['close'].head(3).tolist()}")
        
        # Determine output directory
        # Try multiple possible locations
        possible_dirs = [
            Path('../../data/raw'),           # From scripts/data/
            Path('../data/raw'),              # From scripts/
            Path('data/raw'),                 # From project root
            Path('stock_ai/data/raw'),        # From parent of project
        ]
        
        output_dir = None
        for pdir in possible_dirs:
            if pdir.parent.exists():
                output_dir = pdir
                break
        
        if output_dir is None:
            # Create in current directory
            output_dir = Path('data/raw')
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Save file (use NSEI.csv instead of ^NSEI.csv for Windows compatibility)
        output_file = output_dir / 'NSEI.csv'
        print(f"\nSaving to: {output_file.absolute()}")
        
        df.to_csv(output_file, index=False)
        
        # Verify file was created
        if output_file.exists():
            file_size = output_file.stat().st_size / 1024  # KB
            print(f"✓ File saved successfully ({file_size:.1f} KB)")
            print(f"✓ Full path: {output_file.absolute()}")
        else:
            print("❌ ERROR: File was not created!")
            return None
        
        print("\n" + "="*60)
        print("SUCCESS!")
        print("="*60)
        print(f"Market index data saved to: {output_file.absolute()}")
        print("\nNext steps:")
        print("1. Navigate to stock_ai/features/")
        print("2. Run: python build_features.py --input ../data/raw --output ../data/processed --market-index NSEI")
        print("="*60)
        
        return df
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        print(f"\nFull error details:")
        import traceback
        traceback.print_exc()
        return None

if __name__ == "__main__":
    print("\nStarting download...")
    result = download_nifty50()
    
    if result is None:
        print("\n❌ Download failed!")
        sys.exit(1)
    else:
        print("\n✓ Download completed successfully!")
        sys.exit(0)
        