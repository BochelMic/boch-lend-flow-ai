ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS is_physical BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.set_client_physical(p_client_id UUID, p_is_physical BOOLEAN DEFAULT true)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF NOT public.has_role(auth.uid(), 'gestor') THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
    UPDATE public.clients SET is_physical = p_is_physical, updated_at = now() WHERE id = p_client_id;
END; $$;

GRANT EXECUTE ON FUNCTION public.set_client_physical TO authenticated;

CREATE OR REPLACE FUNCTION public.register_physical_loan(
    p_client_id UUID,
    p_client_name TEXT,
    p_amount NUMERIC,
    p_total_amount NUMERIC,
    p_client_phone TEXT DEFAULT NULL,
    p_client_email TEXT DEFAULT NULL,
    p_client_address TEXT DEFAULT NULL,
    p_interest_rate NUMERIC DEFAULT 30,
    p_installments INT DEFAULT 1,
    p_credit_option TEXT DEFAULT 'A',
    p_is_installment BOOLEAN DEFAULT FALSE,
    p_start_date DATE DEFAULT CURRENT_DATE,
    p_end_date DATE DEFAULT NULL,
    p_amortization_plan JSONB DEFAULT NULL,
    p_notes TEXT DEFAULT NULL,
    p_birth_date TEXT DEFAULT NULL,
    p_gender TEXT DEFAULT NULL,
    p_document_type TEXT DEFAULT NULL,
    p_document_number TEXT DEFAULT NULL,
    p_document_issue_date TEXT DEFAULT NULL,
    p_document_expiry_date TEXT DEFAULT NULL,
    p_nuit TEXT DEFAULT NULL,
    p_neighborhood TEXT DEFAULT NULL,
    p_district TEXT DEFAULT NULL,
    p_province TEXT DEFAULT NULL,
    p_residence_type TEXT DEFAULT NULL,
    p_occupation TEXT DEFAULT NULL,
    p_company_name TEXT DEFAULT NULL,
    p_work_duration TEXT DEFAULT NULL,
    p_monthly_income TEXT DEFAULT NULL,
    p_credit_purpose TEXT DEFAULT NULL,
    p_receive_date TEXT DEFAULT NULL,
    p_guarantee_type TEXT DEFAULT NULL,
    p_guarantee_mode TEXT DEFAULT NULL,
    p_observations TEXT DEFAULT NULL,
    p_doc_front_url TEXT DEFAULT NULL,
    p_doc_back_url TEXT DEFAULT NULL,
    p_guarantee_photos TEXT[] DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance NUMERIC;
    v_request_id UUID;
    v_loan_id UUID;
    v_end_date DATE;
BEGIN
    IF NOT public.has_role(auth.uid(), 'gestor') THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    SELECT balance INTO v_current_balance
    FROM public.company_wallet
    WHERE id = '00000000-0000-0000-0000-000000000001'
    FOR UPDATE;

    IF v_current_balance IS NULL THEN
        RAISE EXCEPTION 'Carteira da empresa nao configurada.';
    END IF;

    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Saldo insuficiente. Disponivel: MZN %. Necessario: MZN %.', v_current_balance, p_amount;
    END IF;

    v_end_date := COALESCE(p_end_date, p_start_date + INTERVAL '30 days');

    INSERT INTO public.credit_requests (
        user_id, client_name, client_email, client_phone, client_address,
        amount, purpose, term, status, reviewed_at, reviewed_by,
        review_message, agent_id,
        birth_date, gender, document_type, document_number,
        document_issue_date, document_expiry_date, nuit,
        neighborhood, district, province, residence_type,
        occupation, company_name, work_duration, monthly_income,
        credit_purpose, receive_date, guarantee_type, guarantee_mode,
        observations, doc_front_url, doc_back_url, guarantee_photos,
        credit_option, is_installment, installment_months, amortization_plan,
        interest_rate_at_request
    ) VALUES (
        NULL,
        p_client_name, p_client_email, p_client_phone, p_client_address,
        p_amount, p_credit_purpose, 1, 'completed', now(), auth.uid(),
        COALESCE(p_notes, 'Credito registado manualmente (cliente fisico)'), NULL,
        p_birth_date, p_gender, p_document_type, p_document_number,
        p_document_issue_date, p_document_expiry_date, p_nuit,
        p_neighborhood, p_district, p_province, p_residence_type,
        p_occupation, p_company_name, p_work_duration, p_monthly_income,
        p_credit_purpose, p_receive_date, p_guarantee_type, p_guarantee_mode,
        p_observations, p_doc_front_url, p_doc_back_url, p_guarantee_photos,
        p_credit_option, p_is_installment, p_installments, p_amortization_plan,
        p_interest_rate
    )
    RETURNING id INTO v_request_id;

    INSERT INTO public.loans (
        client_id, agent_id, amount, interest_rate, installments,
        total_amount, remaining_amount, status, start_date, end_date,
        credit_option, is_installment, total_installments, remaining_installments,
        original_principal, amortization_plan
    ) VALUES (
        p_client_id, NULL, p_amount, p_interest_rate, p_installments,
        p_total_amount, p_total_amount, 'active', p_start_date, v_end_date,
        p_credit_option, p_is_installment, p_installments, p_installments,
        p_amount, p_amortization_plan
    )
    RETURNING id INTO v_loan_id;

    UPDATE public.company_wallet
    SET balance = balance - p_amount, updated_at = now()
    WHERE id = '00000000-0000-0000-0000-000000000001';

    INSERT INTO public.wallet_ledger (amount, transaction_type, reference_id, description, user_id)
    VALUES (p_amount, 'disbursement', v_request_id, 'Desembolso manual - Cliente fisico: ' || p_client_name, auth.uid());

    UPDATE public.clients SET
        id_number = COALESCE(p_document_number, id_number),
        address = COALESCE(p_client_address, address),
        phone = COALESCE(p_client_phone, phone),
        updated_at = now()
    WHERE id = p_client_id;

    RETURN jsonb_build_object('success', true, 'loan_id', v_loan_id, 'request_id', v_request_id, 'new_balance', v_current_balance - p_amount);
END;
$$;

GRANT EXECUTE ON FUNCTION public.register_physical_loan TO authenticated;

NOTIFY pgrst, 'reload schema';
