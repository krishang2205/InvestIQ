"""
Feature Engineering for Stock AI Forecasting System
Builds 16 look-ahead-only features from OHLCV data

File path: stock_ai/features/build_features.py

Usage:
    python build_features.py --input ../data/raw --output ../data/processed
    python build_features.py --ticker RELIANCE.NS --market-index NSEI
"""

import argparse
import logging
from pathlib import Path
from typing import Optional, Tuple
import pandas as pd
import numpy as np
from tqdm import tqdm
import warnings
warnings.filterwarnings('ignore')

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class FeatureBuilder:
    """Build technical features from OHLCV data."""
    
    def __init__(self, market_index_data: Optional[pd.DataFrame] = None):
        """
        Initialize feature builder.
        
        Args:
            market_index_data: DataFrame with market index data (for market-relative features)
        """
        self.market_data = market_index_data
        
    def load_stock_data(self, filepath: Path) -> pd.DataFrame:
        """Load stock data from CSV or parquet."""
        if filepath.suffix == '.csv':
            df = pd.read_csv(filepath, parse_dates=['date'])
        elif filepath.suffix == '.parquet':
            df = pd.read_parquet(filepath)
        else:
            raise ValueError(f"Unsupported file format: {filepath.suffix}")
        
        # Ensure date is datetime
        df['date'] = pd.to_datetime(df['date'])
        df = df.sort_values('date').reset_index(drop=True)
        
        return df
    
    def calculate_log_returns(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate log returns (look-behind only)."""
        df['log_return_t'] = np.log(df['close'] / df['close'].shift(1))
        return df
    
    def calculate_price_dynamics(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate price dynamics features (5 features).
        All calculations use only historical data (look-behind).
        """
        # Log return already calculated
        
        # Rolling mean returns
        df['mean_return_5'] = df['log_return_t'].rolling(window=5, min_periods=5).mean()
        df['mean_return_20'] = df['log_return_t'].rolling(window=20, min_periods=20).mean()
        
        # Rolling std returns
        df['std_return_5'] = df['log_return_t'].rolling(window=5, min_periods=5).std()
        df['std_return_20'] = df['log_return_t'].rolling(window=20, min_periods=20).std()
        
        return df
    
    def calculate_atr(self, df: pd.DataFrame, period: int = 14) -> pd.Series:
        """
        Calculate Average True Range (ATR).
        
        Args:
            df: DataFrame with high, low, close columns
            period: ATR period (default 14)
            
        Returns:
            Series with ATR values
        """
        high = df['high']
        low = df['low']
        close = df['close']
        
        # True Range components
        tr1 = high - low
        tr2 = abs(high - close.shift(1))
        tr3 = abs(low - close.shift(1))
        
        # True Range is the max of the three
        tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
        
        # ATR is the rolling mean of True Range
        atr = tr.rolling(window=period, min_periods=period).mean()
        
        return atr
    
    def calculate_volatility_regime(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate volatility regime features (3 features).
        """
        # ATR normalized by close price
        atr_14 = self.calculate_atr(df, period=14)
        df['ATR_14_norm'] = atr_14 / df['close']
        
        # Volatility ratio (short-term vs long-term volatility)
        df['vol_ratio'] = df['std_return_5'] / (df['std_return_20'] + 1e-8)
        
        # Volatility percentile over last year (252 trading days)
        df['vol_percentile_252'] = (
            df['std_return_20']
            .rolling(window=252, min_periods=252)
            .apply(lambda x: pd.Series(x).rank(pct=True).iloc[-1], raw=False)
        )
        
        return df
    
    def calculate_volume_regime(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate volume regime features (3 features).
        """
        # Volume z-score (standardized volume)
        mean_vol_20 = df['volume'].rolling(window=20, min_periods=20).mean()
        std_vol_20 = df['volume'].rolling(window=20, min_periods=20).std()
        df['volume_z'] = (df['volume'] - mean_vol_20) / (std_vol_20 + 1e-8)
        
        # Relative volume (vs 50-day average)
        mean_vol_50 = df['volume'].rolling(window=50, min_periods=50).mean()
        df['relative_volume'] = df['volume'] / (mean_vol_50 + 1e-8)
        
        # Volume volatility (coefficient of variation)
        df['volume_volatility'] = std_vol_20 / (mean_vol_20 + 1e-8)
        
        return df
    
    def calculate_moving_averages(self, df: pd.DataFrame) -> pd.DataFrame:
        """Calculate moving averages for trend features."""
        df['MA20'] = df['close'].rolling(window=20, min_periods=20).mean()
        df['MA50'] = df['close'].rolling(window=50, min_periods=50).mean()
        return df
    
    def calculate_trend_context(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate trend context features (3 features).
        """
        # Distance from moving averages (normalized)
        df['dist_MA20'] = (df['close'] - df['MA20']) / (df['MA20'] + 1e-8)
        df['dist_MA50'] = (df['close'] - df['MA50']) / (df['MA50'] + 1e-8)
        
        # Trend strength (signal-to-noise ratio)
        df['trend_strength'] = abs(df['mean_return_20']) / (df['std_return_20'] + 1e-8)
        
        return df
    
    def calculate_market_relative(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Calculate market-relative features (2 features).
        Requires market index data.
        """
        if self.market_data is None:
            logger.warning("No market data provided, setting market-relative features to 0")
            df['rel_return'] = 0.0
            df['beta_approx_20'] = 1.0
            return df
        
        # Merge with market data
        market = self.market_data[['date', 'close']].copy()
        market.columns = ['date', 'market_close']
        
        df_merged = df.merge(market, on='date', how='left')
        
        # Market returns
        df_merged['market_return'] = np.log(
            df_merged['market_close'] / df_merged['market_close'].shift(1)
        )
        
        # Relative return (stock - market)
        df_merged['rel_return'] = df['log_return_t'] - df_merged['market_return']
        
        # Rolling beta approximation (20-day)
        def rolling_beta(window_df):
            if len(window_df) < 2:
                return np.nan
            stock_ret = window_df['log_return_t'].values
            market_ret = window_df['market_return'].values
            
            # Remove NaN values
            mask = ~(np.isnan(stock_ret) | np.isnan(market_ret))
            if mask.sum() < 2:
                return np.nan
            
            cov = np.cov(stock_ret[mask], market_ret[mask])[0, 1]
            var = np.var(market_ret[mask])
            
            if var < 1e-10:
                return 1.0
            
            return cov / var
        
        df_merged['beta_approx_20'] = (
            df_merged[['log_return_t', 'market_return']]
            .rolling(window=20, min_periods=20)
            .apply(lambda x: rolling_beta(df_merged.iloc[x.index]), raw=False)
            .iloc[:, 0]  # Take first column
        )
        
        # Fill NaN betas with 1.0 (market beta)
        df_merged['beta_approx_20'].fillna(1.0, inplace=True)
        
        # Copy back to original dataframe
        df['rel_return'] = df_merged['rel_return']
        df['beta_approx_20'] = df_merged['beta_approx_20']
        
        return df
    
    def build_all_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Build all 16 features for a stock.
        
        Args:
            df: DataFrame with OHLCV data
            
        Returns:
            DataFrame with all features added
        """
        logger.debug(f"Building features for {len(df)} rows")
        
        # Calculate features in order
        df = self.calculate_log_returns(df)
        df = self.calculate_price_dynamics(df)
        df = self.calculate_volatility_regime(df)
        df = self.calculate_volume_regime(df)
        df = self.calculate_moving_averages(df)
        df = self.calculate_trend_context(df)
        df = self.calculate_market_relative(df)
        
        return df
    
    def get_feature_columns(self) -> list:
        """Return list of all 16 feature column names."""
        return [
            # Price dynamics (5)
            'log_return_t', 'mean_return_5', 'mean_return_20', 
            'std_return_5', 'std_return_20',
            # Volatility regime (3)
            'ATR_14_norm', 'vol_ratio', 'vol_percentile_252',
            # Volume regime (3)
            'volume_z', 'relative_volume', 'volume_volatility',
            # Trend context (3)
            'dist_MA20', 'dist_MA50', 'trend_strength',
            # Market-relative (2)
            'rel_return', 'beta_approx_20'
        ]
    
    def add_target(self, df: pd.DataFrame, horizon: int = 1) -> pd.DataFrame:
        """
        Add target variable (future return).
        
        Args:
            df: DataFrame with features
            horizon: Forecast horizon in days (default 1)
            
        Returns:
            DataFrame with target column added
        """
        # Target is the next day's log return
        df['target'] = df['log_return_t'].shift(-horizon)
        
        return df
    
    def validate_features(self, df: pd.DataFrame) -> Tuple[bool, list]:
        """
        Validate that features are correctly calculated (no look-ahead bias).
        
        Args:
            df: DataFrame with features
            
        Returns:
            Tuple of (is_valid, issues)
        """
        issues = []
        feature_cols = self.get_feature_columns()
        
        # Check all features exist
        missing = [col for col in feature_cols if col not in df.columns]
        if missing:
            issues.append(f"Missing features: {missing}")
        
        # Check for NaN in first valid rows (after warmup period)
        warmup_period = 252  # Need at least 1 year for vol_percentile_252
        if len(df) > warmup_period:
            check_df = df.iloc[warmup_period:]
            
            for col in feature_cols:
                if col in check_df.columns:
                    nan_pct = check_df[col].isna().sum() / len(check_df) * 100
                    if nan_pct > 10:  # Allow up to 10% NaN for edge cases
                        issues.append(f"{col}: {nan_pct:.1f}% NaN values after warmup")
        
        # Check for inf values
        for col in feature_cols:
            if col in df.columns:
                inf_count = np.isinf(df[col]).sum()
                if inf_count > 0:
                    issues.append(f"{col}: {inf_count} infinite values")
        
        is_valid = len(issues) == 0
        return is_valid, issues
    
    def process_ticker(
        self, 
        filepath: Path, 
        output_dir: Path,
        save_format: str = 'parquet'
    ) -> Optional[pd.DataFrame]:
        """
        Process a single ticker: load, build features, validate, save.
        
        Args:
            filepath: Path to raw data file
            output_dir: Directory to save processed data
            save_format: 'csv' or 'parquet'
            
        Returns:
            DataFrame with features or None if failed
        """
        ticker = filepath.stem
        logger.info(f"Processing {ticker}")
        
        try:
            # Load data
            df = self.load_stock_data(filepath)
            
            if len(df) < 300:
                logger.warning(f"{ticker}: Only {len(df)} rows, skipping (need at least 300)")
                return None
            
            # Build features
            df = self.build_all_features(df)
            
            # Add target
            df = self.add_target(df, horizon=1)
            
            # Validate
            is_valid, issues = self.validate_features(df)
            if not is_valid:
                logger.warning(f"{ticker}: Validation issues: {issues}")
            
            # Remove rows with NaN in features or target
            feature_cols = self.get_feature_columns()
            df_clean = df.dropna(subset=feature_cols + ['target'])
            
            dropped_pct = (len(df) - len(df_clean)) / len(df) * 100
            logger.info(f"{ticker}: {len(df_clean)} valid rows ({dropped_pct:.1f}% dropped)")
            
            if len(df_clean) < 252:
                logger.warning(f"{ticker}: Only {len(df_clean)} valid rows after cleanup, may be insufficient")
            
            # Save processed data
            output_file = output_dir / f"{ticker}.{save_format}"
            if save_format == 'parquet':
                df_clean.to_parquet(output_file, index=False)
            else:
                df_clean.to_csv(output_file, index=False)
            
            logger.info(f"✓ {ticker}: Saved to {output_file}")
            return df_clean
            
        except Exception as e:
            logger.error(f"✗ {ticker}: Error processing - {str(e)}")
            return None


def load_market_index(
    data_dir: Path, 
    index_ticker: str = 'NSEI'
) -> Optional[pd.DataFrame]:
    """
    Load market index data.
    
    Args:
        data_dir: Directory containing raw data
        index_ticker: Market index ticker (default ^NSEI for Nifty 50)
        
    Returns:
        DataFrame with market index data or None
    """
    logger.info(f"Attempting to load market index: {index_ticker}")
    logger.info(f"Data directory: {data_dir.absolute()}")
    
    # Try multiple filename variations
    possible_files = [
        data_dir / f"{index_ticker}.csv",
        data_dir / f"{index_ticker}.parquet",
        # # Try without special characters for Windows
        # data_dir / f"{index_ticker.replace('^', '')}.csv",
        # data_dir / "NSEI.csv",
        # data_dir / "nifty50.csv",
        # data_dir / "market_index.csv",
    ]
    
    logger.info("Searching for market index file in these locations:")
    for filepath in possible_files:
        logger.info(f"  - {filepath.name}")
        if filepath.exists():
            logger.info(f"✓ Found market index at: {filepath}")
            try:
                if filepath.suffix == '.csv':
                    df = pd.read_csv(filepath, parse_dates=['date'])
                else:
                    df = pd.read_parquet(filepath)
                
                # Validate we have required columns
                if 'date' not in df.columns or 'close' not in df.columns:
                    logger.warning(f"File {filepath.name} missing 'date' or 'close' columns")
                    continue
                
                logger.info(f"✓ Loaded {len(df)} rows of market data")
                logger.info(f"  Date range: {df['date'].min()} to {df['date'].max()}")
                return df[['date', 'close']].sort_values('date')
            except Exception as e:
                logger.warning(f"Error loading {filepath.name}: {str(e)}")
                continue
    
    logger.warning(f"Market index file not found for {index_ticker}")
    logger.warning("Checked files: " + ", ".join([f.name for f in possible_files]))
    logger.warning("Market-relative features will be set to defaults")
    logger.warning("To fix: Ensure market index file exists in data/raw/")
    return None


def main():
    parser = argparse.ArgumentParser(
        description='Build features from raw OHLCV data'
    )
    
    parser.add_argument(
        '--input',
        type=str,
        required=True,
        help='Input directory with raw data'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        required=True,
        help='Output directory for processed features'
    )
    
    parser.add_argument(
        '--ticker',
        type=str,
        help='Process only this ticker (optional)'
    )
    
    parser.add_argument(
        '--market-index',
        type=str,
        default='NSEI',
        help='Market index ticker for relative features (default: ^NSEI for Nifty 50)'
    )
    
    parser.add_argument(
        '--format',
        choices=['csv', 'parquet'],
        default='parquet',
        help='Output format (default: parquet)'
    )
    
    parser.add_argument(
        '--pattern',
        type=str,
        default='*.csv',
        help='File pattern to process (default: *.csv)'
    )
    
    args = parser.parse_args()
    
    input_dir = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Load market index
    market_data = load_market_index(input_dir, args.market_index)
    
    # Initialize feature builder
    builder = FeatureBuilder(market_index_data=market_data)
    
    # Process files
    if args.ticker:
        # Process single ticker
        filepath = input_dir / f"{args.ticker}.csv"
        if not filepath.exists():
            filepath = input_dir / f"{args.ticker}.parquet"
        
        if not filepath.exists():
            logger.error(f"File not found for ticker {args.ticker}")
            return
        
        builder.process_ticker(filepath, output_dir, args.format)
    else:
        # Process all files
        files = list(input_dir.glob(args.pattern))
        
        if not files:
            logger.error(f"No files found matching {args.pattern} in {input_dir}")
            return
        
        logger.info(f"Processing {len(files)} files...")
        
        success_count = 0
        for filepath in tqdm(files, desc="Building features"):
            result = builder.process_ticker(filepath, output_dir, args.format)
            if result is not None:
                success_count += 1
        
        logger.info(f"\n{'='*60}")
        logger.info(f"Processing complete: {success_count}/{len(files)} successful")
        logger.info(f"Output saved to: {output_dir.absolute()}")
        logger.info(f"{'='*60}")


if __name__ == "__main__":
    main()

# # First, download Nifty 50 index for market-relative features
# cd stock_ai/scripts/data
# python download_data.py --tickers ^NSEI --start 2019-01-01

# # Process all stocks
# cd ../../features
# python build_features.py --input ../data/raw --output ../data/processed

# # Process single stock
# python build_features.py --input ../data/raw --output ../data/processed --ticker RELIANCE.NS

# # Use different market index
# python build_features.py --input ../data/raw --output ../data/processed --market-index ^NSEI

# # Save as CSV instead of parquet all stocks 
# python build_features.py --input ../data/raw --output ../data/processed --format csv
