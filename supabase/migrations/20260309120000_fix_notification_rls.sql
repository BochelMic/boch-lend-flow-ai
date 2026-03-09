-- Allow users to insert notifications if they are the sender
-- This is necessary for clients notifying admins about signed contracts, etc.

CREATE POLICY "Users can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- Allow users to see their own notifications (already exists likely, but just in case)
-- DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
-- CREATE POLICY "Users can view own notifications" ON public.notifications
--   FOR SELECT USING (user_id = auth.uid());
