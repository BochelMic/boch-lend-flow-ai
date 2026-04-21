-- FIX: handle_new_user trigger - ON CONFLICT clause was wrong for user_roles
-- user_roles has UNIQUE(user_id, role), not UNIQUE(user_id)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_role app_role;
  v_agent_id UUID := NULL;
  v_client_id UUID := NULL;
BEGIN
  -- Determine role
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    user_role := (NEW.raw_user_meta_data->>'role')::app_role;
  ELSE
    user_role := 'cliente'::app_role;
  END IF;

  -- Insert profile
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  )
  ON CONFLICT (user_id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email;

  -- Insert role (FIX: use user_id, role pair for ON CONFLICT)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- If the user is a client, handle client record creation/linking
  IF user_role = 'cliente' THEN
    -- Extract agent_id from metadata if present
    IF NEW.raw_user_meta_data->>'agent_id' IS NOT NULL THEN
      BEGIN
        v_agent_id := (NEW.raw_user_meta_data->>'agent_id')::UUID;
      EXCEPTION WHEN OTHERS THEN
        v_agent_id := NULL;
      END;
    END IF;

    -- Check if a client record already exists
    SELECT id INTO v_client_id 
    FROM public.clients 
    WHERE (email = NEW.email) 
       OR (phone = NEW.raw_user_meta_data->>'phone' AND phone IS NOT NULL)
    LIMIT 1;

    IF v_client_id IS NOT NULL THEN
      UPDATE public.clients
      SET 
        user_id = NEW.id,
        name = COALESCE(NEW.raw_user_meta_data->>'name', name),
        agent_id = COALESCE(v_agent_id, agent_id), 
        updated_at = now()
      WHERE id = v_client_id;
    ELSE
      INSERT INTO public.clients (user_id, name, email, phone, status, agent_id)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        'active',
        v_agent_id
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$;
