-- ==========================================
-- FIX REALTIME NOTIFICATIONS
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Enable REPLICA IDENTITY FULL
-- This is crucial for Supabase Realtime to track changes and filters correctly
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- 2. Ensure the table is in the realtime publication
DO $$
BEGIN
    -- Try to add the table to the publication
    -- If it already exists, it will catch the duplicate_object exception
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION
        WHEN duplicate_object THEN 
            RAISE NOTICE 'Table notifications is already in the publication.';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error adding table to publication: %', SQLERRM;
    END;
END;
$$;

-- 3. Verify Publication (Optional check)
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications';
