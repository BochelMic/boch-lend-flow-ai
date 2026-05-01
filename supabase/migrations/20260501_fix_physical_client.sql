-- ============================================================
-- FIX: Schema cache bypass for is_physical
-- Execute this in Supabase SQL Editor
-- ============================================================

-- 1. Ensure column exists
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_physical BOOLEAN NOT NULL DEFAULT false;

-- 2. Create a small RPC to set is_physical (bypasses PostgREST cache)
CREATE OR REPLACE FUNCTION public.set_client_physical(p_client_id UUID, p_is_physical BOOLEAN DEFAULT true)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.has_role(auth.uid(), 'gestor') THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;
    UPDATE public.clients SET is_physical = p_is_physical, updated_at = now() WHERE id = p_client_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_client_physical TO authenticated;

-- 3. Force PostgREST schema reload
NOTIFY pgrst, 'reload schema';
