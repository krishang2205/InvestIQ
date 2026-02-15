"""
Unit tests for feature engineering
Ensures no data leakage and correct calculations

File path: stock_ai/tests/test_features.py

Usage:
    pytest test_features.py -v
    python -m pytest test_features.py::TestFeatureBuilder::test_no_lookahead_bias
"""

import pytest
import pandas as pd
import numpy as np
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from features.build_features import FeatureBuilder


@pytest.fixture
def sample_data():
    """Create sample OHLCV data for testing."""
    np.random.seed(42)
    dates = pd.date_range('2020-01-01', periods=500, freq='D')
    
    # Generate realistic stock data
    close_prices = 100 * np.exp(np.cumsum(np.random.randn(500) * 0.02))
    
    df = pd.DataFrame({
        'date': dates,
        'open': close_prices * (1 + np.random.randn(500) * 0.005),
        'high': close_prices * (1 + abs(np.random.randn(500)) * 0.01),
        'low': close_prices * (1 - abs(np.random.randn(500)) * 0.01),
        'close': close_prices,
        'volume': np.random.randint(1000000, 10000000, 500),
        'ticker': 'TEST'
    })
    
    return df


@pytest.fixture
def market_data():
    """Create sample market index data."""
    np.random.seed(43)
    dates = pd.date_range('2020-01-01', periods=500, freq='D')
    
    close_prices = 10000 * np.exp(np.cumsum(np.random.randn(500) * 0.015))
    
    df = pd.DataFrame({
        'date': dates,
        'close': close_prices
    })
    
    return df


@pytest.fixture
def processed_data():
    """Load sample processed data from the processed data folder."""
    # Path to processed data folder
    processed_dir = Path(__file__).parent.parent / 'data' / 'processed'
    
    # Get first available CSV file from processed folder
    csv_files = list(processed_dir.glob('*.csv'))
    
    if not csv_files:
        raise FileNotFoundError(f"No CSV files found in {processed_dir}")
    
    # Load the first CSV file
    df = pd.read_csv(csv_files[0])
    
    # Convert date column to datetime if it exists
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'])
    
    return df


class TestFeatureBuilder:
    """Test suite for FeatureBuilder class."""
    
    def test_initialization(self):
        """Test FeatureBuilder initialization."""
        builder = FeatureBuilder()
        assert builder.market_data is None
        
        market_df = pd.DataFrame({'date': [], 'close': []})
        builder_with_market = FeatureBuilder(market_index_data=market_df)
        assert builder_with_market.market_data is not None
    
    def test_log_returns_calculation(self, sample_data):
        """Test log returns are calculated correctly."""
        builder = FeatureBuilder()
        df = builder.calculate_log_returns(sample_data.copy())
        
        # Check column exists
        assert 'log_return_t' in df.columns
        
        # Check first value is NaN (no previous price)
        assert pd.isna(df['log_return_t'].iloc[0])
        
        # Check manual calculation for second row
        manual_return = np.log(df['close'].iloc[1] / df['close'].iloc[0])
        assert np.isclose(df['log_return_t'].iloc[1], manual_return)
    
    def test_no_lookahead_bias(self, sample_data):
        """
        CRITICAL TEST: Ensure no feature uses future information.
        """
        builder = FeatureBuilder()
        df = builder.build_all_features(sample_data.copy())
        
        # For each feature, verify it only uses past data
        # We'll do this by checking that changing future prices doesn't affect past features
        
        feature_cols = builder.get_feature_columns()
        
        # Take a snapshot of features at row 300
        row_idx = 300
        original_features = df.iloc[row_idx][feature_cols].copy()
        
        # Modify future data (after row 300)
        df_modified = sample_data.copy()
        df_modified.loc[df_modified.index > row_idx, 'close'] *= 2.0  # Double future prices
        df_modified.loc[df_modified.index > row_idx, 'volume'] *= 2.0
        
        # Recalculate features
        df_modified = builder.build_all_features(df_modified)
        modified_features = df_modified.iloc[row_idx][feature_cols]
        
        # Features at row 300 should be identical (within numerical precision)
        for col in feature_cols:
            if not pd.isna(original_features[col]) and not pd.isna(modified_features[col]):
                assert np.isclose(original_features[col], modified_features[col], rtol=1e-10), \
                    f"Feature {col} uses future data! Changed when future prices changed."
    
    def test_price_dynamics_features(self, sample_data):
        """Test price dynamics features calculation."""
        builder = FeatureBuilder()
        df = builder.calculate_log_returns(sample_data.copy())
        df = builder.calculate_price_dynamics(df)
        
        required_features = ['mean_return_5', 'mean_return_20', 'std_return_5', 'std_return_20']
        
        for feat in required_features:
            assert feat in df.columns
            
            # Check that early rows are NaN (not enough history)
            assert pd.isna(df[feat].iloc[0])
            
            # Check values are reasonable (not all zero or NaN)
            valid_values = df[feat].dropna()
            assert len(valid_values) > 0
    
    def test_atr_calculation(self, sample_data):
        """Test ATR calculation."""
        builder = FeatureBuilder()
        atr = builder.calculate_atr(sample_data, period=14)
        
        # ATR should be positive
        assert (atr.dropna() > 0).all()
        
        # First 14 rows should be NaN
        assert pd.isna(atr.iloc[:13]).all()
    
    def test_volatility_regime_features(self, sample_data):
        """Test volatility regime features."""
        builder = FeatureBuilder()
        df = builder.calculate_log_returns(sample_data.copy())
        df = builder.calculate_price_dynamics(df)
        df = builder.calculate_volatility_regime(df)
        
        # Check ATR_14_norm is between 0 and 1 (typically)
        valid_atr = df['ATR_14_norm'].dropna()
        assert (valid_atr > 0).all()
        assert (valid_atr < 1).all()  # Should be < 100% of price
        
        # Check vol_ratio is positive
        valid_ratio = df['vol_ratio'].dropna()
        assert (valid_ratio > 0).all()
        
        # Check vol_percentile is between 0 and 1
        valid_pct = df['vol_percentile_252'].dropna()
        assert (valid_pct >= 0).all()
        assert (valid_pct <= 1).all()
    
    def test_volume_regime_features(self, sample_data):
        """Test volume regime features."""
        builder = FeatureBuilder()
        df = builder.calculate_volume_regime(sample_data.copy())
        
        # Volume z-score should have mean ~0 and std ~1 (after warmup)
        valid_z = df['volume_z'].iloc[50:].dropna()
        assert abs(valid_z.mean()) < 0.5
        assert abs(valid_z.std() - 1.0) < 0.5
        
        # Relative volume should be around 1.0 on average
        valid_rel = df['relative_volume'].dropna()
        assert valid_rel.mean() > 0.5
        assert valid_rel.mean() < 2.0
    
    def test_trend_context_features(self, sample_data):
        """Test trend context features."""
        builder = FeatureBuilder()
        df = builder.calculate_log_returns(sample_data.copy())
        df = builder.calculate_price_dynamics(df)
        df = builder.calculate_moving_averages(df)
        df = builder.calculate_trend_context(df)
        
        # MA distance should be small (typically < 0.2 or 20%)
        valid_ma20 = df['dist_MA20'].dropna()
        assert abs(valid_ma20.mean()) < 0.2
        
        # Trend strength should be positive
        valid_trend = df['trend_strength'].dropna()
        assert (valid_trend >= 0).all()
    
    def test_market_relative_features(self, sample_data, market_data):
        """Test market-relative features."""
        builder = FeatureBuilder(market_index_data=market_data)
        df = builder.calculate_log_returns(sample_data.copy())
        df = builder.calculate_market_relative(df)
        
        # Relative return should exist
        assert 'rel_return' in df.columns
        
        # Beta should be around 0.5-1.5 for typical stocks
        valid_beta = df['beta_approx_20'].dropna()
        assert valid_beta.mean() > 0
        assert valid_beta.mean() < 3.0
    
    def test_market_relative_without_index(self, sample_data):
        """Test market-relative features when no market data provided."""
        builder = FeatureBuilder(market_index_data=None)
        df = builder.calculate_log_returns(sample_data.copy())
        df = builder.calculate_market_relative(df)
        
        # Should default to 0 for rel_return and 1 for beta
        assert 'rel_return' in df.columns
        assert 'beta_approx_20' in df.columns
        assert (df['rel_return'] == 0.0).all()
        assert (df['beta_approx_20'] == 1.0).all()
    
    def test_all_16_features(self, sample_data, market_data):
        """Test that all 16 features are created."""
        builder = FeatureBuilder(market_index_data=market_data)
        df = builder.build_all_features(sample_data.copy())
        
        expected_features = builder.get_feature_columns()
        assert len(expected_features) == 16
        
        for feat in expected_features:
            assert feat in df.columns, f"Missing feature: {feat}"
    
    def test_target_creation(self, sample_data):
        """Test target variable creation."""
        builder = FeatureBuilder()
        df = builder.calculate_log_returns(sample_data.copy())
        df = builder.add_target(df, horizon=1)
        
        # Target should exist
        assert 'target' in df.columns
        
        # Target at row i should equal log_return at row i+1
        for i in range(10, 20):  # Check a few rows
            if not pd.isna(df['target'].iloc[i]):
                assert np.isclose(
                    df['target'].iloc[i],
                    df['log_return_t'].iloc[i + 1]
                )
    
    def test_feature_validation(self, sample_data, market_data):
        """Test feature validation logic."""
        builder = FeatureBuilder(market_index_data=market_data)
        df = builder.build_all_features(sample_data.copy())
        
        is_valid, issues = builder.validate_features(df)
        
        # Should have some issues (NaN in early rows due to warmup)
        # but should not have infinite values
        assert 'infinite' not in ' '.join(issues).lower()
    
    def test_no_infinite_values(self, sample_data, market_data):
        """Test that no infinite values are generated."""
        builder = FeatureBuilder(market_index_data=market_data)
        df = builder.build_all_features(sample_data.copy())
        
        feature_cols = builder.get_feature_columns()
        
        for col in feature_cols:
            inf_count = np.isinf(df[col]).sum()
            assert inf_count == 0, f"Infinite values found in {col}"
    
    def test_feature_stability(self, sample_data):
        """Test that features are numerically stable."""
        builder = FeatureBuilder()
        
        # Add some edge cases
        edge_df = sample_data.copy()
        
        # Add zero volume day
        edge_df.loc[100, 'volume'] = 0
        
        # Add constant price period
        edge_df.loc[200:205, 'close'] = edge_df.loc[199, 'close']
        
        # Build features - should not crash
        df = builder.build_all_features(edge_df)
        
        # Check that most features are still calculated
        feature_cols = builder.get_feature_columns()
        for col in feature_cols:
            valid_pct = (~df[col].isna()).sum() / len(df) * 100
            assert valid_pct > 50, f"{col} has too many NaN values ({valid_pct:.1f}% valid)"


class TestDataLeakage:
    """Additional tests specifically for data leakage."""
    
    def test_rolling_calculations_no_leakage(self, sample_data):
        """Test that rolling calculations don't include current or future data."""
        builder = FeatureBuilder()
        df = builder.build_all_features(sample_data.copy())
        
        # Check that rolling mean at time t only uses data up to t-1
        # We'll verify this for mean_return_5
        
        for i in range(10, 20):
            # Manual calculation of 5-day mean return ending at i-1
            manual_mean = df['log_return_t'].iloc[i-5:i].mean()
            
            # Feature value at i
            feature_value = df['mean_return_5'].iloc[i]
            
            if not pd.isna(feature_value) and not pd.isna(manual_mean):
                assert np.isclose(feature_value, manual_mean, rtol=1e-5)
    
    def test_percentile_no_leakage(self, sample_data):
        """Test that percentile calculations don't include future data."""
        builder = FeatureBuilder()
        df = builder.calculate_log_returns(sample_data.copy())
        df = builder.calculate_price_dynamics(df)
        df = builder.calculate_volatility_regime(df)
        
        # For row 300, vol_percentile should only consider data up to row 300
        row_idx = 300
        vol_pct = df['vol_percentile_252'].iloc[row_idx]
        
        if not pd.isna(vol_pct):
            # Manual calculation
            window_data = df['std_return_20'].iloc[row_idx-252+1:row_idx+1]
            manual_pct = (window_data < window_data.iloc[-1]).sum() / len(window_data)
            
            assert np.isclose(vol_pct, manual_pct, atol=0.05)


def test_feature_builder_integration(sample_data, market_data, tmp_path):
    """Integration test: full pipeline from raw data to features."""
    # Save sample data
    input_file = tmp_path / "TEST.csv"
    sample_data.to_csv(input_file, index=False)
    
    # Process
    builder = FeatureBuilder(market_index_data=market_data)
    output_dir = tmp_path / "processed"
    output_dir.mkdir()
    
    result = builder.process_ticker(input_file, output_dir, save_format='csv')
    
    # Check result
    assert result is not None
    assert len(result) > 0
    
    # Check output file exists
    output_file = output_dir / "TEST.csv"
    assert output_file.exists()
    
    # Check output has all features and target
    df_loaded = pd.read_csv(output_file)
    assert 'target' in df_loaded.columns
    
    feature_cols = builder.get_feature_columns()
    for col in feature_cols:
        assert col in df_loaded.columns


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
    