CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY,
  user_id UUID,
  symbol TEXT NOT NULL,
  status TEXT NOT NULL,
  report_data JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- PORTFOLIO MANAGEMENT SYSTEM
-- ==========================================

-- 1. Portfolios Table: Master record for a user's portfolio
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'Primary Portfolio',
  description TEXT,
  currency TEXT NOT NULL DEFAULT 'INR',
  is_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Transactions Table: Record of all buy/sell/dividend events
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  asset_segment TEXT NOT NULL, -- 'equity', 'mf', 'gold', 'bonds'
  transaction_type TEXT NOT NULL, -- 'buy', 'sell', 'dividend'
  quantity DECIMAL(18, 4) NOT NULL,
  price DECIMAL(18, 4) NOT NULL, -- Executed price per unit
  brokerage DECIMAL(18, 4) DEFAULT 0,
  transaction_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Daily NAV Table: Snapshots for historical performance charting
CREATE TABLE IF NOT EXISTS daily_nav (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
  nav_date DATE NOT NULL,
  total_value DECIMAL(18, 4) NOT NULL,
  cash_balance DECIMAL(18, 4) NOT NULL,
  pnl_day DECIMAL(18, 4),
  pnl_total DECIMAL(18, 4),
  UNIQUE(portfolio_id, nav_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio ON transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_transactions_symbol ON transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_daily_nav_date ON daily_nav(nav_date);
CREATE INDEX IF NOT EXISTS idx_portfolios_user ON portfolios(user_id);
