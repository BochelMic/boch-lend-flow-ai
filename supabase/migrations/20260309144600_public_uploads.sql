-- Allow public (anonymous) users to upload to the chat-files bucket
-- This is necessary for the credit application form when used in public mode
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public users can upload chat files'
    ) THEN
        CREATE POLICY "Public users can upload chat files"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'chat-files');
    END IF;
END
$$;

-- Ensure anyone can view (already existed but confirming)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Anyone can view chat files'
    ) THEN
        CREATE POLICY "Anyone can view chat files"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'chat-files');
    END IF;
END
$$;
