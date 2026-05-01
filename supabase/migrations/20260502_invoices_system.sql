-- ============================================================
-- INVOICES TABLE + SEQUENCES + SYSTEM_SETTINGS UPDATE
-- Execute in Supabase SQL Editor
-- ============================================================

-- 1. Add missing columns to system_settings
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS nuit TEXT DEFAULT '';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'Maputo, Moçambique';

-- Update with correct company data
UPDATE public.system_settings SET
    company_name = 'Bochel Microcredito, Ei',
    email = 'bm@bochelmicrocredito.com',
    phone = '+258 86 188 7302 / +258 84 582 8205',
    nuit = '1477066510',
    address = 'Moçambique, Maputo - Malhampsene (N4)';

-- 2. Sequences for document numbering
CREATE SEQUENCE IF NOT EXISTS public.invoice_seq START 1;
CREATE SEQUENCE IF NOT EXISTS public.receipt_seq START 1;

-- 3. RPC to get next invoice number
CREATE OR REPLACE FUNCTION public.next_invoice_number()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN 'FAT-' || LPAD(nextval('public.invoice_seq')::TEXT, 3, '0');
END; $$;

GRANT EXECUTE ON FUNCTION public.next_invoice_number TO authenticated;

-- 4. RPC to get next receipt number
CREATE OR REPLACE FUNCTION public.next_receipt_number()
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN 'REC-' || LPAD(nextval('public.receipt_seq')::TEXT, 3, '0');
END; $$;

GRANT EXECUTE ON FUNCTION public.next_receipt_number TO authenticated;

-- 5. Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL UNIQUE,
    loan_id UUID REFERENCES public.loans(id) ON DELETE SET NULL,
    client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
    client_name TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL,
    total_with_interest NUMERIC(12,2),
    interest_rate NUMERIC(5,2),
    installments INT DEFAULT 1,
    description TEXT DEFAULT 'Concessão de microcrédito',
    status TEXT NOT NULL DEFAULT 'pending',
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestor full access to invoices"
    ON public.invoices FOR ALL
    USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'gestor'))
    WITH CHECK (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'gestor'));

CREATE POLICY "Authenticated read invoices"
    ON public.invoices FOR SELECT
    USING (auth.role() = 'authenticated');

-- 6. Force schema reload
NOTIFY pgrst, 'reload schema';
