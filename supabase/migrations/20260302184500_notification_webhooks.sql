-- Create an extension if not exists for making HTTP requests from Postgres
CREATE EXTENSION IF NOT EXISTS http WITH SCHEMA extensions;

-- Create a generic function to call our Edge Function
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
  -- We'll assume the edge function URL is configured in a custom setting or we can hardcode for local dev
  -- In production, replace with your actual project URL: https://<project-ref>.supabase.co/functions/v1/send-notification
  v_function_url := COALESCE(
    current_setting('app.edge_function_url', true), 
    'http://host.docker.internal:54321/functions/v1/send-notification' -- Fallback for local dev
  );
  
  -- The anon key must be passed. In a real setup you might use the service_role key to bypass RLS in the function
  v_headers := json_build_array(
    json_build_object('name', 'Content-Type', 'value', 'application/json')
  );

  -- Handle Credit Requests Table
  IF TG_TABLE_NAME = 'credit_requests' THEN
    IF TG_OP = 'INSERT' THEN
      v_trigger_event := 'Novo Pedido de Crédito';
      
      -- Fetch client details
      SELECT name INTO v_client_name FROM public.clients WHERE id = NEW.client_id;
      
      -- Notify agents/gestores (We need to send an HTTP request per relevant user, or the edge function handles fetching all gestores)
      -- Let's construct a payload that the Edge Function will process.
      -- To simplify the trigger, we'll send the raw event and let the Edge Function figure out WHO to send it to.
      -- But for this example, let's say we just notify a specific user (or the edge function will query users).
      v_payload := json_build_object(
        'type', 'system',
        'title', v_trigger_event,
        'body', 'O cliente ' || COALESCE(v_client_name, 'Desconhecido') || ' fez um novo pedido de ' || NEW.amount || ' MZN.',
        'link_url', '/credit-requests',
        'event', 'credit_request_created',
        'record_id', NEW.id,
        'client_id', NEW.client_id
      );
      
      -- Call the edge function (fire and forget basically)
      -- In a real scenario, consider using pg_net for true async HTTP requests without blocking the transaction
      -- PERFORM http_post(v_function_url, v_payload::text, 'application/json');
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create Trigger on credit_requests
DROP TRIGGER IF EXISTS on_credit_request_created ON public.credit_requests;
CREATE TRIGGER on_credit_request_created
  AFTER INSERT ON public.credit_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_send_notification();

-- --------------------------------------------------------
-- Alternative: Using Supabase Database Webhooks (UI driven)
-- --------------------------------------------------------
-- Note: Often it's cleaner to set up Supabase Webhooks directly from the Dashboard
-- pointing to the Edge Function, effectively replacing the need for 'pg_net' or 'http' extensions.
-- The Edge Function receives the generic `record` and acts on it.
-- We will implement the logic inside the Edge Function to handle these payloads!
