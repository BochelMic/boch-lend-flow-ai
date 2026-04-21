CREATE OR REPLACE FUNCTION public.disburse_loan_with_wallet(
    p_request_id UUID,
    p_user_id UUID,
    p_client_id UUID,
    p_amount NUMERIC,
    p_interest_rate NUMERIC,
    p_installments INT,
    p_total_amount NUMERIC,
    p_agent_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE,
    p_credit_option TEXT DEFAULT NULL,
    p_is_installment BOOLEAN DEFAULT FALSE,
    p_amortization_plan JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance NUMERIC;
BEGIN
    -- Check permissions
    IF NOT public.has_role(auth.uid(), 'gestor') THEN
        RAISE EXCEPTION 'Acesso negado. Apenas gestores podem desembolsar empréstimos.';
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

    -- 2. Update Credit Request (Also save the extra parameters to ensure they are recorded)
    UPDATE public.credit_requests 
    SET status = 'completed',
        credit_option = p_credit_option,
        is_installment = p_is_installment,
        amortization_plan = p_amortization_plan
    WHERE id = p_request_id;

    -- 3. Update Wallet Balance
    UPDATE public.company_wallet SET balance = balance - p_amount, updated_at = now() WHERE id = '00000000-0000-0000-0000-000000000001';

    -- 4. Log Transaction
    INSERT INTO public.wallet_ledger (amount, transaction_type, reference_id, description, user_id)
    VALUES (p_amount, 'disbursement', p_request_id, 'Desembolso de empréstimo', auth.uid());

    RETURN jsonb_build_object('success', true);
END;
$$;
