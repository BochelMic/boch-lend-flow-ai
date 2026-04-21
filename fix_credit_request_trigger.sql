CREATE OR REPLACE FUNCTION public.trigger_send_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payload JSON;
  v_function_url TEXT;
  v_headers JSON;
  v_trigger_event TEXT;
  v_client_name TEXT;
  v_agent_name TEXT;
  v_amount TEXT;
BEGIN
  v_function_url := COALESCE(
    current_setting('app.edge_function_url', true), 
    'http://host.docker.internal:54321/functions/v1/send-notification'
  );
  
  v_headers := json_build_array(
    json_build_object('name', 'Content-Type', 'value', 'application/json')
  );

  IF TG_TABLE_NAME = 'credit_requests' THEN
    IF TG_OP = 'INSERT' THEN
      v_trigger_event := 'Novo Pedido de Crédito';
      
      -- FIX: credit_requests has user_id, not client_id
      SELECT name INTO v_client_name FROM public.clients WHERE user_id = NEW.user_id LIMIT 1;
      
      v_payload := json_build_object(
        'type', 'system',
        'title', v_trigger_event,
        'body', 'O cliente ' || COALESCE(v_client_name, NEW.client_name, 'Desconhecido') || ' fez um novo pedido de ' || NEW.amount || ' MZN.',
        'link_url', '/credit-requests',
        'event', 'credit_request_created',
        'record_id', NEW.id,
        'client_id', NEW.user_id -- Use user_id since client_id doesn't exist on this table
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
