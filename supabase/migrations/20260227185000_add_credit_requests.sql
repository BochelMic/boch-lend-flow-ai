-- Credit requests table
CREATE TABLE public.credit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  amount NUMERIC(12,2) NOT NULL,
  purpose TEXT,
  term INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_message TEXT,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_requests ENABLE ROW LEVEL SECURITY;

-- Gestors can manage all credit requests
CREATE POLICY "Gestors can manage all credit_requests" ON public.credit_requests
  FOR ALL USING (public.has_role(auth.uid(), 'gestor'));

-- Agents can view credit requests assigned to them
CREATE POLICY "Agents can view assigned credit_requests" ON public.credit_requests
  FOR SELECT USING (agent_id = auth.uid());

-- Agents can insert credit requests
CREATE POLICY "Agents can insert credit_requests" ON public.credit_requests
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'agente'));

-- Users can view own credit requests
CREATE POLICY "Users can view own credit_requests" ON public.credit_requests
  FOR SELECT USING (user_id = auth.uid());

-- Anyone authenticated can insert credit requests (for public form)
CREATE POLICY "Authenticated users can insert credit_requests" ON public.credit_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow agents to insert clients
CREATE POLICY "Agents can insert clients" ON public.clients
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'agente'));

-- Also allow agents to manage their assigned loans
CREATE POLICY "Agents can manage assigned loans" ON public.loans
  FOR ALL USING (agent_id = auth.uid());

-- Also allow agents to insert loans
CREATE POLICY "Agents can insert loans" ON public.loans
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'agente'));
