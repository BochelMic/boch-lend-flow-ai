-- Add avatar_url to profiles for chat profile photos
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
