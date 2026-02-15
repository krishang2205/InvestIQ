# Stock AI Project - Execution Flow

Quick reference guide for running the complete pipeline from scratch.

---

## 🚀 Quick Start (From Zero to Training-Ready Data)

```bash
# 1. Setup environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux
pip install -r requirements.txt

# 2. Download stock data (15-20 min for 150 stocks)
cd stock_ai/scripts/data
python download_data.py --universe default --start 2019-01-01

# 3. Download market index (30 sec)
python download_market_index.py

# 4. Validate data quality (1 min)
python validate_data.py

# 5. Build features (5-10 min)
cd ../../features
python build_features.py --input ../data/raw --output ../data/processed

# 6. Test everything works
cd ../tests
python test_features.py
python test_dataset.py

# Done! Data is ready for training.
```

---

## 📋 Detailed Pipeline

### **Phase 1: Data Collection**

#### 1.1 Download Stock Data
```bash
cd stock_ai/scripts/data
python download_data.py --universe default --start 2019-01-01 --end 2024-12-31
```
**What it does:**
- Downloads 150 NSE stocks (50 large + 50 mid + 50 small cap)
- Saves to `data/raw/*.csv`
- ~15-20 minutes for 150 stocks

**Options:**
```bash
# Specific tickers
python download_data.py --tickers RELIANCE.NS TCS.NS INFY.NS --start 2020-01-01

# Only Nifty 50
python download_data.py --universe nifty50 --start 2019-01-01

# Only large-cap (50 stocks)
python download_data.py --universe largecap --start 2019-01-01
```

#### 1.2 Download Market Index
```bash
python download_market_index.py
```
**What it does:**
- Downloads Nifty 50 index (^NSEI)
- Required for market-relative features (beta, relative returns)
- Saves to `data/raw/NSEI.csv`

#### 1.3 Validate Data
```bash
python validate_data.py --report validation_report.csv
```
**What it does:**
- Checks for missing dates, price anomalies, zero volumes
- Generates quality report
- Optional but recommended

---

### **Phase 2: Feature Engineering**

#### 2.1 Build Features
```bash
cd ../../features
python build_features.py --input ../data/raw --output ../data/processed --market-index NSEI
```
**What it does:**
- Creates 16 technical features from OHLCV data
- Adds target variable (next-day return)
- Removes NaN rows (warmup period ~252 days)
- Saves to `data/processed/*.parquet`
- ~5-10 minutes for 150 stocks

**Single ticker:**
```bash
python build_features.py --input ../data/raw --output ../data/processed --ticker RELIANCE.NS
```

#### 2.2 Verify Features
```bash
cd ../tests
python test_features.py
```
**What it does:**
- Tests no data leakage (critical!)
- Validates feature calculations
- Checks for NaN/Inf values
- Should show: **22/22 tests passed**

---

### **Phase 3: Dataset Preparation**

#### 3.1 Test Dataset Classes
```bash
python test_dataset.py
```
**What it does:**
- Tests PyTorch Dataset classes
- Verifies temporal splits (train/val/test)
- Checks no data leakage in sequences
- Should show: **✅ ALL TESTS PASSED!**

#### 3.2 Example Usage
```bash
cd ../examples
python dataset_usage.py
```
**What it does:**
- Shows how to load data for training
- Creates train/val/test splits (70/15/15)
- Demonstrates DataLoader usage
- Saves normalization stats to `models/base/`

---

## 📁 Key Directories

```
stock_ai/
├── data/
│   ├── raw/              # Downloaded OHLCV CSVs (150 stocks + NSEI.csv)
│   └── processed/        # Feature parquet files (150 files)
├── models/base/          # Normalization stats saved here
├── scripts/data/         # Download & validation scripts
├── features/             # Feature engineering script
├── training/             # Dataset classes
├── tests/                # Test scripts
└── examples/             # Usage examples
```

---

## 🔍 File Reference

| Script | Location | Purpose | Runtime |
|--------|----------|---------|---------|
| `download_data.py` | `scripts/data/` | Download stocks | 15-20 min |
| `download_market_index.py` | `scripts/data/` | Download Nifty 50 | 30 sec |
| `validate_data.py` | `scripts/data/` | Check data quality | 1 min |
| `build_features.py` | `features/` | Create 16 features | 5-10 min |
| `test_features.py` | `tests/` | Test feature engineering | 10 sec |
| `test_dataset.py` | `tests/` | Test dataset classes | 30 sec |
| `dataset_usage.py` | `examples/` | Example data loading | 1 min |

---

## 🎯 Current Status (Phases 0-3 Complete)

✅ **Phase 0:** Environment setup
✅ **Phase 1:** Data collection (150 stocks, 5+ years)
✅ **Phase 2:** Feature engineering (16 features)
✅ **Phase 3:** Dataset builder (PyTorch ready)

**What you have:**
- ~150 stocks with clean OHLCV data
- 16 engineered features per stock
- ~1,200 valid rows per stock (after removing warmup NaN)
- Train/val/test temporal splits
- PyTorch DataLoaders ready

---

## 🚨 Common Issues & Solutions

### Issue: "No market data provided" warning
**Solution:** Run `download_market_index.py` and ensure `NSEI.csv` exists in `data/raw/`

### Issue: Import errors in tests
**Solution:** Ensure `dataset.py` is in `training/` folder, not `data/`

### Issue: Too many NaN values after feature engineering
**Solution:** Normal! ~18-20% dropped due to 252-day warmup period for some features

### Issue: Tests fail with "file not found"
**Solution:** Run scripts from correct directory (see paths above)

### Issue: Download fails for some tickers
**Solution:** Yahoo Finance may not have data for all stocks, this is normal. Check validation report.

---

## 📊 Data Statistics (Expected)

After completing all phases:
- **Raw data:** 150 CSV files, ~1,500 rows each (~5 years)
- **Processed data:** 150 parquet files, ~1,200 rows each
- **Total sequences (train+val+test):** ~18,000-25,000
- **Features per sequence:** 16
- **Sequence length:** 20 days (lookback window)

---

## 🔜 Next Phases (Not Yet Implemented)

**Phase 4:** Baseline models (naive, linear, simple LSTM)
**Phase 5:** Train base LSTM (shared model across stocks)
**Phase 6:** Regime labeling (low/mid/high volatility)
**Phase 7:** Fine-tune regime-specific heads
**Phase 8:** Router implementation
**Phase 9:** Inference pipeline
**Phase 10:** Comprehensive evaluation
**Phase 11:** Monitoring & retraining

---

## 💡 Pro Tips

1. **Re-running feature engineering:** Delete `data/processed/` folder first
2. **Testing with fewer stocks:** Use `--universe largecap` (50 stocks, faster)
3. **Debugging:** Add `--verbose` flag to validation script
4. **Saving time:** Download data once, reuse for multiple feature experiments
5. **GPU training:** Install PyTorch with CUDA for faster training (Phase 5+)

---

## 📞 Quick Commands Cheat Sheet

```bash
# Activate environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Full pipeline (from root directory)
cd stock_ai/scripts/data && python download_data.py --universe default --start 2019-01-01
python download_market_index.py
python validate_data.py
cd ../../features && python build_features.py --input ../data/raw --output ../data/processed
cd ../tests && python test_features.py && python test_dataset.py

# Check data
dir stock_ai\data\raw       # Should have 151 files (150 stocks + NSEI.csv)
dir stock_ai\data\processed # Should have 150 parquet files

# Run example
cd stock_ai/examples && python dataset_usage.py
```

---

**Last Updated:** Phase 3 Complete | Ready for Phase 4 (Baseline Models)