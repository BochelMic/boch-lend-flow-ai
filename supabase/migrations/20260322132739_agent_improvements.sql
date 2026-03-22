-- Create agent_goals table
CREATE TABLE IF NOT EXISTS public.agent_goals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month DATE NOT NULL,
    target_amount NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(agent_id, month)
);

-- Add RLS to agent_goals
ALTER TABLE public.agent_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can manage all agent goals"
    ON public.agent_goals FOR ALL
    USING (public.has_role(auth.uid(), 'gestor'::app_role));

CREATE POLICY "Agents can view their own goals"
    ON public.agent_goals FOR SELECT
    USING (auth.uid() = agent_id);

-- Update handle_new_user function to extract agent_id and link appropriately
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

  -- Insert role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role)
  ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;

  -- If the user is a client, handle client record creation/linking
  IF user_role = 'cliente' OR NEW.raw_user_meta_data->>'role' = 'cliente' THEN
    
    -- Extract agent_id from metadata if present
    IF NEW.raw_user_meta_data->>'agent_id' IS NOT NULL THEN
      BEGIN
        v_agent_id := (NEW.raw_user_meta_data->>'agent_id')::UUID;
      EXCEPTION WHEN OTHERS THEN
        v_agent_id := NULL;
      END;
    END IF;

    -- Check if a client record already exists for this email OR phone
    SELECT id INTO v_client_id 
    FROM public.clients 
    WHERE (email = NEW.email) 
       OR (phone = NEW.raw_user_meta_data->>'phone' AND phone IS NOT NULL)
    LIMIT 1;

    IF v_client_id IS NOT NULL THEN
      -- Link existing client to this new auth user
      UPDATE public.clients
      SET 
        user_id = NEW.id,
        name = COALESCE(NEW.raw_user_meta_data->>'name', name),
        -- If an agent is registering this client, enforce the agent_id
        agent_id = COALESCE(v_agent_id, agent_id), 
        updated_at = now()
      WHERE id = v_client_id;
    ELSE
      -- Create new client record
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
