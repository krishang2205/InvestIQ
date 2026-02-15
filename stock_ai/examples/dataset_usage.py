"""
Example usage of dataset classes

File path: stock_ai/examples/dataset_usage.py

Shows how to load data, create splits, and iterate through batches.
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from training.dataset import create_temporal_splits, create_dataloaders
import torch

# Feature columns (same as defined in build_features.py)
FEATURE_COLS = [
    'log_return_t', 'mean_return_5', 'mean_return_20', 
    'std_return_5', 'std_return_20',
    'ATR_14_norm', 'vol_ratio', 'vol_percentile_252',
    'volume_z', 'relative_volume', 'volume_volatility',
    'dist_MA20', 'dist_MA50', 'trend_strength',
    'rel_return', 'beta_approx_20'
]


def main():
    """Example workflow for loading and using datasets."""
    
    print("="*60)
    print("DATASET USAGE EXAMPLE")
    print("="*60)
    
    # 1. Define data directory
    data_dir = Path("../data/processed")
    
    if not data_dir.exists():
        print(f"Error: {data_dir} does not exist!")
        print("Run build_features.py first to create processed data.")
        return
    
    # 2. Create temporal splits (70/15/15)
    print("\n1. Creating temporal train/val/test splits...")
    
    train_dataset, val_dataset, test_dataset = create_temporal_splits(
        data_dir=data_dir,
        feature_cols=FEATURE_COLS,
        train_ratio=0.7,
        val_ratio=0.15,
        test_ratio=0.15,
        sequence_length=20,  # 20-day lookback window
        ticker_list=None  # Use all available stocks
    )
    
    print(f"  Train: {len(train_dataset)} sequences")
    print(f"  Val:   {len(val_dataset)} sequences")
    print(f"  Test:  {len(test_dataset)} sequences")
    
    # 3. Create dataloaders
    print("\n2. Creating PyTorch DataLoaders...")
    
    train_loader, val_loader, test_loader = create_dataloaders(
        train_dataset=train_dataset,
        val_dataset=val_dataset,
        test_dataset=test_dataset,
        batch_size=128,
        num_workers=0  # Set to 2-4 for faster loading on multi-core systems
    )
    
    print(f"  Train batches: {len(train_loader)}")
    print(f"  Val batches:   {len(val_loader)}")
    print(f"  Test batches:  {len(test_loader)}")
    
    # 4. Iterate through one batch
    print("\n3. Examining a sample batch...")
    
    for batch_features, batch_targets, batch_metadata in train_loader:
        print(f"  Batch features shape: {batch_features.shape}")
        print(f"    [batch_size, sequence_length, num_features]")
        print(f"    [{batch_features.shape[0]}, {batch_features.shape[1]}, {batch_features.shape[2]}]")
        
        print(f"  Batch targets shape: {batch_targets.shape}")
        print(f"    [batch_size]")
        print(f"    [{batch_targets.shape[0]}]")
        
        print(f"  Sample target values: {batch_targets[:5].tolist()}")
        
        print(f"  Metadata keys: {list(batch_metadata.keys())}")
        
        # Check for NaN or Inf
        has_nan = torch.isnan(batch_features).any()
        has_inf = torch.isinf(batch_features).any()
        
        print(f"  Has NaN: {has_nan}")
        print(f"  Has Inf: {has_inf}")
        
        break  # Only show first batch
    
    # 5. Get normalization stats (useful for inference later)
    print("\n4. Normalization statistics...")
    
    train_mean, train_std = train_dataset.get_normalizer_stats()
    
    print(f"  Feature means (first 5): {train_mean[:5]}")
    print(f"  Feature stds (first 5): {train_std[:5]}")
    print(f"  Shape: {train_mean.shape}")
    
    # 6. Save normalization stats for later use
    print("\n5. Saving normalization stats...")
    
    import numpy as np
    stats_dir = Path("../models/base")
    stats_dir.mkdir(parents=True, exist_ok=True)
    
    np.save(stats_dir / "feature_mean.npy", train_mean)
    np.save(stats_dir / "feature_std.npy", train_std)
    
    print(f"  Saved to {stats_dir}/")
    
    # 7. Example: Full epoch iteration
    print("\n6. Simulating one training epoch...")
    
    total_loss = 0
    num_batches = 0
    
    for batch_features, batch_targets, batch_metadata in train_loader:
        # In real training, you would:
        # 1. Forward pass through model
        # 2. Calculate loss
        # 3. Backward pass
        # 4. Update weights
        
        # For demo, just accumulate a dummy loss
        dummy_loss = torch.nn.functional.mse_loss(
            torch.zeros_like(batch_targets),
            batch_targets
        )
        
        total_loss += dummy_loss.item()
        num_batches += 1
    
    avg_loss = total_loss / num_batches
    print(f"  Average loss (dummy): {avg_loss:.6f}")
    print(f"  Processed {num_batches} batches")
    
    print("\n" + "="*60)
    print("✅ Dataset usage example complete!")
    print("="*60)
    
    print("\nNext steps:")
    print("1. Use these datasets to train LSTM model (Phase 5)")
    print("2. Normalization stats are saved for inference")
    print("3. DataLoaders are ready for PyTorch training loop")


if __name__ == "__main__":
    main()