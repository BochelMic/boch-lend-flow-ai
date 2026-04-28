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
  -- 1. Determinar o papel (Role)
  BEGIN
    IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
      user_role := (NEW.raw_user_meta_data->>'role')::app_role;
    ELSE
      user_role := 'cliente'::app_role;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    user_role := 'cliente'::app_role;
  END;

  -- 2. Inserir Perfil (Profiles)
  BEGIN
    INSERT INTO public.profiles (user_id, name, email)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email
    )
    ON CONFLICT (user_id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao criar perfil para utilizador %: %', NEW.id, SQLERRM;
  END;

  -- 3. Inserir Papel (User Roles)
  BEGIN
    -- Tentamos inserir. Se houver conflito apenas no user_id, atualizamos o role.
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, user_role)
    ON CONFLICT (user_id) DO UPDATE SET role = EXCLUDED.role;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Erro ao atribuir papel para utilizador %: %', NEW.id, SQLERRM;
  END;

  -- 4. Tratamento específico para Clientes
  IF user_role = 'cliente' THEN
    BEGIN
      -- Extrair agent_id se presente
      IF NEW.raw_user_meta_data->>'agent_id' IS NOT NULL THEN
        BEGIN
          v_agent_id := (NEW.raw_user_meta_data->>'agent_id')::UUID;
        EXCEPTION WHEN OTHERS THEN
          v_agent_id := NULL;
        END;
      END IF;

      -- Verificar se já existe um cliente com este email ou telefone
      SELECT id INTO v_client_id 
      FROM public.clients 
      WHERE (email = NEW.email AND NEW.email IS NOT NULL) 
         OR (phone = NEW.raw_user_meta_data->>'phone' AND NEW.raw_user_meta_data->>'phone' IS NOT NULL)
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
    EXCEPTION WHEN OTHERS THEN
      RAISE WARNING 'Erro ao processar dados de cliente para utilizador %: %', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;
$$;
