# InvestIQ

> An AI-powered, full-stack investment dashboard featuring real-time market insights, intelligent portfolio tracking, generative AI financial reports, swipe-based stock predictions, and interactive video-based learning modules.

<!-- Maps to: ABSTRACT -->
## Abstract
InvestIQ is an innovative web application designed to bridge the gap between complex financial data and actionable insights for retail, intermediate, and advanced investors. The project leverages real-time stock market data and generative artificial intelligence to offer an interactive dashboard, automating traditional financial analysis.

Through its modular architecture—comprising a React-based frontend and a Python (Flask) backend—InvestIQ dynamically queries financial instruments, continuously monitors the Market Mood Index, tracks personal portfolios, and generates natural-language "Intelligence Reports." Additionally, it introduces gamified swipe-based stock predictions (powered by a scheduled LSTM-XGBoost ensemble machine learning pipeline) and video-driven learning layers ("Tutor") to democratize financial literacy. The integration of LLMs (Gemini/Groq) ensures that its reports are deeply grounded in real quantitative data, thus solving the problem of information overload in modern equity markets.

---

<!-- Maps to: CHAPTER 1 — INTRODUCTION -->
## 1. Introduction

### 1.1 Problem Statement & Motivation
Retail investors often struggle to interpret vast amounts of financial data, quarterly earnings, and macroeconomic indicators. Traditional stock screeners provide raw numbers but lack readable narrative context, while professional analyst reports are often gated or expensive. InvestIQ aims to democratize access to institutional-grade stock research by summarizing real-time metrics into comprehensible, AI-driven reports and providing an engaging, user-friendly platform.

### 1.2 Objectives
- To build a highly responsive, modern dashboard for tracking real-time stock prices, indices, and market trends.
- To implement an automated "Intelligence Report" engine using Generative AI, converting raw metrics into structured narratives.
- To gamify stock discovery via a "Liquide-style" swipe interface for stock predictions.
- To construct an interactive "Tutor" module that seamlessly integrates video lessons and AI-driven quizzes for financial education.
- To ensure scalable and robust data ingestion from public financial APIs (`yfinance`), maintaining low latency through caching.

### 1.3 Project Scope & Direction
The scope encompasses a web application, spanning from data ingestion (market data and news) to an interactive React UI layer. Authentication and database persistence are handled via Supabase. The system is designed primarily for the Indian equity market (NSE/BSE), querying tickers and macroeconomic data accordingly. High-frequency trading execution and live brokerage API integration are out of scope for this phase.

---

<!-- Maps to: CHAPTER 2 — LITERATURE REVIEW -->
## 2. Background & Related Work

### 2.1 Methodology
The project design was informed by observing existing trading platforms (e.g., Zerodha Kite, Liquide) and analytical tools (e.g., TradingView, Bloomberg Terminal). A gap was identified between complex charting tools meant for experts and over-simplified apps that lack depth. The methodology involves a hybrid approach: consuming quantitative data programmatically, processing it through modern LLM pipelines for qualitative summarization, and presenting it in a gamified, intuitive UX.

### 2.2 Summary
Current retail investment tools either lack narrative AI context or rely entirely on static data points. By incorporating large language models for on-demand report generation and interactive learning pathways, InvestIQ successfully merges algorithmic data retrieval with conversational, educational, and predictive AI.

---

<!-- Maps to: CHAPTER 3 — SYSTEM REQUIREMENTS -->
## 3. System Requirements

### 3.1 Overview
The system relies on modern, cross-platform web technologies. The choice of React allows for a reactive, component-based UI, while Python efficiently handles data manipulation (Pandas) and LLM orchestration. 

### 3.2 Software & Hardware Requirements

#### Software
- **Frontend Stack:** React 18, Vite, React Router DOM, TailwindCSS (with PostCSS), Recharts, Framer Motion, Lucide React.
- **Backend Stack:** Python 3 (Flask), Pandas, yfinance, Flask-CORS, Flask-Caching.
- **AI / Integrations:** Google GenerativeAI (Gemini), Groq API, Supabase (Auth + DB).
- **Environment Tools:** Node.js, npm, Python Virtual Environment (`.venv`), `concurrently` (for monorepo execution).

#### Hardware
- **Minimum:** 2 Cores/4 Threads CPU, 4GB RAM, 10GB Storage.
- **Recommended (Development):** 4+ Cores, 8GB+ RAM, Fast SSD (for rapid model invocation and Vite compilation). No dedicated GPU is strictly required as AI workloads are offloaded to cloud APIs.

### 3.3 Summary
The architecture relies on accessible, open-source packages and cloud services (Supabase, Gemini/Groq), keeping infrastructure overhead low while maintaining high scalability.

---

<!-- Maps to: CHAPTER 4 — SYSTEM DESIGN -->
## 4. System Design

### 4.1 Overview
InvestIQ is structured as a decentralized Monorepo, segregating the client-side presentation layer from the data-ingestion and orchestration backend, connected via RESTful APIs.

### 4.2 Proposed System
The system comprises four main blocks:
1. **The Client (Frontend):** Manages user state, authentication contexts, routing, and visualization (charts, swipe cards).
2. **The API Gateway + Orchestrator (Backend):** A Flask application serving endpoints for market data, portfolio intelligence, LLM reporting, and learning modules. 
3. **The Machine Learning Pipeline:** A scheduled Google Colab environment running an LSTM-XGBoost ensemble model (`LSTM_SENTIMENTAL_STOCK.ipynb`) that processes 3 years of historical Nifty 100 data to generate predictive signals for the swipe interface.
4. **The Persistence & External Layer:** Supabase for user profiles and portfolios, Yahoo Finance for real-time OHLCV data, and LLM providers for generative tasks.

### 4.3 Data Flow
Input → Processing → Output
1. **User Action:** User requests an "Intelligence Report" for `RELIANCE.NS`.
2. **Backend Ingestion:** Flask backend queries `yfinance` for 52W high/low, P/E ratio, market cap, and live price.
3. **Context Construction:** The backend formats this raw data into an enriched prompt.
4. **LLM Orchestration:** The prompt is dispatched via API to Gemini/Groq. 
5. **Caching & Delivery:** The LLM returns structured JSON; the backend caches it and forwards it to the React UI.
6. **Rendering:** The React frontend paints the data dynamically.

### 4.4 Summary
By decoupling the heavy data-processing and AI-orchestration tasks into an API layer, the system remains lightweight on the client side, achieving high responsiveness and clean separation of concerns.

---

<!-- Maps to: CHAPTER 5 — IMPLEMENTATION -->
## 5. Implementation

### 5.1 Overview
Implementation is split across a Node.js-based frontend environment and a Python environment. The two run concurrently during development via custom `package.json` scripts.

### 5.2 System Architecture
```text
InvestIQ/
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI (Auth, Layouts)
│   │   ├── context/     # React Context (AuthContext)
│   │   ├── pages/       # Dashboard, Learning, Portfolio, Predictions
│   │   ├── services/    # Client-side API wrappers
│   │   └── App.jsx      # Routing entry
│   └── package.json
└── backend/
    ├── app.py           # Flask entry point & blueprint registration
    ├── services/        # Business logic (market_data.py, ai_doctor_service.py)
    ├── reports/         # AI Orchestrator, Ingestion Engine, Prompts
    ├── routes/          # API route definitions
    └── requirements.txt
```

### 5.3 Core Algorithm
**Market Mood Index Calculation:**
1. Fetch live India VIX and Nifty 50.
2. Calculate Nifty 50 50-day Simple Moving Average (SMA).
3. Compute `vix_score` bounded between 0-100 based on historically low (10) to high (30) volatility.
4. Compute `trend_score`: 100 if current price > SMA50 else 0.
5. Final Score = `(vix_score * 0.6) + (trend_score * 0.4)`.
6. Map score to "Extreme Fear", "Fear", "Neutral", "Greed", or "Extreme Greed".

### 5.4 Architectural Components
- **Market Data Service:** Aggregates tickers, Top Gainers/Losers, indices performance, and financial news via `yFinance`.
- **Report Orchestrator:** Handles background processing queues for generating AI reports and caching results to prevent repeated LLM calls.
- **Portfolio Intelligence:** Correlates user's saved watchlist/portfolio with real-time quotes to trace performance vs. benchmarks.
- **Swipe Predictions Engine:** Front-end logic leveraging `framer-motion` to handle Tinder-like gestures to 'save' or 'skip' stock predictions.

### 5.5 Feature Extraction
The orchestrator extracts precise fundamental features before calling the LLM. Key extracted features include:
- **Price Action:** Current price, 52-week high/low, 50D/200D moving averages.
- **Valuation:** P/E Ratio, P/B Ratio, Debt-to-Equity, Dividend Yield.
- **Qualitative:** Company description, sector,, and employee count.
These are parsed from standard pandas dataframes locally, ensuring the LLM is fact-grounded and avoids hallucinations.

### 5.6 Packages & Libraries Used
| Package | Role |
| -- | -- |
| `react`, `vite`, `tailwindcss` | Frontend rendering, dev server, styling |
| `framer-motion` | Complex swipe and page transition animations |
| `recharts` | Rendering interactive line/bar charts for stock data |
| `flask`, `flask-cors` | Backend web framework and middleware |
| `yfinance`, `pandas` | Financial data ingestion and manipulation |
| `google-generativeai`, `groq` | Interfaces for Large Language Models |
| `tensorflow`, `xgboost`, `scikit-learn` | Used in the Colab ML pipeline for predictive modeling |

### 5.7 Machine Learning Prediction Pipeline
The stock predictions displayed on the `/predictions` swiping interface are driven by a scheduled, automated machine learning pipeline hosted on Google Colab (`LSTM_SENTIMENTAL_STOCK.ipynb`). 
- **Data Ingestion:** Fetches 3 years of OHLCV data for Nifty 100 stocks via the `yfinance` library.
- **Feature Engineering:** Computes 15 technical indicators including RSI, MACD, Bollinger Bands, EMAs, ATR, and OBV using the `ta` library.
- **Model Architecture:** A robust hybrid ensemble comprising a multi-output LSTM (learning from 60-day sequential patterns) and three XGBoost models (learning from window-level summary statistics).
- **Validation & Output:** The pipeline employs walk-forward cross-validation with 5 expanding folds to ensure non-peeking out-of-sample accuracy. The final ensemble model optimally predicts stock returns for 1-day, 1-week, and 1-month horizons, saving the metrics into a dataset (`nifty100_predictions.csv`) which is then served by the backend API.

---

<!-- Maps to: CHAPTER 6 — SYSTEM TESTING -->
## 6. Testing & Results

### 6.1 Overview
[TODO: Describe testing strategy based on your findings (e.g., Unit, Integration testing).]

### 6.2 Test Cases
| Feature | Input/Action | Expected Output | Status |
| -- | -- | -- | -- |
| Authentication | User logs in | Redirect to `/dashboard`, token saved | [TODO] |
| Market Data API| Request `/api/market/indices` | JSON with Nifty 50 & Sensex | [TODO] |
| LLM Report | Request report for `TCS.NS` | Structured JSON fundamental analysis | [TODO] |
| Swipe UI | Swipe right on a prediction card | Added to "Liked" watchlist state | [TODO] |

### 6.3 Results
[TODO: Summarize test results — what worked, what didn't, edge cases.]

### 6.4 Performance Evaluation
- **Data Ingestion Latency:** Batched queries via `yfinance` caching mechanisms lower response times.
- **LLM Report Generation:** Depending on model choice (Groq is significantly faster than standard Gemini APIs), report fetching averages [TODO: Insert seconds].

### 6.5 Summary
[TODO: What the testing phase revealed about the system's robustness.]

---

<!-- Maps to: CONCLUSION -->
## 7. Conclusion
InvestIQ successfully delivers a premium, cohesive, and modern platform for financial analytics. By integrating intelligent agentic workflows—from the gamified swipe-prediction interface to LLM-generated fundamental analyses—it demonstrates the powerful intersection of traditional market data ingestion and generative AI. The platform meets its objectives of offering a scalable, interactive hub for both portfolio tracking and financial learning.

---

<!-- Maps to: REFERENCES -->
## 8. References
[TODO: List key references, e.g., Yahoo Finance API docs, Gemini AI whitepapers, React documentation.]

---

<!-- Maps to: APPENDICES -->
## 9. Appendices

### Appendix A: Installation & Setup Guide
1. Clone the repository to your local machine.
2. In the root directory, run `npm run install:all` to install both frontend `node_modules` and backend Python `requirements.txt`.
3. Create `.env` files in both the frontend and backend folders using their respective `.env.example` templates (configure Supabase API keys, Groq/Gemini API keys).
4. Run `npm run dev` from the root monorepo directory. The backend will start on port 5001 and the frontend via Vite.

### Appendix B: Usage Guide
- **Dashboard:** Navigate to `/dashboard` to view market indices and top volume movers.
- **Market Mood:** Check the Market Mood Index tab for the live VIX-based fear/greed indicator.
- **Predictions:** Go to `/predictions` to swipe on live stock insights.
- **Intelligence Reports:** Type a symbol like `RELIANCE` to generate a deep-dive AI report.

### Appendix C: Additional Figures & Data
[TODO: Placeholder for supplementary figures, charts, and diagrams.]

---

## Project Structure
```text
InvestIQ
├── backend
│   ├── app.py
│   ├── reports/
│   ├── routes/
│   ├── services/
│   └── tests/
├── frontend
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── App.jsx
├── package.json
└── README.md
```

## How to Run
```bash
# Install all dependencies across monorepo
npm run install:all

# Start both frontend and backend development servers concurrently
npm run dev
```

## License
[TODO: Insert License type]
