"""
Data Validation Script for Stock AI Forecasting System
Validates downloaded OHLCV data for quality issues

File path: stock_ai/scripts/data/validate_data.py

Usage:
    python validate_data.py
    python validate_data.py --data-dir ../../data/raw --report validation_report.csv
"""

import argparse
import logging
from pathlib import Path
from typing import Dict, List, Tuple
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class DataValidator:
    """Validate stock OHLCV data quality."""
    
    def __init__(self, data_dir: str = "../../data/raw"):
        """
        Initialize validator.
        
        Args:
            data_dir: Directory containing raw data files
        """
        self.data_dir = Path(data_dir)
        if not self.data_dir.exists():
            raise ValueError(f"Data directory not found: {data_dir}")
    
    def load_data(self, filepath: Path) -> pd.DataFrame:
        """Load data from CSV or parquet file."""
        if filepath.suffix == '.csv':
            return pd.read_csv(filepath, parse_dates=['date'])
        elif filepath.suffix == '.parquet':
            return pd.read_parquet(filepath)
        else:
            raise ValueError(f"Unsupported file format: {filepath.suffix}")
    
    def validate_ticker(self, filepath: Path) -> Dict:
        """
        Validate a single ticker's data.
        
        Args:
            filepath: Path to data file
            
        Returns:
            Dictionary with validation results
        """
        ticker = filepath.stem
        result = {
            'ticker': ticker,
            'file': filepath.name,
            'valid': True,
            'issues': [],
            'warnings': [],
            'row_count': 0,
            'date_range': '',
            'missing_dates': 0,
            'zero_volume_pct': 0.0,
            'negative_prices': 0,
            'ohlc_violations': 0,
            'duplicate_dates': 0
        }
        
        try:
            df = self.load_data(filepath)
            result['row_count'] = len(df)
            
            # Basic structure validation
            required_cols = ['date', 'open', 'high', 'low', 'close', 'volume']
            missing_cols = [col for col in required_cols if col not in df.columns]
            if missing_cols:
                result['issues'].append(f"Missing columns: {missing_cols}")
                result['valid'] = False
                return result
            
            # Date range
            df['date'] = pd.to_datetime(df['date'])
            result['date_range'] = f"{df['date'].min().date()} to {df['date'].max().date()}"
            
            # Check for minimum data points
            if len(df) < 252:  # Less than 1 year of trading days
                result['warnings'].append(f"Only {len(df)} rows, may be insufficient for training")
            
            # Check for duplicate dates
            duplicates = df['date'].duplicated().sum()
            if duplicates > 0:
                result['duplicate_dates'] = duplicates
                result['issues'].append(f"{duplicates} duplicate dates found")
                result['valid'] = False
            
            # Check for missing dates (gaps)
            df_sorted = df.sort_values('date')
            date_range = pd.date_range(
                start=df_sorted['date'].min(),
                end=df_sorted['date'].max(),
                freq='B'  # Business days
            )
            expected_days = len(date_range)
            actual_days = len(df_sorted)
            missing_days = expected_days - actual_days
            
            # Allow some missing days for holidays, but flag excessive gaps
            missing_pct = (missing_days / expected_days) * 100
            result['missing_dates'] = missing_days
            if missing_pct > 5:  # More than 5% missing
                result['warnings'].append(f"{missing_days} missing trading days ({missing_pct:.1f}%)")
            
            # Check for negative or zero prices
            price_cols = ['open', 'high', 'low', 'close']
            for col in price_cols:
                negative = (df[col] <= 0).sum()
                if negative > 0:
                    result['negative_prices'] += negative
                    result['issues'].append(f"{negative} non-positive values in {col}")
                    result['valid'] = False
            
            # Check OHLC relationships: high >= open/close >= low
            ohlc_violations = 0
            if not (df['high'] >= df['open']).all():
                violations = (~(df['high'] >= df['open'])).sum()
                ohlc_violations += violations
                result['issues'].append(f"{violations} rows where high < open")
            
            if not (df['high'] >= df['close']).all():
                violations = (~(df['high'] >= df['close'])).sum()
                ohlc_violations += violations
                result['issues'].append(f"{violations} rows where high < close")
            
            if not (df['low'] <= df['open']).all():
                violations = (~(df['low'] <= df['open'])).sum()
                ohlc_violations += violations
                result['issues'].append(f"{violations} rows where low > open")
            
            if not (df['low'] <= df['close']).all():
                violations = (~(df['low'] <= df['close'])).sum()
                ohlc_violations += violations
                result['issues'].append(f"{violations} rows where low > close")
            
            result['ohlc_violations'] = ohlc_violations
            if ohlc_violations > 0:
                result['valid'] = False
            
            # Check volume
            zero_volume = (df['volume'] == 0).sum()
            zero_volume_pct = (zero_volume / len(df)) * 100
            result['zero_volume_pct'] = zero_volume_pct
            
            if zero_volume_pct > 10:
                result['warnings'].append(f"{zero_volume_pct:.1f}% zero-volume days")
            
            # Check for extreme price movements (potential data errors)
            df['return'] = df['close'].pct_change()
            extreme_moves = (df['return'].abs() > 0.5).sum()  # >50% single-day move
            if extreme_moves > 0:
                result['warnings'].append(f"{extreme_moves} extreme price movements (>50%)")
            
            # Check for constant prices (potential stale data)
            price_changes = df['close'].diff().abs()
            no_change_days = (price_changes == 0).sum()
            no_change_pct = (no_change_days / len(df)) * 100
            if no_change_pct > 5:
                result['warnings'].append(f"{no_change_pct:.1f}% days with no price change")
            
        except Exception as e:
            result['issues'].append(f"Error during validation: {str(e)}")
            result['valid'] = False
        
        return result
    
    def validate_all(self, file_pattern: str = "*.csv") -> pd.DataFrame:
        """
        Validate all data files in directory.
        
        Args:
            file_pattern: Glob pattern for files to validate
            
        Returns:
            DataFrame with validation results
        """
        files = list(self.data_dir.glob(file_pattern))
        
        if not files:
            logger.warning(f"No files found matching {file_pattern} in {self.data_dir}")
            return pd.DataFrame()
        
        logger.info(f"Validating {len(files)} files...")
        
        results = []
        for filepath in files:
            logger.debug(f"Validating {filepath.name}")
            result = self.validate_ticker(filepath)
            results.append(result)
        
        df_results = pd.DataFrame(results)
        
        # Print summary
        self.print_summary(df_results)
        
        return df_results
    
    def print_summary(self, results_df: pd.DataFrame):
        """Print validation summary."""
        logger.info("\n" + "="*80)
        logger.info("VALIDATION SUMMARY")
        logger.info("="*80)
        
        total = len(results_df)
        valid = results_df['valid'].sum()
        invalid = total - valid
        
        logger.info(f"Total files: {total}")
        logger.info(f"Valid: {valid} ({valid/total*100:.1f}%)")
        logger.info(f"Invalid: {invalid} ({invalid/total*100:.1f}%)")
        
        if invalid > 0:
            logger.warning(f"\nInvalid tickers: {results_df[~results_df['valid']]['ticker'].tolist()}")
        
        # Statistics
        logger.info(f"\nData Statistics:")
        logger.info(f"  Average rows per ticker: {results_df['row_count'].mean():.0f}")
        logger.info(f"  Total data points: {results_df['row_count'].sum():,}")
        logger.info(f"  Average zero-volume %: {results_df['zero_volume_pct'].mean():.2f}%")
        
        # Warnings summary
        total_warnings = results_df['warnings'].apply(len).sum()
        if total_warnings > 0:
            logger.warning(f"\nTotal warnings: {total_warnings}")
            logger.warning("Run with --verbose to see all warnings")
        
        # Issues summary
        total_issues = results_df['issues'].apply(len).sum()
        if total_issues > 0:
            logger.error(f"\nTotal issues: {total_issues}")
            logger.error("Files with issues:")
            for _, row in results_df[results_df['issues'].apply(len) > 0].iterrows():
                logger.error(f"  {row['ticker']}: {row['issues']}")
        
        logger.info("="*80)


def main():
    parser = argparse.ArgumentParser(
        description='Validate stock OHLCV data quality'
    )
    
    parser.add_argument(
        '--data-dir',
        type=str,
        default='../../data/raw',
        help='Directory containing data files'
    )
    
    parser.add_argument(
        '--pattern',
        type=str,
        default='*.csv',
        help='File pattern to validate (e.g., *.csv, *.parquet)'
    )
    
    parser.add_argument(
        '--report',
        type=str,
        help='Save validation report to CSV file'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed warnings for each ticker'
    )
    
    args = parser.parse_args()
    
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
    
    # Run validation
    validator = DataValidator(data_dir=args.data_dir)
    results = validator.validate_all(file_pattern=args.pattern)
    
    # Save report if requested
    if args.report and not results.empty:
        results.to_csv(args.report, index=False)
        logger.info(f"\nValidation report saved to: {args.report}")
    
    # Exit with error code if any files are invalid
    if not results.empty and not results['valid'].all():
        exit(1)


if __name__ == "__main__":
    main()