-- ============================================================
-- FIX: Notification System - 3 Critical Bugs
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- FIX #1: Create the missing RPC function get_gestors_for_notification
-- Called by notifyEvent.ts but never existed in the database
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_gestors_for_notification()
RETURNS TABLE(user_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.user_id
  FROM public.user_roles ur
  WHERE ur.role = 'gestor';
$$;

-- ============================================================
-- FIX #2: Fix RLS INSERT policy on notifications table
-- Old policy only allowed gestors to insert → blocked clients/agents
-- New policy: any authenticated user can insert (app controls the target)
-- ============================================================
DROP POLICY IF EXISTS "Gestors can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- FIX #3: Fix automation_rules RLS policy
-- Old policy used profiles.role which does not exist
-- New policy uses user_roles table (correct location of role data)
-- ============================================================
DROP POLICY IF EXISTS "Gestores can manage automation rules" ON public.automation_rules;

CREATE POLICY "Gestores can manage automation rules"
  ON public.automation_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'gestor'
    )
  );
