-- Migration: Late Fee Payment Fix
-- Description: Updates the payment RPC to accept and process penalty amount
-- Date: 2026-03-24

CREATE OR REPLACE FUNCTION public.receive_payment_with_wallet(
    p_loan_id UUID,
    p_amount NUMERIC,
    p_payment_method TEXT,
    p_payment_date DATE,
    p_notes TEXT,
    p_received_by UUID,
    p_installment_number INTEGER DEFAULT NULL,
    p_is_liquidation BOOLEAN DEFAULT FALSE,
    p_penalty_amount NUMERIC DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_remaining NUMERIC;
    v_total_amount NUMERIC;
    v_new_status TEXT := 'active';
    v_paid_so_far NUMERIC;
BEGIN
    -- 0. Check if loan exists and is active/overdue
    SELECT remaining_amount, total_amount INTO v_remaining, v_total_amount 
    FROM public.loans WHERE id = p_loan_id FOR UPDATE;

    IF v_remaining IS NULL THEN
        RAISE EXCEPTION 'Empréstimo não encontrado';
    END IF;

    -- 1. Apply Penalty if applicable
    IF p_penalty_amount > 0 THEN
        v_total_amount := v_total_amount + p_penalty_amount;
        v_remaining := v_remaining + p_penalty_amount;
        
        -- Update the loan record with the new penalty
        UPDATE public.loans 
        SET total_amount = v_total_amount,
            remaining_amount = v_remaining
        WHERE id = p_loan_id;

        -- Optionally, log the penalty as a ledger entry (if you want to track penalties separately)
        INSERT INTO public.wallet_ledger (amount, transaction_type, reference_id, description, user_id)
        VALUES (p_penalty_amount, 'interest', p_loan_id, 'Aplicação de juros de mora', p_received_by);
    END IF;

    -- 2. Insert Payment Record
    INSERT INTO public.payments (loan_id, amount, payment_date, payment_method, notes, received_by, installment_number)
    VALUES (p_loan_id, p_amount, p_payment_date, p_payment_method, p_notes, p_received_by, p_installment_number);
    
    -- Calculate how much was paid before this transaction
    v_paid_so_far := v_total_amount - v_remaining;

    IF p_is_liquidation THEN
        -- Forced closure with discount
        v_remaining := 0;
        v_new_status := 'paid';
        
        -- ADJUSTMENT: Update the loan's total_amount to perfectly match actual paid amount
        -- This ensures (total_amount - remaining_amount) / total_amount = 1.0 (100% progress)
        UPDATE public.loans 
        SET remaining_amount = 0,
            total_amount = v_paid_so_far + p_amount, -- New Total = what was paid before + this final payment
            status = 'paid',
            remaining_installments = 0,
            updated_at = now()
        WHERE id = p_loan_id;
    ELSE
        -- Standard payment logic
        v_remaining := v_remaining - p_amount;
        
        IF v_remaining <= 0 THEN
            v_remaining := 0;
            v_new_status := 'paid';
        END IF;

        UPDATE public.loans 
        SET remaining_amount = v_remaining, 
            status = v_new_status,
            -- If it was installment based, we might want to decrement remaining_installments here too
            -- but the system usually handles that via installment_number logic if provided.
            -- For simplicity and robustness, if fully paid, zero out installments.
            remaining_installments = CASE WHEN v_new_status = 'paid' THEN 0 ELSE remaining_installments END,
            updated_at = now() 
        WHERE id = p_loan_id;
    END IF;

    -- 3. Update Wallet Balance
    UPDATE public.company_wallet 
    SET balance = balance + p_amount, 
        updated_at = now() 
    WHERE id = '00000000-0000-0000-0000-000000000001';

    -- 4. Log Transaction in Ledger
    INSERT INTO public.wallet_ledger (amount, transaction_type, reference_id, description, user_id)
    VALUES (p_amount, 'repayment', p_loan_id, 
            CASE WHEN p_is_liquidation THEN 'Liquidação de empréstimo (com desconto)' ELSE 'Recebimento de prestação' END, 
            p_received_by);

    RETURN jsonb_build_object(
        'success', true, 
        'remaining_amount', v_remaining, 
        'status', v_new_status,
        'penalty_applied', p_penalty_amount
    );
END;
$$;
