-- Auto-create a clients record when a new user registers with role 'cliente'
-- This ensures clients appear in the Gestor admin panel

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role app_role;
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email);
  
  -- Determine role
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'cliente');
  
  -- Create role record
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, user_role);
  
  -- If the user is a cliente, also create a clients record so it shows in the admin panel
  IF user_role = 'cliente' THEN
    INSERT INTO public.clients (user_id, name, email, phone, status)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
      NEW.email,
      NEW.raw_user_meta_data->>'phone',
      'active'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Also create clients records for any existing 'cliente' users who don't have one yet
INSERT INTO public.clients (user_id, name, email, status)
SELECT p.user_id, p.name, p.email, 'active'
FROM public.profiles p
JOIN public.user_roles ur ON ur.user_id = p.user_id
WHERE ur.role = 'cliente'
  AND NOT EXISTS (SELECT 1 FROM public.clients c WHERE c.user_id = p.user_id);
