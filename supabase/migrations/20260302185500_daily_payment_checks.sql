-- Creating a function to identify upcoming and overdue payments and trigger notifications
CREATE OR REPLACE FUNCTION public.check_daily_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    loan_record RECORD;
    v_function_url TEXT;
    v_payload JSON;
BEGIN
    v_function_url := COALESCE(
        current_setting('app.edge_function_url', true), 
        'http://host.docker.internal:54321/functions/v1/send-notification'
    );

    -- 1. Check for payments due in exactly 5 days
    FOR loan_record IN 
        SELECT l.id, l.client_id, l.amount, l.end_date, c.name as client_name 
        FROM public.loans l
        JOIN public.clients c ON c.id = l.client_id
        WHERE l.status = 'active' AND l.end_date = CURRENT_DATE + INTERVAL '5 days'
    LOOP
        v_payload := json_build_object(
            'type', 'system',
            'title', 'Aviso de Vencimento',
            'body', 'Olá ' || loan_record.client_name || ', o seu pagamento de ' || loan_record.amount || ' MZN vence em 5 dias.',
            'link_url', '/',
            'client_id', loan_record.client_id
        );
        -- In a real environment, trigger the edge function
        -- PERFORM http_post(v_function_url, v_payload::text, 'application/json');
    END LOOP;
    
    -- 2. Check for payments due tomorrow (1 day)
    FOR loan_record IN 
        SELECT l.id, l.client_id, l.amount, l.end_date, c.name as client_name 
        FROM public.loans l
        JOIN public.clients c ON c.id = l.client_id
        WHERE l.status = 'active' AND l.end_date = CURRENT_DATE + INTERVAL '1 day'
    LOOP
        v_payload := json_build_object(
            'type', 'alert',
            'title', 'Vencimento Amanhã',
            'body', 'URGENTE: O seu pagamento de ' || loan_record.amount || ' MZN vence amanhã.',
            'link_url', '/',
            'client_id', loan_record.client_id
        );
        -- PERFORM http_post(v_function_url, v_payload::text, 'application/json');
    END LOOP;
    
    -- 3. Check for overdue payments
    FOR loan_record IN 
        SELECT l.id, l.client_id, l.amount, l.end_date, c.name as client_name 
        FROM public.loans l
        JOIN public.clients c ON c.id = l.client_id
        WHERE l.status = 'active' AND l.end_date < CURRENT_DATE
    LOOP
        v_payload := json_build_object(
            'type', 'alert',
            'title', 'Pagamento em Atraso',
            'body', 'O seu pagamento de ' || loan_record.amount || ' MZN está em ATRASO desde ' || loan_record.end_date || '.',
            'link_url', '/',
            'client_id', loan_record.client_id
        );
        -- PERFORM http_post(v_function_url, v_payload::text, 'application/json');
    END LOOP;
END;
$$;

-- NOTE: To actually schedule this daily, we would use the pg_cron extension if available on the Supabase project:
-- CREATE EXTENSION IF NOT EXISTS pg_cron;
-- SELECT cron.schedule('check-payments-daily', '0 8 * * *', 'SELECT public.check_daily_payments()');
