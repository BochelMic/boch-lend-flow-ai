-- Allow all authenticated users to read profiles and roles for chat contact discovery
-- Without this, agents and clients cannot see other users in the chat

-- Agents can view all profiles (needed for chat)
CREATE POLICY "Agents can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'agente'));

-- Clients can view profiles of gestors and agents (for chat)
CREATE POLICY "Clients can view gestor and agent profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'cliente')
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = profiles.user_id
      AND ur.role IN ('gestor', 'agente')
    )
  );

-- Agents can view all roles (needed for chat contact filtering)
CREATE POLICY "Agents can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'agente'));

-- Clients can view roles (needed for chat contact filtering)
CREATE POLICY "Clients can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'cliente'));
