-- Trigger to automatically call the send-notification Edge Function when a new notification is inserted
-- This ensures that Push Notifications are sent even when the user is offline/background.

-- 1. Create the function that calls the Edge Function
CREATE OR REPLACE FUNCTION public.handle_push_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_url TEXT;
  v_anon_key TEXT;
  v_payload JSON;
BEGIN
  -- Get Supabase URL and Anon Key from environment/vault if possible, 
  -- but for Edge Functions we usually use the project reference or internal URL.
  -- In this case, we'll use the Supabase HTTP extension to call the local endpoint.
  
  v_payload := json_build_object(
    'userId', NEW.user_id,
    'title', NEW.title,
    'body', NEW.body,
    'link_url', COALESCE(NEW.link_url, '/'),
    'type', NEW.type,
    'push_only', true -- Custom flag to avoid circular creation
  );

  -- Perform the HTTP post to the Edge Function
  -- Note: This requires the net extension to be enabled in Supabase
  PERFORM
    net.http_post(
      url := 'https://ultxbbewznmyjqrzthyw.supabase.co/functions/v1/send-notification',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (SELECT COALESCE(current_setting('vault.service_role_key', true), ''))
      ),
      body := v_payload::jsonb
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback/Logging: Don't block the transaction if the push fails
    RAISE NOTICE 'Error triggering push notification: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS tr_push_notification ON public.notifications;
CREATE TRIGGER tr_push_notification
AFTER INSERT ON public.notifications
FOR EACH ROW
EXECUTE FUNCTION public.handle_push_notification();
