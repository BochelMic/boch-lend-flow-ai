-- Contracts table to track signed contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_request_id UUID REFERENCES public.credit_requests(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  signature_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, signed, completed
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Clients can view their own contracts
CREATE POLICY "Clients can view own contracts" ON public.contracts
  FOR SELECT USING (auth.uid() = client_id);

-- Clients can update own contracts (signature)
CREATE POLICY "Clients can sign own contracts" ON public.contracts
  FOR UPDATE USING (auth.uid() = client_id);

-- Gestors can do everything
CREATE POLICY "Gestors can manage contracts" ON public.contracts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'gestor')
  );

-- Agents can view contracts
CREATE POLICY "Agents can view contracts" ON public.contracts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'agente')
  );

-- Gestors can insert contracts
CREATE POLICY "Gestors can insert contracts" ON public.contracts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'gestor')
  );

-- Clients can insert contracts (when self-signing after approval)
CREATE POLICY "Clients can create own contracts" ON public.contracts
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Storage bucket for signatures
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('signatures', 'signatures', true, 2097152)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload signatures"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'signatures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view signatures"
ON storage.objects FOR SELECT USING (bucket_id = 'signatures');
