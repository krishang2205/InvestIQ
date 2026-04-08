-- investiq_schema.sql
-- Run this entire script in your Supabase SQL Editor.

-- 1. Create portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'INR',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    portfolio_id UUID NOT NULL REFERENCES public.portfolios(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    asset_segment TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    price NUMERIC NOT NULL,
    brokerage NUMERIC NOT NULL DEFAULT 0,
    transaction_date DATE NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for querying transactions by portfolio and date
CREATE INDEX IF NOT EXISTS idx_transactions_portfolio_date ON public.transactions (portfolio_id, transaction_date);

-- 3. Create instrument_cache table
-- Using JSONB for efficient storage and querying if needed
CREATE TABLE IF NOT EXISTS public.instrument_cache (
    symbol TEXT PRIMARY KEY,
    payload_json JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Create Learning Module Tables
-- NOTE: Using TEXT for IDs because the app seeds human-readable IDs like 'lesson-1'
CREATE TABLE IF NOT EXISTS public.learning_lessons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    video_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.learning_quizzes (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options_json JSONB NOT NULL,
    correct_option_index INTEGER NOT NULL,
    order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.learning_progress (
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL REFERENCES public.learning_lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started',
    quiz_score INTEGER,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS public.learning_final_questions (
    id TEXT PRIMARY KEY,
    question TEXT NOT NULL,
    options_json JSONB NOT NULL,
    correct_option_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS public.learning_assessments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Important: Since we want anyone with anon keys to work gracefully in this server-side setup, 
-- or because our Python backend handles logic: 
-- We don't strictly need Row Level Security (RLS) if we only access DB via server-side service keys. 
-- However, Supabase enables RLS by default or prefers it.
-- Let's explicitly disable RLS for these tables assuming traditional API-gateway backend architecture
-- (since our backend app.py runs queries securely).
-- If you want RLS later, you can enable it and write policies.
ALTER TABLE public.portfolios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.instrument_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_lessons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_quizzes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_final_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_assessments DISABLE ROW LEVEL SECURITY;

-- 5. Create Reports table (Intelligence Reports)
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    symbol TEXT NOT NULL,
    user_id TEXT NOT NULL DEFAULT 'anonymous',
    status TEXT NOT NULL DEFAULT 'pending',
    report_data JSONB,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports (created_at DESC);

ALTER TABLE public.reports DISABLE ROW LEVEL SECURITY;
