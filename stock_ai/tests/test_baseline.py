"""
Test baseline models

File path: stock_ai/tests/test_baselines.py

Usage:
    python test_baselines.py
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

import numpy as np
import torch
from training.baseline_models import (
    NaiveBaseline,
    MeanBaseline,
    LinearRegressionBaseline,
    SimpleLSTM,
    compute_metrics
)


def test_naive_baseline():
    """Test naive baseline."""
    print("\n" + "="*60)
    print("TEST: Naive Baseline")
    print("="*60)
    
    model = NaiveBaseline()
    
    # Create dummy data
    X = np.random.randn(10, 20, 16)  # [batch, seq_len, features]
    
    # Predict
    predictions = model.predict(X)
    
    print(f"✓ Input shape: {X.shape}")
    print(f"✓ Output shape: {predictions.shape}")
    print(f"  Expected: (10,)")
    
    assert predictions.shape == (10,), f"Wrong shape: {predictions.shape}"
    
    # Check that prediction = last timestep, first feature
    expected = X[:, -1, 0]
    assert np.allclose(predictions, expected), "Predictions don't match last return"
    
    print("✅ Naive baseline test PASSED")


def test_mean_baseline():
    """Test mean baseline."""
    print("\n" + "="*60)
    print("TEST: Mean Baseline")
    print("="*60)
    
    model = MeanBaseline()
    
    # Create dummy targets
    y_train = np.random.randn(1000) * 0.02  # Returns
    
    # Fit
    model.fit(y_train)
    print(f"✓ Fitted mean: {model.mean_return:.6f}")
    
    # Predict
    X = np.random.randn(10, 20, 16)
    predictions = model.predict(X)
    
    print(f"✓ Output shape: {predictions.shape}")
    assert predictions.shape == (10,), f"Wrong shape: {predictions.shape}"
    
    # Check all predictions are the mean
    assert np.allclose(predictions, model.mean_return), "All predictions should be mean"
    
    print("✅ Mean baseline test PASSED")


def test_linear_regression_baseline():
    """Test linear regression baseline."""
    print("\n" + "="*60)
    print("TEST: Linear Regression Baseline")
    print("="*60)
    
    model = LinearRegressionBaseline()
    
    # Create dummy data
    X_train = np.random.randn(1000, 20, 16)
    y_train = np.random.randn(1000) * 0.02
    
    # Fit
    print("Fitting model...")
    model.fit(X_train, y_train)
    print(f"✓ Model fitted")
    
    # Predict
    X_test = np.random.randn(100, 20, 16)
    predictions = model.predict(X_test)
    
    print(f"✓ Output shape: {predictions.shape}")
    assert predictions.shape == (100,), f"Wrong shape: {predictions.shape}"
    
    print("✅ Linear regression baseline test PASSED")


def test_simple_lstm():
    """Test simple LSTM baseline."""
    print("\n" + "="*60)
    print("TEST: Simple LSTM")
    print("="*60)
    
    model = SimpleLSTM(input_size=16, hidden_size=32)
    
    # Create dummy data
    X = torch.randn(10, 20, 16)  # [batch, seq_len, features]
    
    # Forward pass
    predictions = model(X)
    
    print(f"✓ Input shape: {X.shape}")
    print(f"✓ Output shape: {predictions.shape}")
    print(f"  Expected: torch.Size([10])")
    
    assert predictions.shape == torch.Size([10]), f"Wrong shape: {predictions.shape}"
    
    # Check gradients work
    loss = predictions.mean()
    loss.backward()
    
    print("✓ Backward pass successful")
    
    # Count parameters
    total_params = sum(p.numel() for p in model.parameters())
    print(f"✓ Total parameters: {total_params:,}")
    
    print("✅ Simple LSTM test PASSED")


def test_compute_metrics():
    """Test metrics computation."""
    print("\n" + "="*60)
    print("TEST: Metrics Computation")
    print("="*60)
    
    # Create dummy predictions and targets
    np.random.seed(42)
    predictions = np.random.randn(1000) * 0.02
    targets = predictions + np.random.randn(1000) * 0.01  # Add noise
    
    # Compute metrics
    metrics = compute_metrics(predictions, targets)
    
    print(f"✓ RMSE: {metrics['rmse']:.6f}")
    print(f"✓ MAE: {metrics['mae']:.6f}")
    print(f"✓ Directional Accuracy: {metrics['directional_accuracy']:.1%}")
    print(f"✓ IC: {metrics['ic']:.4f}")
    print(f"✓ R²: {metrics['r2']:.4f}")
    
    # Basic sanity checks
    assert metrics['rmse'] > 0, "RMSE should be positive"
    assert metrics['mae'] > 0, "MAE should be positive"
    assert 0 <= metrics['directional_accuracy'] <= 1, "Dir acc should be in [0,1]"
    assert -1 <= metrics['ic'] <= 1, "IC should be in [-1,1]"
    
    print("✅ Metrics computation test PASSED")


def test_baseline_comparison():
    """Test that different baselines give different predictions."""
    print("\n" + "="*60)
    print("TEST: Baseline Comparison")
    print("="*60)
    
    # Create dummy data
    np.random.seed(42)
    X = np.random.randn(100, 20, 16)
    y = np.random.randn(100) * 0.02
    
    # Initialize models
    naive = NaiveBaseline()
    mean = MeanBaseline()
    linear = LinearRegressionBaseline()
    
    # Fit where needed
    mean.fit(y)
    linear.fit(X, y)
    
    # Get predictions
    pred_naive = naive.predict(X)
    pred_mean = mean.predict(X)
    pred_linear = linear.predict(X)
    
    print(f"✓ Naive predictions: {pred_naive[:3]}")
    print(f"✓ Mean predictions: {pred_mean[:3]}")
    print(f"✓ Linear predictions: {pred_linear[:3]}")
    
    # Check they're different
    assert not np.allclose(pred_naive, pred_mean), "Naive and mean should differ"
    assert not np.allclose(pred_naive, pred_linear), "Naive and linear should differ"
    assert not np.allclose(pred_mean, pred_linear), "Mean and linear should differ"
    
    print("✓ All models produce different predictions")
    
    print("✅ Baseline comparison test PASSED")


def main():
    """Run all tests."""
    print("\n" + "="*80)
    print("BASELINE MODELS TESTS")
    print("="*80)
    
    try:
        test_naive_baseline()
        test_mean_baseline()
        test_linear_regression_baseline()
        test_simple_lstm()
        test_compute_metrics()
        test_baseline_comparison()
        
        print("\n" + "="*80)
        print("✅ ALL BASELINE TESTS PASSED!")
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
