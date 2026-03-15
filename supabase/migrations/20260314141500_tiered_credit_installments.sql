-- Migration: Support for tiered credit options and installments
-- Date: 2026-03-14

-- 1. Update credit_requests table
ALTER TABLE public.credit_requests 
ADD COLUMN IF NOT EXISTS credit_option TEXT, -- 'A', 'B', 'C'
ADD COLUMN IF NOT EXISTS is_installment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS installment_months INTEGER,
ADD COLUMN IF NOT EXISTS amortization_plan JSONB,
ADD COLUMN IF NOT EXISTS interest_rate_at_request NUMERIC(5,2);

-- 2. Update loans table to reflect active plans
ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS credit_option TEXT,
ADD COLUMN IF NOT EXISTS is_installment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS remaining_installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS next_installment_date DATE,
ADD COLUMN IF NOT EXISTS next_capitalization_date DATE, -- For Option B jump or recapitalization
ADD COLUMN IF NOT EXISTS original_principal NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS amortization_plan JSONB;

-- 3. Update payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS installment_number INTEGER;

-- Comment on columns for clarity
COMMENT ON COLUMN public.credit_requests.credit_option IS 'A (500-4k, 30%), B (5k-100k, 20/30%), C (5k-100k, 30%)';
COMMENT ON COLUMN public.credit_requests.amortization_plan IS 'Array of installments [ { "date": "...", "amount": "...", "principal": "...", "interest": "..." } ]';
