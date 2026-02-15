"""
PyTorch Dataset classes for Stock AI Forecasting System

File path: stock_ai/data/dataset.py

Provides:
- StockSequenceDataset: Windowed sequences for LSTM training
- Multi-stock dataset loader
- Train/val/test splits with temporal ordering
"""

import numpy as np
import pandas as pd
import torch
from torch.utils.data import Dataset, DataLoader
from pathlib import Path
from typing import List, Tuple, Optional, Dict
import logging

logger = logging.getLogger(__name__)


class StockSequenceDataset(Dataset):
    """
    PyTorch Dataset for stock sequences.
    
    Creates sliding windows of features for LSTM input.
    Maintains temporal ordering (no shuffle across time).
    """
    
    def __init__(
        self,
        data: pd.DataFrame,
        feature_cols: List[str],
        target_col: str = 'target',
        sequence_length: int = 20,
        stride: int = 1,
        normalize: bool = True,
        fit_normalizer: bool = True
    ):
        """
        Initialize dataset.
        
        Args:
            data: DataFrame with features and target
            feature_cols: List of feature column names
            target_col: Target column name
            sequence_length: Length of input sequences (lookback window)
            stride: Step size for sliding window (1 = every day)
            normalize: Whether to normalize features
            fit_normalizer: If True, fit normalizer on this data. If False, use pre-fitted stats.
        """
        self.data = data.copy()
        self.feature_cols = feature_cols
        self.target_col = target_col
        self.sequence_length = sequence_length
        self.stride = stride
        
        # Sort by date to ensure temporal ordering
        if 'date' in self.data.columns:
            self.data = self.data.sort_values('date').reset_index(drop=True)
        
        # Extract features and targets
        self.features = self.data[feature_cols].values.astype(np.float32)
        self.targets = self.data[target_col].values.astype(np.float32)
        
        # Store ticker and date info if available
        self.tickers = self.data['ticker'].values if 'ticker' in self.data.columns else None
        self.dates = self.data['date'].values if 'date' in self.data.columns else None
        
        # Normalization
        self.normalize = normalize
        if normalize:
            if fit_normalizer:
                # Fit on this data (training set)
                self.feature_mean = np.nanmean(self.features, axis=0)
                self.feature_std = np.nanstd(self.features, axis=0) + 1e-8
            else:
                # Will be set externally (validation/test sets)
                self.feature_mean = None
                self.feature_std = None
            
            # Apply normalization if stats available
            if self.feature_mean is not None:
                self.features = (self.features - self.feature_mean) / self.feature_std
        
        # Create sequence indices
        self.indices = self._create_sequence_indices()
        
        logger.info(f"Created dataset with {len(self.indices)} sequences")
        logger.info(f"  Sequence length: {sequence_length}")
        logger.info(f"  Features shape: {self.features.shape}")
        logger.info(f"  Date range: {self.dates[0] if self.dates is not None else 'N/A'} to {self.dates[-1] if self.dates is not None else 'N/A'}")
    
    def _create_sequence_indices(self) -> List[int]:
        """
        Create valid sequence start indices.
        
        Returns:
            List of valid starting indices for sequences
        """
        max_start_idx = len(self.features) - self.sequence_length
        indices = list(range(0, max_start_idx + 1, self.stride))
        return indices
    
    def set_normalizer_stats(self, mean: np.ndarray, std: np.ndarray):
        """
        Set normalization statistics (for validation/test sets).
        
        Args:
            mean: Feature means from training set
            std: Feature stds from training set
        """
        self.feature_mean = mean
        self.feature_std = std
        
        # Re-normalize features with training set statistics
        self.features = (self.data[self.feature_cols].values.astype(np.float32) - mean) / std
    
    def __len__(self) -> int:
        """Return number of sequences."""
        return len(self.indices)
    
    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor, Dict]:
        """
        Get a single sequence.
        
        Args:
            idx: Sequence index
            
        Returns:
            Tuple of (features, target, metadata)
            - features: [sequence_length, num_features]
            - target: scalar
            - metadata: dict with ticker, date, etc.
        """
        start_idx = self.indices[idx]
        end_idx = start_idx + self.sequence_length
        
        # Extract sequence
        seq_features = self.features[start_idx:end_idx]
        
        # Target is at the end of the sequence (predicting next day)
        target = self.targets[end_idx - 1]
        
        # Convert to tensors
        seq_features = torch.from_numpy(seq_features)
        target = torch.tensor(target, dtype=torch.float32)
        
        # Metadata
        metadata = {
            'start_idx': start_idx,
            'end_idx': end_idx,
        }
        
        if self.dates is not None:
            # Convert numpy.datetime64 to string for PyTorch compatibility
            date_value = self.dates[end_idx - 1]
            metadata['date'] = str(pd.Timestamp(date_value))
        
        if self.tickers is not None:
            metadata['ticker'] = str(self.tickers[end_idx - 1])
        
        return seq_features, target, metadata


class MultiStockDataset(Dataset):
    """
    Dataset that combines multiple stocks.
    
    Each stock is treated independently but combined into one dataset.
    Maintains temporal ordering within each stock.
    """
    
    def __init__(
        self,
        data_dir: Path,
        feature_cols: List[str],
        ticker_list: Optional[List[str]] = None,
        sequence_length: int = 20,
        normalize: bool = True,
        file_pattern: str = "*.parquet"
    ):
        """
        Initialize multi-stock dataset.
        
        Args:
            data_dir: Directory with processed stock files
            feature_cols: List of feature column names
            ticker_list: List of tickers to include (None = all)
            sequence_length: Length of input sequences
            normalize: Whether to normalize features
            file_pattern: File pattern to match
        """
        self.data_dir = Path(data_dir)
        self.feature_cols = feature_cols
        self.sequence_length = sequence_length
        self.normalize = normalize
        
        # Load all stock files
        self.stock_datasets = []
        self.stock_tickers = []
        
        if ticker_list:
            # Load specific tickers
            for ticker in ticker_list:
                filepath = self.data_dir / f"{ticker}.parquet"
                if not filepath.exists():
                    filepath = self.data_dir / f"{ticker}.csv"
                
                if filepath.exists():
                    self._load_stock(filepath)
        else:
            # Load all matching files
            files = list(self.data_dir.glob(file_pattern))
            for filepath in files:
                self._load_stock(filepath)
        
        logger.info(f"Loaded {len(self.stock_datasets)} stocks")
        
        # Compute normalization stats across all stocks
        if normalize:
            self._compute_global_normalization()
            self._apply_normalization()
        
        # Build index mapping (dataset_idx -> (stock_idx, sequence_idx))
        self._build_index_mapping()
    
    def _load_stock(self, filepath: Path):
        """Load a single stock file."""
        try:
            if filepath.suffix == '.parquet':
                df = pd.read_parquet(filepath)
            else:
                df = pd.read_csv(filepath, parse_dates=['date'])
            
            # Create dataset for this stock
            dataset = StockSequenceDataset(
                data=df,
                feature_cols=self.feature_cols,
                sequence_length=self.sequence_length,
                normalize=False,  # Will normalize globally later
                fit_normalizer=False
            )
            
            self.stock_datasets.append(dataset)
            self.stock_tickers.append(filepath.stem)
            
        except Exception as e:
            logger.warning(f"Failed to load {filepath.name}: {str(e)}")
    
    def _compute_global_normalization(self):
        """Compute normalization statistics across all stocks."""
        all_features = []
        
        for dataset in self.stock_datasets:
            all_features.append(dataset.features)
        
        all_features = np.vstack(all_features)
        
        self.global_mean = np.nanmean(all_features, axis=0)
        self.global_std = np.nanstd(all_features, axis=0) + 1e-8
        
        logger.info(f"Computed global normalization stats from {len(all_features)} samples")
    
    def _apply_normalization(self):
        """Apply global normalization to all stock datasets."""
        for dataset in self.stock_datasets:
            dataset.set_normalizer_stats(self.global_mean, self.global_std)
    
    def _build_index_mapping(self):
        """Build mapping from global index to (stock_idx, sequence_idx)."""
        self.index_map = []
        
        for stock_idx, dataset in enumerate(self.stock_datasets):
            for seq_idx in range(len(dataset)):
                self.index_map.append((stock_idx, seq_idx))
        
        logger.info(f"Total sequences across all stocks: {len(self.index_map)}")
    
    def __len__(self) -> int:
        """Return total number of sequences across all stocks."""
        return len(self.index_map)
    
    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor, Dict]:
        """Get a sequence from any stock."""
        stock_idx, seq_idx = self.index_map[idx]
        dataset = self.stock_datasets[stock_idx]
        
        features, target, metadata = dataset[seq_idx]
        metadata['stock_ticker'] = str(self.stock_tickers[stock_idx])
        
        return features, target, metadata
    
    def get_normalizer_stats(self) -> Tuple[np.ndarray, np.ndarray]:
        """Get global normalization statistics."""
        return self.global_mean, self.global_std


def create_temporal_splits(
    data_dir: Path,
    feature_cols: List[str],
    train_ratio: float = 0.7,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15,
    sequence_length: int = 20,
    ticker_list: Optional[List[str]] = None
) -> Tuple[MultiStockDataset, MultiStockDataset, MultiStockDataset]:
    """
    Create train/val/test splits with temporal ordering.
    
    Splits data by time, not randomly, to prevent look-ahead bias.
    Each stock is split at the same date boundaries.
    
    Args:
        data_dir: Directory with processed stock files
        feature_cols: List of feature column names
        train_ratio: Proportion for training (0.7 = 70%)
        val_ratio: Proportion for validation
        test_ratio: Proportion for testing
        sequence_length: Length of input sequences
        ticker_list: List of tickers to include (None = all)
        
    Returns:
        Tuple of (train_dataset, val_dataset, test_dataset)
    """
    assert abs(train_ratio + val_ratio + test_ratio - 1.0) < 1e-6, "Ratios must sum to 1"
    
    logger.info("Creating temporal train/val/test splits...")
    logger.info(f"  Train: {train_ratio*100:.0f}%")
    logger.info(f"  Val: {val_ratio*100:.0f}%")
    logger.info(f"  Test: {test_ratio*100:.0f}%")
    
    # Load all data to determine global date range
    data_dir = Path(data_dir)
    all_dates = []
    
    if ticker_list:
        files = [data_dir / f"{ticker}.parquet" for ticker in ticker_list]
        files = [f if f.exists() else data_dir / f"{f.stem}.csv" for f in files]
    else:
        files = list(data_dir.glob("*.parquet"))
        if not files:
            files = list(data_dir.glob("*.csv"))
    
    for filepath in files:
        if not filepath.exists():
            continue
        try:
            if filepath.suffix == '.parquet':
                df = pd.read_parquet(filepath)
            else:
                df = pd.read_csv(filepath, parse_dates=['date'])
            
            all_dates.extend(df['date'].tolist())
        except:
            continue
    
    if not all_dates:
        raise ValueError(f"No valid data files found in {data_dir}")
    
    # Find date boundaries for splits
    all_dates = sorted(set(all_dates))
    n_dates = len(all_dates)
    
    train_end_idx = int(n_dates * train_ratio)
    val_end_idx = int(n_dates * (train_ratio + val_ratio))
    
    train_end_date = all_dates[train_end_idx]
    val_end_date = all_dates[val_end_idx]
    
    logger.info(f"  Train: up to {train_end_date}")
    logger.info(f"  Val: {train_end_date} to {val_end_date}")
    logger.info(f"  Test: {val_end_date} onwards")
    
    # Create temporary directory structure for splits
    import tempfile
    import shutil
    
    temp_dir = Path(tempfile.mkdtemp())
    train_dir = temp_dir / 'train'
    val_dir = temp_dir / 'val'
    test_dir = temp_dir / 'test'
    
    for d in [train_dir, val_dir, test_dir]:
        d.mkdir(parents=True, exist_ok=True)
    
    # Split each stock file
    for filepath in files:
        if not filepath.exists():
            continue
        
        try:
            if filepath.suffix == '.parquet':
                df = pd.read_parquet(filepath)
            else:
                df = pd.read_csv(filepath, parse_dates=['date'])
            
            # Split by date
            train_df = df[df['date'] <= train_end_date]
            val_df = df[(df['date'] > train_end_date) & (df['date'] <= val_end_date)]
            test_df = df[df['date'] > val_end_date]
            
            # Save splits
            ticker = filepath.stem
            if len(train_df) > sequence_length:
                train_df.to_parquet(train_dir / f"{ticker}.parquet", index=False)
            if len(val_df) > sequence_length:
                val_df.to_parquet(val_dir / f"{ticker}.parquet", index=False)
            if len(test_df) > sequence_length:
                test_df.to_parquet(test_dir / f"{ticker}.parquet", index=False)
        
        except Exception as e:
            logger.warning(f"Failed to split {filepath.name}: {str(e)}")
    
    # Create datasets from splits
    train_dataset = MultiStockDataset(
        data_dir=train_dir,
        feature_cols=feature_cols,
        sequence_length=sequence_length,
        normalize=True
    )
    
    # Get normalization stats from training set
    train_mean, train_std = train_dataset.get_normalizer_stats()
    
    # Create validation dataset with training normalization
    val_dataset = MultiStockDataset(
        data_dir=val_dir,
        feature_cols=feature_cols,
        sequence_length=sequence_length,
        normalize=False
    )
    # Apply training set normalization
    val_dataset.global_mean = train_mean
    val_dataset.global_std = train_std
    val_dataset._apply_normalization()
    val_dataset._build_index_mapping()
    
    # Create test dataset with training normalization
    test_dataset = MultiStockDataset(
        data_dir=test_dir,
        feature_cols=feature_cols,
        sequence_length=sequence_length,
        normalize=False
    )
    test_dataset.global_mean = train_mean
    test_dataset.global_std = train_std
    test_dataset._apply_normalization()
    test_dataset._build_index_mapping()
    
    # Clean up temp directory
    shutil.rmtree(temp_dir)
    
    logger.info(f"\nDataset sizes:")
    logger.info(f"  Train: {len(train_dataset)} sequences")
    logger.info(f"  Val: {len(val_dataset)} sequences")
    logger.info(f"  Test: {len(test_dataset)} sequences")
    
    return train_dataset, val_dataset, test_dataset


def custom_collate_fn(batch):
    """
    Custom collate function for DataLoader.
    Handles metadata with mixed types (strings, ints, etc.)
    
    Args:
        batch: List of (features, target, metadata) tuples
        
    Returns:
        Tuple of (batched_features, batched_targets, batched_metadata)
    """
    features_list = []
    targets_list = []
    metadata_list = []
    
    for features, target, metadata in batch:
        features_list.append(features)
        targets_list.append(target)
        metadata_list.append(metadata)
    
    # Stack features and targets
    batched_features = torch.stack(features_list, dim=0)
    batched_targets = torch.stack(targets_list, dim=0)
    
    # For metadata, create dict of lists (don't try to stack)
    batched_metadata = {}
    if metadata_list:
        keys = metadata_list[0].keys()
        for key in keys:
            batched_metadata[key] = [m[key] for m in metadata_list]
    
    return batched_features, batched_targets, batched_metadata


def create_dataloaders(
    train_dataset: Dataset,
    val_dataset: Dataset,
    test_dataset: Dataset,
    batch_size: int = 128,
    num_workers: int = 0
) -> Tuple[DataLoader, DataLoader, DataLoader]:
    """
    Create PyTorch DataLoaders for train/val/test.
    
    Args:
        train_dataset: Training dataset
        val_dataset: Validation dataset
        test_dataset: Test dataset
        batch_size: Batch size
        num_workers: Number of data loading workers
        
    Returns:
        Tuple of (train_loader, val_loader, test_loader)
    """
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,  # Can shuffle at sequence level
        num_workers=num_workers,
        pin_memory=True if torch.cuda.is_available() else False,
        collate_fn=custom_collate_fn  # Use custom collate function
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True if torch.cuda.is_available() else False,
        collate_fn=custom_collate_fn
    )
    
    test_loader = DataLoader(
        test_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers,
        pin_memory=True if torch.cuda.is_available() else False,
        collate_fn=custom_collate_fn
    )
    
    logger.info(f"Created dataloaders with batch_size={batch_size}")
    logger.info(f"  Train batches: {len(train_loader)}")
    logger.info(f"  Val batches: {len(val_loader)}")
    logger.info(f"  Test batches: {len(test_loader)}")
    
    return train_loader, val_loader, test_loader