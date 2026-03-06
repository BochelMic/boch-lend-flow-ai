-- Add NUIT and address to system_settings for invoice/receipt documents
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS nuit TEXT DEFAULT '';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'Maputo, Moçambique';
