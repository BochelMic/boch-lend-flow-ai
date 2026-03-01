-- Add all form fields as dedicated columns to credit_requests
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS document_number TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS document_issue_date TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS document_expiry_date TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS nuit TEXT;

-- Address
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS residence_type TEXT;

-- Professional
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS work_duration TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS monthly_income TEXT;

-- Credit details
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS credit_purpose TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS receive_date TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS guarantee_type TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS guarantee_mode TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS observations TEXT;

-- Document images
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS doc_front_url TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS doc_back_url TEXT;
