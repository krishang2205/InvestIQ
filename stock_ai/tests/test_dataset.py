"""
Test script for dataset functionality

File path: stock_ai/tests/test_dataset.py

Usage:
    python test_dataset.py
    pytest test_dataset.py -v
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import torch
import pandas as pd
import numpy as np
from training.dataset import (
    StockSequenceDataset,
    MultiStockDataset,
    create_temporal_splits,
    create_dataloaders
)

# Feature columns (16 features as defined in build_features.py)
FEATURE_COLS = [
    'log_return_t', 'mean_return_5', 'mean_return_20', 
    'std_return_5', 'std_return_20',
    'ATR_14_norm', 'vol_ratio', 'vol_percentile_252',
    'volume_z', 'relative_volume', 'volume_volatility',
    'dist_MA20', 'dist_MA50', 'trend_strength',
    'rel_return', 'beta_approx_20'
]


def test_single_stock_dataset():
    """Test StockSequenceDataset with sample data."""
    print("\n" + "="*60)
    print("TEST 1: Single Stock Dataset")
    print("="*60)
    
    # Create sample data
    np.random.seed(42)
    n_samples = 500
    
    sample_data = pd.DataFrame({
        'date': pd.date_range('2020-01-01', periods=n_samples),
        'ticker': ['TEST'] * n_samples,
        'target': np.random.randn(n_samples) * 0.02,
    })
    
    # Add feature columns
    for col in FEATURE_COLS:
        sample_data[col] = np.random.randn(n_samples) * 0.1
    
    # Create dataset
    dataset = StockSequenceDataset(
        data=sample_data,
        feature_cols=FEATURE_COLS,
        sequence_length=20,
        normalize=True
    )
    
    print(f"✓ Dataset created with {len(dataset)} sequences")
    
    # Test __getitem__
    features, target, metadata = dataset[0]
    
    print(f"✓ Sequence shape: {features.shape}")
    print(f"  Expected: [20, 16]")
    assert features.shape == (20, 16), f"Wrong shape: {features.shape}"
    
    print(f"✓ Target shape: {target.shape}")
    assert target.shape == torch.Size([]), f"Target should be scalar"
    
    print(f"✓ Metadata keys: {list(metadata.keys())}")
    assert 'ticker' in metadata
    assert 'date' in metadata
    
    # Test normalization
    print(f"✓ Feature mean: {dataset.feature_mean[:3]}")
    print(f"✓ Feature std: {dataset.feature_std[:3]}")
    
    print("\n✅ Single stock dataset test PASSED")
    return dataset


def test_multi_stock_dataset():
    """Test MultiStockDataset with processed data."""
    print("\n" + "="*60)
    print("TEST 2: Multi-Stock Dataset")
    print("="*60)
    
    data_dir = Path("../data/processed")
    
    if not data_dir.exists():
        print("⚠️  Processed data directory not found, skipping test")
        return None
    
    # Get first 5 stock files
    files = list(data_dir.glob("*.parquet"))
    if not files:
        files = list(data_dir.glob("*.csv"))
    
    if not files:
        print("⚠️  No processed data files found, skipping test")
        return None
    
    ticker_list = [f.stem for f in files[:5]]
    print(f"Testing with tickers: {ticker_list}")
    
    # Create dataset
    dataset = MultiStockDataset(
        data_dir=data_dir,
        feature_cols=FEATURE_COLS,
        ticker_list=ticker_list,
        sequence_length=20,
        normalize=True
    )
    
    print(f"✓ Multi-stock dataset created")
    print(f"  Total sequences: {len(dataset)}")
    print(f"  Stocks loaded: {len(dataset.stock_datasets)}")
    
    # Test __getitem__
    features, target, metadata = dataset[0]
    
    print(f"✓ Sequence shape: {features.shape}")
    assert features.shape == (20, 16)
    
    print(f"✓ First sequence ticker: {metadata['stock_ticker']}")
    
    # Test normalization stats
    mean, std = dataset.get_normalizer_stats()
    print(f"✓ Global normalization computed")
    print(f"  Mean shape: {mean.shape}")
    print(f"  Std shape: {std.shape}")
    
    print("\n✅ Multi-stock dataset test PASSED")
    return dataset


def test_temporal_splits():
    """Test temporal train/val/test splits."""
    print("\n" + "="*60)
    print("TEST 3: Temporal Splits")
    print("="*60)
    
    data_dir = Path("../data/processed")
    
    if not data_dir.exists():
        print("⚠️  Processed data directory not found, skipping test")
        return None
    
    # Get first 3 stocks for quick testing
    files = list(data_dir.glob("*.parquet"))
    if not files:
        files = list(data_dir.glob("*.csv"))
    
    if len(files) < 3:
        print("⚠️  Need at least 3 stock files, skipping test")
        return None
    
    ticker_list = [f.stem for f in files[:3]]
    print(f"Testing with tickers: {ticker_list}")
    
    # Create splits
    train_ds, val_ds, test_ds = create_temporal_splits(
        data_dir=data_dir,
        feature_cols=FEATURE_COLS,
        train_ratio=0.7,
        val_ratio=0.15,
        test_ratio=0.15,
        sequence_length=20,
        ticker_list=ticker_list
    )
    
    print(f"✓ Splits created")
    print(f"  Train: {len(train_ds)} sequences")
    print(f"  Val: {len(val_ds)} sequences")
    print(f"  Test: {len(test_ds)} sequences")
    
    # Check that splits don't overlap in time
    train_features, train_target, train_meta = train_ds[0]
    test_features, test_target, test_meta = test_ds[0]
    
    if 'date' in train_meta and 'date' in test_meta:
        print(f"✓ Train date: {train_meta['date']}")
        print(f"✓ Test date: {test_meta['date']}")
        # Test dates should be after train dates
        assert train_meta['date'] < test_meta['date'], "Test data should be after train data!"
    
    # Check normalization consistency
    train_mean, train_std = train_ds.get_normalizer_stats()
    val_mean, val_std = val_ds.get_normalizer_stats()
    
    print(f"✓ Normalization stats match: {np.allclose(train_mean, val_mean)}")
    assert np.allclose(train_mean, val_mean), "Val should use train normalization!"
    
    print("\n✅ Temporal splits test PASSED")
    return train_ds, val_ds, test_ds


def test_dataloaders():
    """Test DataLoader creation."""
    print("\n" + "="*60)
    print("TEST 4: DataLoaders")
    print("="*60)
    
    data_dir = Path("../data/processed")
    
    if not data_dir.exists():
        print("⚠️  Processed data directory not found, skipping test")
        return None
    
    files = list(data_dir.glob("*.parquet"))
    if not files:
        files = list(data_dir.glob("*.csv"))
    
    if len(files) < 3:
        print("⚠️  Need at least 3 stock files, skipping test")
        return None
    
    ticker_list = [f.stem for f in files[:3]]
    
    # Create splits
    train_ds, val_ds, test_ds = create_temporal_splits(
        data_dir=data_dir,
        feature_cols=FEATURE_COLS,
        ticker_list=ticker_list,
        sequence_length=20
    )
    
    # Create dataloaders
    train_loader, val_loader, test_loader = create_dataloaders(
        train_ds, val_ds, test_ds,
        batch_size=32,
        num_workers=0
    )
    
    print(f"✓ DataLoaders created")
    print(f"  Train batches: {len(train_loader)}")
    print(f"  Val batches: {len(val_loader)}")
    print(f"  Test batches: {len(test_loader)}")
    
    # Test iteration
    for batch_features, batch_targets, batch_metadata in train_loader:
        print(f"✓ First batch shape: {batch_features.shape}")
        print(f"  Expected: [batch_size, 20, 16]")
        assert batch_features.dim() == 3
        assert batch_features.shape[1] == 20  # sequence length
        assert batch_features.shape[2] == 16  # num features
        
        print(f"✓ Targets shape: {batch_targets.shape}")
        assert batch_targets.dim() == 1  # [batch_size]
        
        print(f"✓ Metadata keys: {list(batch_metadata.keys())}")
        print(f"  Metadata is dict of lists (batch_size items per key)")
        
        # Check metadata structure
        for key, values in batch_metadata.items():
            assert isinstance(values, list), f"{key} should be a list"
            assert len(values) == batch_features.shape[0], f"{key} length mismatch"
        
        break  # Only test first batch
    
    print("\n✅ DataLoaders test PASSED")
    return train_loader, val_loader, test_loader


def test_no_data_leakage():
    """Verify no future data leaks into past sequences."""
    print("\n" + "="*60)
    print("TEST 5: Data Leakage Check")
    print("="*60)
    
    # Create sample data with known pattern
    n_samples = 100
    sample_data = pd.DataFrame({
        'date': pd.date_range('2020-01-01', periods=n_samples),
        'ticker': ['TEST'] * n_samples,
        'target': list(range(n_samples)),  # Sequential targets
    })
    
    # Features are also sequential
    for col in FEATURE_COLS:
        sample_data[col] = list(range(n_samples))
    
    dataset = StockSequenceDataset(
        data=sample_data,
        feature_cols=FEATURE_COLS[:1],  # Use only first feature for simplicity
        sequence_length=10,
        normalize=False
    )
    
    # Get first sequence
    features, target, metadata = dataset[0]
    
    print(f"✓ First sequence features: {features[:, 0].tolist()}")
    print(f"  Expected: [0, 1, 2, ..., 9]")
    print(f"✓ First sequence target: {target.item()}")
    print(f"  Expected: 9 (last element of sequence)")
    
    # Verify sequence
    expected_seq = list(range(10))
    actual_seq = features[:, 0].tolist()
    
    assert actual_seq == expected_seq, f"Sequence mismatch: {actual_seq} vs {expected_seq}"
    assert target.item() == 9, f"Target should be 9, got {target.item()}"
    
    # Get second sequence (should be shifted by stride=1)
    features2, target2, metadata2 = dataset[1]
    expected_seq2 = list(range(1, 11))
    actual_seq2 = features2[:, 0].tolist()
    
    print(f"✓ Second sequence features: {actual_seq2}")
    print(f"  Expected: [1, 2, 3, ..., 10]")
    
    assert actual_seq2 == expected_seq2, f"Second sequence mismatch"
    assert target2.item() == 10, f"Second target should be 10"
    
    print("\n✅ No data leakage detected!")


def main():
    """Run all tests."""
    print("\n" + "="*80)
    print("DATASET TESTS")
    print("="*80)
    
    try:
        test_single_stock_dataset()
        test_no_data_leakage()
        test_multi_stock_dataset()
        test_temporal_splits()
        test_dataloaders()
        
        print("\n" + "="*80)
        print("✅ ALL TESTS PASSED!")
        print("="*80)
        
    except Exception as e:
        print("\n" + "="*80)
        print(f"❌ TEST FAILED: {str(e)}")
        print("="*80)
        import traceback
        traceback.print_exc()
        return 1
    
    return 0


if __name__ == "__main__":
    exit(main())