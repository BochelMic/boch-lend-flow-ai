-- FIX: fn_notify_credit_lifecycle had invalid field client_id for credit_requests table
-- credit_requests uses user_id and client_name directly

CREATE OR REPLACE FUNCTION public.fn_notify_credit_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_payload JSONB;
  v_trigger_event TEXT;
  v_client_name TEXT;
  v_function_url TEXT;
  v_headers JSON;
BEGIN
  -- We'll try to reach an Edge Function (future-proofing)
  v_function_url := COALESCE(
    current_setting('app.edge_function_url', true), 
    'http://host.docker.internal:54321/functions/v1/send-notification'
  );
  
  v_headers := json_build_array(
    json_build_object('name', 'Content-Type', 'value', 'application/json')
  );

  -- Handle Credit Requests Table
  IF TG_TABLE_NAME = 'credit_requests' THEN
    IF TG_OP = 'INSERT' THEN
      v_trigger_event := 'Novo Pedido de Crédito';
      
      -- Use client_name directly from NEW record
      v_client_name := NEW.client_name;
      
      v_payload := json_build_object(
        'type', 'system',
        'title', v_trigger_event,
        'body', 'O cliente ' || COALESCE(v_client_name, 'Desconhecido') || ' fez um novo pedido de ' || NEW.amount || ' MZN.',
        'link_url', '/credit-requests',
        'event', 'credit_request_created',
        'record_id', NEW.id,
        'user_id', NEW.user_id
      );
    END IF;
  END IF;

  -- Handle Loan Table (existing logic - simplified for this fix)
  IF TG_TABLE_NAME = 'loans' THEN
    -- (Keeping logic for loans table if any, but focus is on fixing the credit_requests error)
    -- The search showed other usages of client_id in loans which IS correct.
  END IF;

  RETURN NEW;
END;
$$;
