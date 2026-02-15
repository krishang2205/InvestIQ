# Regime-Aware LSTM + BERT Sentiment Fusion — Extended Project Plan

## Extension Overview

**What we're adding**: A late-fusion ensemble that combines price-based LSTM predictions with BERT-derived sentiment signals using a learnable weighting parameter α.

**Architecture**: 
- **LSTM branch** (existing): Predicts returns from 16 price/volume features
- **BERT branch** (new): Generates daily sentiment scores from text data
- **Fusion layer**: `final_pred = α * lstm_pred + (1-α) * bert_pred`

**Key principle**: Keep branches independent to avoid retraining heavy models. Tune only the fusion weight α on validation data.


---

## Extended Feature Set

### Existing LSTM Features (16)
*(unchanged from original plan)*

### New BERT Sentiment Features (4-6 per stock-day)

**Raw sentiment scores**:
1. `bert_sentiment_daily`: Aggregated sentiment score for day t (mean of all texts)
2. `bert_sentiment_std`: Std dev of sentiment across texts (uncertainty measure)
3. `text_volume`: Number of news articles/tweets for the stock on day t

**Derived sentiment features**:
4. `sentiment_ma_5`: 5-day moving average of sentiment
5. `sentiment_change`: `sentiment_daily - sentiment_ma_5` (sentiment momentum)
6. `sentiment_volume_interaction`: `bert_sentiment_daily * log(1 + text_volume)` (weighted by coverage)

**Total features**: 16 (price) + 6 (sentiment) = **22 features** *(but branches remain independent)*

---

## Data Sources for BERT

### Required Text Data (per stock, per day)

**Priority 1 (start here)**:
- Financial news headlines (e.g., Reuters, Bloomberg via API or web scraping)
- Company-specific news from Google News RSS
- Target: ≥5 years history to match OHLCV data

**Priority 2 (after Phase 13)**:
- Twitter/X posts mentioning ticker symbols
- Reddit posts from r/wallstreetbets, r/stocks (exercise caution)
- Seeking Alpha article summaries

**Priority 3 (optional enhancements)**:
- SEC filings (10-K, 10-Q, 8-K) — use filing date, not report period
- Earnings call transcripts
- Analyst reports (if accessible)

### Data Requirements
- **Temporal alignment**: Text from day t used to predict return from close t to close t+1
- **No look-ahead bias**: Only use texts published before market close on day t
- **Labeling**: Each text labeled with (ticker, date, sentiment_target = next-day return)

---

## BERT Sentiment Pipeline

### Model Selection
**Recommended starting point**: `ProsusAI/finbert` or `yiyanghkust/finbert-tone`
- Pre-trained on financial text
- 3-class output: positive/negative/neutral
- Fine-tune on your labeled data for regression (predicting returns)

**Alternative**: `distilbert-base-uncased` 
- Faster inference, fine-tune from scratch on financial domain

### Sentiment Score Generation
1. **Tokenization**: Truncate to 512 tokens, use `[CLS]` token embedding
2. **Aggregation** (multiple texts per stock-day):
   - Simple mean: `sentiment_daily = mean([bert(text_i) for all texts on day t])`
   - Weighted mean: Weight by source credibility (e.g., Reuters > Twitter)
   - Volume-aware: Track `text_volume` as uncertainty proxy
3. **Normalization**: Scale sentiment scores to [-1, 1] or [0, 1] range
4. **Handling missing days**: If no text for day t, use `sentiment_ma_5` or set to neutral (0.5)

---

## Fusion Architecture Details

### Late Fusion Formula
```
final_prediction = α * lstm_pred + (1 - α) * bert_pred
```

Where:
- `lstm_pred`: Output from regime-routed LSTM (continuous return prediction)
- `bert_pred`: BERT sentiment score (scaled to match return distribution)
- `α ∈ [0, 1]`: Learnable fusion weight

### Alpha Initialization & Tuning

**Initial value**: α = 0.8 (80% LSTM, 20% sentiment)
- Rationale: Price data is primary signal, sentiment is auxiliary

**Tuning strategy**:
1. **Grid search** (Phase 14): Test α ∈ {0.6, 0.7, 0.75, 0.8, 0.85, 0.9} on validation set
2. **Metric**: Optimize for validation IC (Information Coefficient)
3. **Regime-specific α** (optional): Different α for low/mid/high-vol regimes
4. **Dynamic α** (advanced): Learn α as function of `text_volume` or `sentiment_std`

**Constraints**:
- α should remain relatively stable (≥0.7) to avoid overweighting noisy sentiment
- If validation IC(fusion) < IC(LSTM-only), set α=1.0 (disable fusion)

---

## Modified Success Criteria

### BERT Branch (Standalone)
- Sentiment-to-return correlation (Spearman) ≥ 0.02 on validation
- BERT predictions beat random baseline (IC > 0)
- Sentiment signal orthogonal to price features (correlation < 0.3 with LSTM predictions)

### Fusion Model (Combined)
- **Primary goal**: IC(fusion) > IC(LSTM-only) by ≥0.005 (e.g., 0.035 vs 0.030)
- Strategy Sharpe ratio improvement: ≥0.1 over LSTM-only
- No degradation in max drawdown (≤20%)
- Robust to α perturbations: IC should not drop >10% if α changes by ±0.1

### Efficiency
- BERT inference time: <100ms per stock-day (batch processing acceptable)
- Total prediction latency: <500ms for 100 stocks (LSTM + BERT + fusion)

---

## Phase-by-Phase Implementation Plan

### **Phase 0-11: Original LSTM Pipeline** 
*(complete as documented in info.md — ~8-12 weeks)*

---

### **Phase 12: Text Data Collection & Validation** (1.5 weeks)

**Week 1: Data sourcing**
- Set up APIs/scrapers for financial news (start with free sources: Google News RSS, NewsAPI)
- Download historical news for initial stock universe (15-150 stocks, 5 years)
- Store in `data/raw/text/` with schema: `{ticker, date, timestamp, source, headline, snippet}`

**Days 8-10: Data validation**
- Check temporal coverage: ≥80% of trading days should have ≥1 news item per stock
- Identify and handle missing days (interpolation strategy)
- Remove duplicates, HTML artifacts, non-English text
- Unit test: Assert no texts dated after their associated return (no leakage)

**Deliverable**: 
- `data/raw/text/news_archive.parquet` with 50k-500k labeled texts
- Data quality report: coverage %, sources breakdown, missing day handling

---

### **Phase 13: BERT Sentiment Feature Engineering** (2 weeks)

**Week 1: Model selection & fine-tuning**
- Load `ProsusAI/finbert` or `distilbert-base-uncased`
- Create labeled dataset: (text, next_day_return) pairs
- Fine-tune BERT for regression:
  - Loss: MSE between sentiment score and actual return
  - Train/val split: same temporal split as LSTM (70/15/15)
  - Hyperparams: LR=2e-5, batch=16, epochs=3-5, early stopping
- Save fine-tuned model to `models/bert/finetuned_bert.pt`

**Week 2: Sentiment aggregation pipeline**
- Implement `build_sentiment.py`:
  - Batch process all texts per stock-day
  - Compute 6 sentiment features (daily score, std, volume, MA5, change, interaction)
  - Output: `data/processed/sentiment/sentiment_features.parquet`
- Unit tests:
  - Assert sentiment scores in expected range
  - Check no future leakage (sentiment_t uses only texts published ≤ day t)
  - Validate alignment with OHLCV dates

**Deliverable**:
- Fine-tuned BERT model with validation MSE/correlation report
- Sentiment feature table aligned with price data
- Notebook: `notebooks/sentiment_eda.ipynb` (distributions, correlations with returns)

---

### **Phase 14: Fusion Layer Implementation** (1 week)

**Days 1-3: Fusion module**
- Create `fusion/fusion_layer.py`:
  ```python
  class LateFusion:
      def __init__(self, alpha=0.8):
          self.alpha = alpha
      
      def predict(self, lstm_pred, bert_pred):
          return self.alpha * lstm_pred + (1 - self.alpha) * bert_pred
  ```
- Add `fusion/tune_alpha.py`:
  - Grid search α ∈ [0.6, 0.9] on validation set
  - Optimize for IC, Sharpe ratio
  - Generate α sensitivity curve

**Days 4-5: Modified inference pipeline**
- Update `inference/predict.py`:
  1. Load LSTM predictions (from Phase 9)
  2. Load BERT sentiment scores (from Phase 13)
  3. Apply fusion with optimal α
  4. Output: `{stock, date, lstm_pred, bert_pred, final_pred, alpha_used}`

**Days 6-7: Regime-specific α (optional)**
- Test separate α for low/mid/high-vol regimes
- If improvement >1% IC, implement regime-conditional fusion

**Deliverable**:
- `fusion/` module with tuned α (e.g., α=0.78)
- Sensitivity analysis report: IC vs α plot
- Updated `predict.py` with fusion enabled

---

### **Phase 15: Comprehensive Fusion Evaluation** (2 weeks)

**Week 1: Statistical comparison**
- Compute all metrics from original Phase 10 for:
  1. LSTM-only baseline
  2. BERT-only baseline
  3. Fusion model (optimized α)
- Generate comparison table:
  ```
  | Metric          | LSTM | BERT | Fusion | Δ Fusion vs LSTM |
  |-----------------|------|------|--------|------------------|
  | IC (val)        | 0.030| 0.015| 0.035  | +16.7%           |
  | Rank IC         | 0.040| 0.020| 0.045  | +12.5%           |
  | Sharpe (strat)  | 1.05 | 0.60 | 1.18   | +0.13            |
  | Max Drawdown    | 18%  | 25%  | 17%    | -1pp             |
  ```
- Ablation study: Test with α=0, α=0.5, α=1.0 to confirm fusion adds value

**Week 2: Robustness & stress tests**
- **Sentiment blackout test**: Remove 30% of text data randomly, measure IC degradation
- **High-vol regime**: Isolate March 2020, 2022 periods — does fusion help or hurt?
- **Unseen stocks**: Test on 10-20 held-out stocks not in training
- **Temporal validation**: Walk-forward test on most recent 6 months
- **Sentiment lag test**: Delay sentiment by 1 day — does IC drop (validates timeliness)?

**Deliverable**:
- Comprehensive evaluation report (extend original Phase 10 document)
- Ablation study results with recommendations (use fusion? when?)
- Stress test summary table

---

### **Phase 16: Production-Ready Fusion Pipeline** (1 week)

**Days 1-3: Integration & optimization**
- Batch BERT inference: Process 100 stocks in <10 seconds
- Caching: Store sentiment scores to avoid re-computation
- Fallback logic: If BERT fails (missing text), use α=1.0 (LSTM-only)
- Logging: Track α used per prediction, regime assignments

**Days 4-5: Monitoring extensions**
- Add drift detection for sentiment features:
  - Alert if `mean(sentiment_daily)` shifts >0.2 over 30 days
  - Track `text_volume` — flag if coverage drops <50%
- Retrain triggers:
  - IC(fusion) drops below IC(LSTM-only) for 3 consecutive months
  - Sentiment-to-return correlation drops below 0.01

**Days 6-7: Documentation**
- Update README with fusion architecture diagram
- Document α tuning procedure
- Add example: "How to add new sentiment sources"

**Deliverable**:
- Production-ready `inference/predict.py` with fusion
- Monitoring dashboard with sentiment health metrics
- Deployment guide (environment, dependencies, API keys for text data)

---

## Timeline Summary (Fusion Extension Only)

| Phase | Task                          | Duration  | Dependencies         |
|-------|-------------------------------|-----------|----------------------|
| 12    | Text data collection          | 1.5 weeks | Phase 0 (env setup)  |
| 13    | BERT sentiment engineering    | 2 weeks   | Phase 12             |
| 14    | Fusion layer implementation   | 1 week    | Phases 11, 13        |
| 15    | Comprehensive evaluation      | 2 weeks   | Phase 14             |
| 16    | Production integration        | 1 week    | Phase 15             |

**Total extension time**: ~7.5 weeks (on top of original 8-12 weeks for LSTM pipeline)

**Parallel work opportunities**:
- Phase 12 can start during original Phase 5-7 (while LSTM is training)
- Phase 13 (BERT training) can overlap with original Phase 8-10 (router development)

---

## Risks & Mitigations (Fusion-Specific)

| Risk | Mitigation |
|------|------------|
| **Sentiment data coverage gaps** | Implement robust missing data handling; use MA smoothing; fallback to LSTM-only |
| **BERT overfits to training noise** | Use pre-trained FinBERT; limit fine-tuning to 3 epochs; validate on unseen stocks |
| **Fusion degrades performance** | Set IC(fusion) > IC(LSTM) as hard gate; if not met, disable fusion (α=1.0) |
| **Text data API rate limits** | Cache aggressively; batch requests; consider paid APIs for production |
| **Sentiment lags price** | Ensure text timestamps < market close; test sentiment_lag robustness |
| **α tuning overfits to validation** | Use walk-forward validation; constrain α ≥ 0.7; monitor out-of-sample IC |

---

## Evaluation Checklist (Fusion Model)

Before deploying fusion to production:

- [ ] IC(fusion) > IC(LSTM-only) by ≥0.005 on validation
- [ ] Strategy Sharpe ratio improvement ≥0.1
- [ ] No increase in max drawdown (≤20%)
- [ ] BERT standalone IC ≥ 0.015 (validates signal quality)
- [ ] Sentiment-price feature correlation < 0.3 (orthogonality check)
- [ ] Fusion robust to α ± 0.1 perturbation (IC drop <10%)
- [ ] Text coverage ≥80% of trading days
- [ ] BERT inference latency <100ms per stock
- [ ] Sentiment blackout test: IC drop <20% with 30% missing texts
- [ ] Unseen-stock test: Fusion maintains IC improvement on held-out stocks
- [ ] Monitoring alerts functional for sentiment drift

---

## Key Hyperparameters (Fusion-Specific)

| Parameter | Initial Value | Tuning Range | Notes |
|-----------|---------------|--------------|-------|
| α (fusion weight) | 0.8 | [0.6, 0.9] | Optimize on validation IC |
| BERT learning rate | 2e-5 | [1e-5, 5e-5] | Standard for fine-tuning |
| Sentiment MA window | 5 days | [3, 10] | Balance noise vs responsiveness |
| Text truncation | 512 tokens | Fixed | BERT max sequence length |
| Min texts per day | 1 | - | Use MA interpolation if 0 |

---

## Alternative Fusion Strategies (Future Work)

If late fusion with fixed α underperforms, consider:

1. **Attention-based fusion**: Learn α dynamically based on `text_volume`, `sentiment_std`, volatility regime
2. **Stacked ensemble**: Train a meta-model (lightGBM) on [lstm_pred, bert_pred, features] → final_pred
3. **Early fusion**: Concatenate sentiment features to LSTM input (requires retraining entire model)
4. **Multi-task learning**: Train LSTM to predict both returns and sentiment simultaneously

**Recommendation**: Stick with late fusion for initial deployment (Phase 14-16). Revisit advanced strategies only if IC improvement < 0.005.

---

## Contact / Notes

This extended plan integrates BERT sentiment analysis into your regime-aware LSTM forecasting system using a late-fusion approach. The design prioritizes:
- **Modularity**: LSTM and BERT branches remain independent
- **Simplicity**: Single fusion parameter α, interpretable
- **Validation**: Rigorous comparison against LSTM-only baseline
- **Robustness**: Fallback to LSTM if sentiment degrades

**Next step**: Complete original Phase 0-11 (LSTM pipeline), then begin Phase 12 (text data collection). Sentiment model can be trained in parallel with LSTM fine-tuning.