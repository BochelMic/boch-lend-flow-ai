-- Migration to add needs_resignature column to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS needs_resignature BOOLEAN NOT NULL DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.contracts.needs_resignature IS 'Flag set by admin to request a new signature from the client if the previous one was invalid.';
