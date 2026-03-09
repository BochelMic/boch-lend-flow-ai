-- Fix 403 error on notifications: 
-- Allow users to "see" notifications where they are the sender (from_user_id)
-- This is necessary during insert() which implicitly performs a select() to return the new row.
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = from_user_id);

-- Ensure users can insert if they are the sender (should already exist but confirm)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND schemaname = 'public' 
        AND policyname = 'Users can insert notifications'
    ) THEN
        CREATE POLICY "Users can insert notifications" ON public.notifications
          FOR INSERT WITH CHECK (from_user_id = auth.uid());
    END IF;
END
$$;

-- Allow all authenticated users to read user roles for 'gestor'
-- This is needed for clients to find who to notify when a contract is signed.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' 
        AND schemaname = 'public' 
        AND policyname = 'Authenticated users can see gestors'
    ) THEN
        CREATE POLICY "Authenticated users can see gestors" ON public.user_roles
          FOR SELECT USING (role = 'gestor' AND auth.role() = 'authenticated');
    END IF;
END
$$;
