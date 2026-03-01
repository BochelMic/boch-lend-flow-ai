-- FIX: The previous policies on user_roles used has_role() which queries user_roles itself,
-- creating an infinite recursive loop. Replace with direct auth.uid() checks.

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Agents can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Clients can view all roles" ON public.user_roles;

-- Recreate without has_role() to avoid recursion
-- All authenticated users can read roles (needed for chat contact filtering)
CREATE POLICY "Authenticated users can view all roles" ON public.user_roles
  FOR SELECT USING (auth.uid() IS NOT NULL);
