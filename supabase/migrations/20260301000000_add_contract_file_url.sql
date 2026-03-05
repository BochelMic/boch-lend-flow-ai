-- Migration to add specific contract file URL
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS contract_url TEXT;

-- Bucket for Contracts
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('contracts', 'contracts', true, 5242880)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Gestors can upload contracts"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'contracts' AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'gestor')
);

CREATE POLICY "Anyone can view contracts"
ON storage.objects FOR SELECT USING (bucket_id = 'contracts');
