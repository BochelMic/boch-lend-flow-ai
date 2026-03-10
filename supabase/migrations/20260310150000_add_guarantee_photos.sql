-- Adds guarantee_photos array column to credit_requests
ALTER TABLE public.credit_requests 
ADD COLUMN IF NOT EXISTS guarantee_photos TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.credit_requests.guarantee_photos IS 'Array of URLs point to images of the guarantee item';
