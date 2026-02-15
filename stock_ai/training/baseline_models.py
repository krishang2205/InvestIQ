"""
Baseline Models for Stock AI Forecasting System

File path: stock_ai/training/baseline_models.py

Implements simple baselines to compare against LSTM:
1. Naive (previous return)
2. Mean return
3. Linear Regression
4. Simple LSTM (single layer)

Usage:
    python baseline_models.py --data-dir ../data/processed
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import torch
import torch.nn as nn
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from typing import Dict, List, Tuple
import logging
from tqdm import tqdm

from training.dataset import create_temporal_splits, create_dataloaders

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Feature columns
FEATURE_COLS = [
    'log_return_t', 'mean_return_5', 'mean_return_20', 
    'std_return_5', 'std_return_20',
    'ATR_14_norm', 'vol_ratio', 'vol_percentile_252',
    'volume_z', 'relative_volume', 'volume_volatility',
    'dist_MA20', 'dist_MA50', 'trend_strength',
    'rel_return', 'beta_approx_20'
]


class NaiveBaseline:
    """
    Naive baseline: Predict next return = current return.
    (Persistence model)
    """
    
    def __init__(self):
        self.name = "Naive (Persistence)"
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """
        Predict using last return in sequence.
        
        Args:
            X: [batch_size, seq_len, num_features]
            
        Returns:
            predictions: [batch_size]
        """
        # Use log_return_t (first feature) from last timestep
        return X[:, -1, 0]  # Last timestep, first feature


class MeanBaseline:
    """
    Mean baseline: Predict the mean return from training data.
    """
    
    def __init__(self):
        self.name = "Mean Return"
        self.mean_return = 0.0
    
    def fit(self, y_train: np.ndarray):
        """Compute mean return from training data."""
        self.mean_return = np.mean(y_train)
        logger.info(f"Mean return: {self.mean_return:.6f}")
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict mean return for all samples."""
        return np.full(X.shape[0], self.mean_return)


class LinearRegressionBaseline:
    """
    Linear Regression baseline: Uses all features from last timestep.
    """
    
    def __init__(self):
        self.name = "Linear Regression"
        self.model = LinearRegression()
    
    def fit(self, X: np.ndarray, y: np.ndarray):
        """
        Fit linear regression.
        
        Args:
            X: [num_samples, seq_len, num_features]
            y: [num_samples]
        """
        # Use only last timestep features
        X_flat = X[:, -1, :]  # [num_samples, num_features]
        
        logger.info(f"Fitting Linear Regression on {X_flat.shape[0]} samples")
        self.model.fit(X_flat, y)
        
        # Report coefficients for top features
        feature_importance = np.abs(self.model.coef_)
        top_3 = np.argsort(feature_importance)[-3:][::-1]
        
        logger.info("Top 3 features:")
        for idx in top_3:
            logger.info(f"  {FEATURE_COLS[idx]}: {self.model.coef_[idx]:.4f}")
    
    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict using linear regression."""
        X_flat = X[:, -1, :]
        return self.model.predict(X_flat)


class SimpleLSTM(nn.Module):
    """
    Simple single-layer LSTM baseline.
    """
    
    def __init__(
        self,
        input_size: int = 16,
        hidden_size: int = 32,
        dropout: float = 0.2
    ):
        super().__init__()
        
        self.name = "Simple LSTM"
        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=1,
            batch_first=True,
            dropout=0  # No dropout for single layer
        )
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_size, 1)
    
    def forward(self, x):
        """
        Forward pass.
        
        Args:
            x: [batch_size, seq_len, input_size]
            
        Returns:
            predictions: [batch_size, 1]
        """
        # LSTM
        lstm_out, _ = self.lstm(x)  # [batch_size, seq_len, hidden_size]
        
        # Use last timestep
        last_hidden = lstm_out[:, -1, :]  # [batch_size, hidden_size]
        
        # Dropout and FC
        out = self.dropout(last_hidden)
        out = self.fc(out)  # [batch_size, 1]
        
        return out.squeeze(-1)  # [batch_size]


def train_lstm_baseline(
    model: SimpleLSTM,
    train_loader,
    val_loader,
    epochs: int = 20,
    lr: float = 0.001,
    device: str = 'cuda' if torch.cuda.is_available() else 'cpu'
) -> Dict:
    """
    Train simple LSTM baseline.
    
    Args:
        model: SimpleLSTM model
        train_loader: Training DataLoader
        val_loader: Validation DataLoader
        epochs: Number of training epochs
        lr: Learning rate
        device: Device to train on
        
    Returns:
        Dictionary with training history
    """
    model = model.to(device)
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    
    history = {
        'train_loss': [],
        'val_loss': [],
        'best_val_loss': float('inf'),
        'best_epoch': 0
    }
    
    logger.info(f"Training {model.name} on {device}")
    logger.info(f"Epochs: {epochs}, LR: {lr}")
    
    for epoch in range(epochs):
        # Training
        model.train()
        train_loss = 0
        
        for features, targets, _ in train_loader:
            features = features.to(device)
            targets = targets.to(device)
            
            # Forward
            predictions = model(features)
            loss = criterion(predictions, targets)
            
            # Backward
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
        
        avg_train_loss = train_loss / len(train_loader)
        
        # Validation
        model.eval()
        val_loss = 0
        
        with torch.no_grad():
            for features, targets, _ in val_loader:
                features = features.to(device)
                targets = targets.to(device)
                
                predictions = model(features)
                loss = criterion(predictions, targets)
                val_loss += loss.item()
        
        avg_val_loss = val_loss / len(val_loader)
        
        history['train_loss'].append(avg_train_loss)
        history['val_loss'].append(avg_val_loss)
        
        # Track best model
        if avg_val_loss < history['best_val_loss']:
            history['best_val_loss'] = avg_val_loss
            history['best_epoch'] = epoch
        
        if (epoch + 1) % 5 == 0:
            logger.info(
                f"Epoch [{epoch+1}/{epochs}] "
                f"Train Loss: {avg_train_loss:.6f}, "
                f"Val Loss: {avg_val_loss:.6f}"
            )
    
    logger.info(f"Best validation loss: {history['best_val_loss']:.6f} at epoch {history['best_epoch']+1}")
    
    return history


def evaluate_baseline(
    model,
    data_loader,
    model_type: str = 'sklearn',
    device: str = 'cpu'
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Evaluate a baseline model.
    
    Args:
        model: Model to evaluate
        data_loader: DataLoader
        model_type: 'sklearn', 'naive', 'mean', or 'pytorch'
        device: Device for pytorch models
        
    Returns:
        Tuple of (predictions, targets)
    """
    all_predictions = []
    all_targets = []
    
    if model_type == 'pytorch':
        model.eval()
    
    for features, targets, _ in tqdm(data_loader, desc=f"Evaluating {model.name}"):
        targets_np = targets.numpy()
        
        # Convert to numpy for sklearn models
        if model_type in ['sklearn', 'naive', 'mean']:
            features_np = features.numpy()
            predictions = model.predict(features_np)
            all_predictions.append(predictions)
            all_targets.append(targets_np)
        
        else:  # pytorch
            features = features.to(device)
            
            with torch.no_grad():
                predictions = model(features)
            
            all_predictions.append(predictions.cpu().numpy())
            all_targets.append(targets_np)
    
    predictions = np.concatenate(all_predictions)
    targets = np.concatenate(all_targets)
    
    return predictions, targets


def compute_metrics(predictions: np.ndarray, targets: np.ndarray) -> Dict:
    """
    Compute evaluation metrics.
    
    Args:
        predictions: Model predictions
        targets: True targets
        
    Returns:
        Dictionary of metrics
    """
    # RMSE
    rmse = np.sqrt(mean_squared_error(targets, predictions))
    
    # MAE
    mae = np.mean(np.abs(predictions - targets))
    
    # Directional Accuracy
    pred_direction = np.sign(predictions)
    true_direction = np.sign(targets)
    directional_accuracy = np.mean(pred_direction == true_direction)
    
    # Information Coefficient (Spearman correlation)
    from scipy.stats import spearmanr
    ic, ic_pvalue = spearmanr(predictions, targets)
    
    # R-squared
    ss_res = np.sum((targets - predictions) ** 2)
    ss_tot = np.sum((targets - np.mean(targets)) ** 2)
    r2 = 1 - (ss_res / ss_tot)
    
    return {
        'rmse': rmse,
        'mae': mae,
        'directional_accuracy': directional_accuracy,
        'ic': ic,
        'ic_pvalue': ic_pvalue,
        'r2': r2
    }


def main():
    """Run baseline experiments."""
    import argparse
    
    parser = argparse.ArgumentParser(description='Train and evaluate baseline models')
    parser.add_argument('--data-dir', type=str, default='../data/processed',
                        help='Directory with processed data')
    parser.add_argument('--batch-size', type=int, default=128,
                        help='Batch size')
    parser.add_argument('--lstm-epochs', type=int, default=20,
                        help='Training epochs for LSTM baseline')
    parser.add_argument('--sequence-length', type=int, default=20,
                        help='Sequence length')
    
    args = parser.parse_args()
    
    logger.info("="*60)
    logger.info("BASELINE MODELS EXPERIMENT")
    logger.info("="*60)
    
    # 1. Load data
    logger.info("\n1. Loading data...")
    
    train_ds, val_ds, test_ds = create_temporal_splits(
        data_dir=Path(args.data_dir),
        feature_cols=FEATURE_COLS,
        train_ratio=0.7,
        val_ratio=0.15,
        test_ratio=0.15,
        sequence_length=args.sequence_length
    )
    
    train_loader, val_loader, test_loader = create_dataloaders(
        train_ds, val_ds, test_ds,
        batch_size=args.batch_size
    )
    
    # Get training targets for mean baseline
    train_targets = []
    for _, targets, _ in train_loader:
        train_targets.append(targets.numpy())
    train_targets = np.concatenate(train_targets)
    
    # Get training features for linear regression
    train_features = []
    for features, targets, _ in train_loader:
        train_features.append(features.numpy())
    train_features_np = np.concatenate(train_features)
    
    # 2. Initialize models
    logger.info("\n2. Initializing baseline models...")
    
    baselines = {
        'naive': (NaiveBaseline(), 'naive'),
        'mean': (MeanBaseline(), 'mean'),
        'linear': (LinearRegressionBaseline(), 'sklearn'),
        'lstm': (SimpleLSTM(input_size=16, hidden_size=32), 'pytorch')
    }
    
    # 3. Train models (where needed)
    logger.info("\n3. Training models...")
    
    # Fit mean baseline
    baselines['mean'][0].fit(train_targets)
    
    # Fit linear regression
    baselines['linear'][0].fit(train_features_np, train_targets)
    
    # Train LSTM
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    lstm_history = train_lstm_baseline(
        baselines['lstm'][0],
        train_loader,
        val_loader,
        epochs=args.lstm_epochs,
        device=device
    )
    
    # 4. Evaluate all models
    logger.info("\n4. Evaluating models on test set...")
    
    results = {}
    
    for name, (model, model_type) in baselines.items():
        logger.info(f"\nEvaluating {model.name}...")
        
        predictions, targets = evaluate_baseline(
            model, test_loader, model_type, device
        )
        
        metrics = compute_metrics(predictions, targets)
        results[name] = metrics
        
        logger.info(f"  RMSE: {metrics['rmse']:.6f}")
        logger.info(f"  MAE: {metrics['mae']:.6f}")
        logger.info(f"  Directional Accuracy: {metrics['directional_accuracy']:.1%}")
        logger.info(f"  IC: {metrics['ic']:.4f} (p={metrics['ic_pvalue']:.4f})")
        logger.info(f"  R²: {metrics['r2']:.4f}")
    
    # 5. Summary comparison
    logger.info("\n" + "="*60)
    logger.info("RESULTS SUMMARY")
    logger.info("="*60)
    
    print("\n{:<20} {:>10} {:>10} {:>10} {:>10}".format(
        "Model", "RMSE", "MAE", "Dir Acc", "IC"
    ))
    print("-" * 60)
    
    for name, (model, _) in baselines.items():
        metrics = results[name]
        print("{:<20} {:>10.6f} {:>10.6f} {:>10.1%} {:>10.4f}".format(
            model.name,
            metrics['rmse'],
            metrics['mae'],
            metrics['directional_accuracy'],
            metrics['ic']
        ))
    
    # Identify best model
    best_ic_model = max(results.items(), key=lambda x: x[1]['ic'])
    best_rmse_model = min(results.items(), key=lambda x: x[1]['rmse'])
    
    logger.info(f"\nBest IC: {baselines[best_ic_model[0]][0].name} ({best_ic_model[1]['ic']:.4f})")
    logger.info(f"Best RMSE: {baselines[best_rmse_model[0]][0].name} ({best_rmse_model[1]['rmse']:.6f})")
    
    # Save results
    logger.info("\n6. Saving results...")
    
    results_dir = Path("../evaluation")
    results_dir.mkdir(exist_ok=True)
    
    import json
    from datetime import datetime
    
    # Convert to serializable format
    serializable_results = {
        name: {k: float(v) for k, v in metrics.items()}
        for name, metrics in results.items()
    }
    
    # Load existing results if file exists
    results_file = results_dir / "baseline_results.json"
    if results_file.exists():
        with open(results_file, 'r') as f:
            all_results = json.load(f)
            # Handle old format (dict) vs new format (list)
            if isinstance(all_results, dict) and not isinstance(all_results, list):
                # Convert old format to new format
                all_results = [{
                    "timestamp": "unknown",
                    "results": all_results
                }]
    else:
        all_results = []
    
    # Append new results with timestamp
    current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    all_results.append({
        "timestamp": current_time,
        "results": serializable_results
    })
    
    # Save updated results
    with open(results_file, 'w') as f:
        json.dump(all_results, f, indent=2)
    
    logger.info(f"Results saved to {results_dir / 'baseline_results.json'}")
    
    logger.info("\n" + "="*60)
    logger.info("✅ Baseline experiments complete!")
    logger.info("="*60)


if __name__ == "__main__":
    main()