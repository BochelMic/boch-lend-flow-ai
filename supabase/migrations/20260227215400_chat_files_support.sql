-- Add file attachment support to chat_messages
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Make content nullable (messages can be file-only)
ALTER TABLE public.chat_messages ALTER COLUMN content DROP NOT NULL;

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat files
CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view chat files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');
