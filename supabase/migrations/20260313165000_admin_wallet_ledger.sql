-- Migration: Admin Wallet Ledger System
-- Description: Adds company_wallet and transactional ledger with atomic RPCs.

-- 1. Create company_wallet (Single row table)
CREATE TABLE IF NOT EXISTS public.company_wallet (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001', -- Fixed ID for single row
    balance NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row_check CHECK (id = '00000000-0000-0000-0000-000000000001')
);

-- Initialize wallet if not exists
INSERT INTO public.company_wallet (id, balance)
VALUES ('00000000-0000-0000-0000-000000000001', 0)
ON CONFLICT (id) DO NOTHING;

-- 2. Create wallet_ledger (History)
CREATE TABLE IF NOT EXISTS public.wallet_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('injection', 'disbursement', 'repayment')),
    reference_id UUID, -- Can link to credit_request_id or payment_id
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) -- Who performed the action
);

-- 3. RLS Policies
ALTER TABLE public.company_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;

-- Only Gestores can see or manage the wallet
CREATE POLICY "Gestores can view company wallet" ON public.company_wallet
    FOR SELECT TO authenticated
    USING (public.has_role('gestor', auth.uid()));

CREATE POLICY "Gestores can view ledger" ON public.wallet_ledger
    FOR SELECT TO authenticated
    USING (public.has_role('gestor', auth.uid()));

-- 4. RPC Functions (Atomic Transactions)

-- Function: Inject Funds
CREATE OR REPLACE FUNCTION public.inject_wallet_funds(
    p_amount NUMERIC,
    p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_balance NUMERIC;
BEGIN
    -- Check permissions
    IF NOT public.has_role('gestor', auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas gestores podem injetar saldo.';
    END IF;

    -- Update balance
    UPDATE public.company_wallet
    SET balance = balance + p_amount,
        updated_at = now()
    WHERE id = '00000000-0000-0000-0000-000000000001'
    RETURNING balance INTO v_new_balance;

    -- Log transaction
    INSERT INTO public.wallet_ledger (amount, transaction_type, description, user_id)
    VALUES (p_amount, 'injection', p_description, auth.uid());

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- Function: Disburse Loan (Atomic)
CREATE OR REPLACE FUNCTION public.disburse_loan_with_wallet(
    p_request_id UUID,
    p_user_id UUID, -- Client user_id
    p_client_id UUID,
    p_amount NUMERIC,
    p_interest_rate NUMERIC,
    p_installments INT,
    p_total_amount NUMERIC,
    p_agent_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance NUMERIC;
BEGIN
    -- Check permissions
    IF NOT public.has_role('gestor', auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    -- Check balance
    SELECT balance INTO v_current_balance FROM public.company_wallet WHERE id = '00000000-0000-0000-0000-000000000001' FOR UPDATE;
    
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Saldo insuficiente na carteira da empresa (Disponível: MZN %)', v_current_balance;
    END IF;

    -- 1. Create Loan
    INSERT INTO public.loans (
        client_id, agent_id, amount, interest_rate, installments, 
        total_amount, remaining_amount, status, start_date, end_date
    ) VALUES (
        p_client_id, p_agent_id, p_amount, p_interest_rate, p_installments,
        p_total_amount, p_total_amount, 'active', p_start_date, p_end_date
    );

    -- 2. Update Credit Request
    UPDATE public.credit_requests SET status = 'completed' WHERE id = p_request_id;

    -- 3. Update Wallet Balance
    UPDATE public.company_wallet SET balance = balance - p_amount, updated_at = now() WHERE id = '00000000-0000-0000-0000-000000000001';

    -- 4. Log Transaction
    INSERT INTO public.wallet_ledger (amount, transaction_type, reference_id, description, user_id)
    VALUES (p_amount, 'disbursement', p_request_id, 'Desembolso de empréstimo', auth.uid());

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Function: Receive Payment (Atomic)
CREATE OR REPLACE FUNCTION public.receive_payment_with_wallet(
    p_loan_id UUID,
    p_amount NUMERIC,
    p_payment_method TEXT,
    p_payment_date DATE,
    p_notes TEXT,
    p_received_by UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_remaining NUMERIC;
    v_new_status TEXT := 'active';
BEGIN
    -- 1. Insert Payment
    INSERT INTO public.payments (loan_id, amount, payment_date, payment_method, notes, received_by)
    VALUES (p_loan_id, p_amount, p_payment_date, p_payment_method, p_notes, p_received_by);

    -- 2. Update Loan Balance
    SELECT remaining_amount - p_amount INTO v_remaining FROM public.loans WHERE id = p_loan_id FOR UPDATE;
    
    IF v_remaining <= 0 THEN
        v_remaining := 0;
        v_new_status := 'paid';
    END IF;

    UPDATE public.loans 
    SET remaining_amount = v_remaining, 
        status = v_new_status, 
        updated_at = now() 
    WHERE id = p_loan_id;

    -- 3. Update Wallet Balance (Increments with full payment amount - principal + interest)
    UPDATE public.company_wallet 
    SET balance = balance + p_amount, 
        updated_at = now() 
    WHERE id = '00000000-0000-0000-0000-000000000001';

    -- 4. Log Transaction
    INSERT INTO public.wallet_ledger (amount, transaction_type, reference_id, description, user_id)
    VALUES (p_amount, 'repayment', p_loan_id, 'Recebimento de prestação', p_received_by);

    RETURN jsonb_build_object('success', true, 'remaining_amount', v_remaining, 'status', v_new_status);
END;
$$;
