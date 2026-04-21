
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('gestor', 'agente', 'cliente');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles
  WHERE user_id = _user_id
  LIMIT 1
$$;

-- Profiles RLS
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Gestors can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Gestors can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'gestor') OR auth.uid() = user_id);

-- User roles RLS
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Gestors can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Gestors can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'gestor'));

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages" ON public.chat_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON public.chat_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can mark messages as read" ON public.chat_messages
  FOR UPDATE USING (auth.uid() = receiver_id)
  WITH CHECK (auth.uid() = receiver_id);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Clients table
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  id_number TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can manage all clients" ON public.clients
  FOR ALL USING (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Agents can view assigned clients" ON public.clients
  FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Clients can view own record" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

-- Loans table
CREATE TABLE public.loans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(12,2) NOT NULL,
  interest_rate NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(12,2) NOT NULL,
  remaining_amount NUMERIC(12,2) NOT NULL,
  installments INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can manage all loans" ON public.loans
  FOR ALL USING (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Agents can view assigned loans" ON public.loans
  FOR SELECT USING (agent_id = auth.uid());

CREATE POLICY "Clients can view own loans" ON public.loans
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.clients c
      WHERE c.id = client_id AND c.user_id = auth.uid()
    )
  );

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_id UUID REFERENCES public.loans(id) ON DELETE CASCADE NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT DEFAULT 'cash',
  received_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gestors can manage all payments" ON public.payments
  FOR ALL USING (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Agents can manage payments" ON public.payments
  FOR ALL USING (public.has_role(auth.uid(), 'agente'));

CREATE POLICY "Clients can view own payments" ON public.payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.loans l
      JOIN public.clients c ON c.id = l.client_id
      WHERE l.id = loan_id AND c.user_id = auth.uid()
    )
  );

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Gestors can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'gestor'));

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON public.loans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile and role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'cliente'));
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- Credit requests table
CREATE TABLE public.credit_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  client_address TEXT,
  amount NUMERIC(12,2) NOT NULL,
  purpose TEXT,
  term INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  review_message TEXT,
  agent_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.credit_requests ENABLE ROW LEVEL SECURITY;

-- Gestors can manage all credit requests
CREATE POLICY "Gestors can manage all credit_requests" ON public.credit_requests
  FOR ALL USING (public.has_role(auth.uid(), 'gestor'));

-- Agents can view credit requests assigned to them
CREATE POLICY "Agents can view assigned credit_requests" ON public.credit_requests
  FOR SELECT USING (agent_id = auth.uid());

-- Agents can insert credit requests
CREATE POLICY "Agents can insert credit_requests" ON public.credit_requests
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'agente'));

-- Users can view own credit requests
CREATE POLICY "Users can view own credit_requests" ON public.credit_requests
  FOR SELECT USING (user_id = auth.uid());

-- Anyone authenticated can insert credit requests (for public form)
CREATE POLICY "Authenticated users can insert credit_requests" ON public.credit_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Also allow agents to insert clients
CREATE POLICY "Agents can insert clients" ON public.clients
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'agente'));

-- Also allow agents to manage their assigned loans
CREATE POLICY "Agents can manage assigned loans" ON public.loans
  FOR ALL USING (agent_id = auth.uid());

-- Also allow agents to insert loans
CREATE POLICY "Agents can insert loans" ON public.loans
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'agente'));


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


-- Allow all authenticated users to read profiles and roles for chat contact discovery
-- Without this, agents and clients cannot see other users in the chat

-- Agents can view all profiles (needed for chat)
CREATE POLICY "Agents can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'agente'));

-- Clients can view profiles of gestors and agents (for chat)
CREATE POLICY "Clients can view gestor and agent profiles" ON public.profiles
  FOR SELECT USING (
    public.has_role(auth.uid(), 'cliente')
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = profiles.user_id
      AND ur.role IN ('gestor', 'agente')
    )
  );

-- Agents can view all roles (needed for chat contact filtering)
CREATE POLICY "Agents can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'agente'));

-- Clients can view roles (needed for chat contact filtering)
CREATE POLICY "Clients can view all roles" ON public.user_roles
  FOR SELECT USING (public.has_role(auth.uid(), 'cliente'));


-- FIX: The previous policies on user_roles used has_role() which queries user_roles itself,
-- creating an infinite recursive loop. Replace with direct auth.uid() checks.

-- Drop the problematic recursive policies
DROP POLICY IF EXISTS "Agents can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Clients can view all roles" ON public.user_roles;

-- Recreate without has_role() to avoid recursion
-- All authenticated users can read roles (needed for chat contact filtering)
CREATE POLICY "Authenticated users can view all roles" ON public.user_roles
  FOR SELECT USING (auth.uid() IS NOT NULL);


-- Add file attachment support to chat_messages
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS file_type TEXT;
ALTER TABLE public.chat_messages ADD COLUMN IF NOT EXISTS file_name TEXT;

-- Make content nullable (messages can be file-only)
ALTER TABLE public.chat_messages ALTER COLUMN content DROP NOT NULL;

-- Create storage bucket for chat files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'chat-files',
  'chat-files',
  true,
  5242880, -- 5MB max
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat files
CREATE POLICY "Authenticated users can upload chat files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view chat files"
ON storage.objects FOR SELECT
USING (bucket_id = 'chat-files');


-- Add avatar_url to profiles for chat profile photos
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;


-- Contracts table to track signed contracts
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  credit_request_id UUID REFERENCES public.credit_requests(id) ON DELETE CASCADE,
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  client_name TEXT NOT NULL,
  signature_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, signed, completed
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- Clients can view their own contracts
CREATE POLICY "Clients can view own contracts" ON public.contracts
  FOR SELECT USING (auth.uid() = client_id);

-- Clients can update own contracts (signature)
CREATE POLICY "Clients can sign own contracts" ON public.contracts
  FOR UPDATE USING (auth.uid() = client_id);

-- Gestors can do everything
CREATE POLICY "Gestors can manage contracts" ON public.contracts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'gestor')
  );

-- Agents can view contracts
CREATE POLICY "Agents can view contracts" ON public.contracts
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'agente')
  );

-- Gestors can insert contracts
CREATE POLICY "Gestors can insert contracts" ON public.contracts
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'gestor')
  );

-- Clients can insert contracts (when self-signing after approval)
CREATE POLICY "Clients can create own contracts" ON public.contracts
  FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Storage bucket for signatures
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('signatures', 'signatures', true, 2097152)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload signatures"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'signatures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Anyone can view signatures"
ON storage.objects FOR SELECT USING (bucket_id = 'signatures');


-- Add all form fields as dedicated columns to credit_requests
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS birth_date TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS document_type TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS document_number TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS document_issue_date TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS document_expiry_date TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS nuit TEXT;

-- Address
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS neighborhood TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS province TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS residence_type TEXT;

-- Professional
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS company_name TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS work_duration TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS monthly_income TEXT;

-- Credit details
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS credit_purpose TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS receive_date TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS guarantee_type TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS guarantee_mode TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS observations TEXT;

-- Document images
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS doc_front_url TEXT;
ALTER TABLE public.credit_requests ADD COLUMN IF NOT EXISTS doc_back_url TEXT;


-- Migration to add specific contract file URL
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS contract_url TEXT;

-- Bucket for Contracts
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('contracts', 'contracts', true, 5242880)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Gestors can upload contracts"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'contracts' AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'gestor')
);

CREATE POLICY "Anyone can view contracts"
ON storage.objects FOR SELECT USING (bucket_id = 'contracts');


-- Add new columns to existing notifications table
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS link_url TEXT,
ADD COLUMN IF NOT EXISTS push_delivered BOOLEAN DEFAULT false;

-- Create automation rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    event_trigger TEXT NOT NULL,
    message_template TEXT NOT NULL,
    channels TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for Web Push Subscriptions
CREATE TABLE IF NOT EXISTS public.user_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, endpoint)
);

-- Enable RLS
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;

-- [FIXED] automation_rules policy moved to later block (uses user_roles instead of profiles.role)

-- Policies for user_push_subscriptions (Users can manage their own)
CREATE POLICY "Users can manage their own push subscriptions"
    ON public.user_push_subscriptions
    FOR ALL
    USING (auth.uid() = user_id);

-- Insert some default automation rules based on the user's mockup
INSERT INTO public.automation_rules (name, event_trigger, message_template, channels, active)
VALUES 
('Aprovação de Empréstimo', 'loan_approved', 'Parabéns! O seu empréstimo de {amount} foi aprovado. O dinheiro estará disponível em sua conta em breve.', ARRAY['SMS', 'PUSH'], true),
('Lembrete 5 dias', 'payment_due_5_days', 'Lembrete: O seu pagamento de {amount} vence em 5 dias ({due_date}). Evite multas pagando em dia.', ARRAY['SMS', 'PUSH'], true),
('Lembrete 1 dia', 'payment_due_1_day', 'URGENTE: O seu pagamento de {amount} vence AMANHÃ ({due_date}). Pague hoje e evite juros de mora.', ARRAY['SMS', 'PUSH'], true),
('Pagamento Vencido', 'payment_overdue', 'O seu pagamento de {amount} está VENCIDO desde {due_date}. Por favor regularize a situação o mais breve possível.', ARRAY['SMS', 'PUSH'], true);


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


-- Create avatars bucket
insert into storage.buckets (id, name, public) 
values ('avatars', 'avatars', true) 
ON CONFLICT (id) DO NOTHING;

-- Set up security policies for the avatars bucket
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

create policy "Users can update their own avatar."
  on storage.objects for update
  using ( auth.uid() = owner )
  with check ( bucket_id = 'avatars' );


-- Create system_settings table (single-row config)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name text DEFAULT 'BOCHEL MICROCREDITO',
  email text DEFAULT 'admin@bochel.mz',
  phone text DEFAULT '',
  default_interest_rate numeric DEFAULT 30,
  max_loan_amount numeric DEFAULT 100000,
  min_loan_amount numeric DEFAULT 5000,
  loan_duration_days integer DEFAULT 30,
  email_notifications boolean DEFAULT true,
  sms_notifications boolean DEFAULT true,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert the single config row
INSERT INTO public.system_settings (id) VALUES (gen_random_uuid());

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Gestor can read and update
CREATE POLICY "Gestor full access to settings"
  ON public.system_settings FOR ALL
  USING (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'gestor'))
  WITH CHECK (auth.uid() IN (SELECT user_id FROM public.user_roles WHERE role = 'gestor'));

-- All authenticated users can read settings
CREATE POLICY "Authenticated read settings"
  ON public.system_settings FOR SELECT
  USING (auth.role() = 'authenticated');


-- Add NUIT and address to system_settings for invoice/receipt documents
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS nuit TEXT DEFAULT '';
ALTER TABLE public.system_settings ADD COLUMN IF NOT EXISTS address TEXT DEFAULT 'Maputo, Moçambique';


-- IMPROVED: Function to handle bulk client deletion with deep sweep
-- This ensures ALL traces of a client are removed by sweeping by ID, Email, and Phone.

CREATE OR REPLACE FUNCTION delete_clients_bulk(client_ids UUID[])
RETURNS VOID AS $$
DECLARE
    client_user_ids UUID[];
    client_emails TEXT[];
    client_phones TEXT[];
    loan_ids UUID[];
    request_ids UUID[];
BEGIN
    -- 0. Collect all relevant identifiers for a thorough sweep
    SELECT array_agg(user_id) FILTER (WHERE user_id IS NOT NULL) INTO client_user_ids FROM public.clients WHERE id = ANY(client_ids);
    SELECT array_agg(email) FILTER (WHERE email IS NOT NULL) INTO client_emails FROM public.clients WHERE id = ANY(client_ids);
    SELECT array_agg(phone) FILTER (WHERE phone IS NOT NULL) INTO client_phones FROM public.clients WHERE id = ANY(client_ids);
    
    SELECT array_agg(id) INTO loan_ids FROM public.loans WHERE client_id = ANY(client_ids);
    SELECT array_agg(id) INTO request_ids FROM public.credit_requests 
    WHERE id IN (SELECT credit_request_id FROM public.contracts WHERE client_id = ANY(client_ids))
       OR user_id = ANY(client_user_ids)
       OR client_email = ANY(client_emails)
       OR client_phone = ANY(client_phones);

    -- 1. Delete Payments
    IF loan_ids IS NOT NULL THEN
        DELETE FROM public.payments WHERE loan_id = ANY(loan_ids);
        
        -- Delete Wallet Ledger entries related to these loans or payments
        DELETE FROM public.wallet_ledger WHERE reference_id = ANY(loan_ids);
    END IF;

    -- 2. Delete Loans
    DELETE FROM public.loans WHERE client_id = ANY(client_ids);

    -- 3. Delete Contracts (Fixed logic: map to client_id or request_id)
    DELETE FROM public.contracts 
    WHERE client_id = ANY(client_ids) 
       OR credit_request_id = ANY(request_ids);

    -- 4. Delete Chat Messages (by user_id)
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.chat_messages 
        WHERE sender_id = ANY(client_user_ids) OR receiver_id = ANY(client_user_ids);
    END IF;

    -- 5. Delete Notifications (by user_id)
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.notifications 
        WHERE user_id = ANY(client_user_ids) OR from_user_id = ANY(client_user_ids);
    END IF;

    -- 6. Delete Credit Requests (Enhanced sweep)
    DELETE FROM public.credit_requests 
    WHERE id = ANY(request_ids)
       OR user_id = ANY(client_user_ids)
       OR client_email = ANY(client_emails)
       OR client_phone = ANY(client_phones);

    -- 7. Delete Profiles
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.profiles WHERE user_id = ANY(client_user_ids);
    END IF;

    -- 8. Delete User Roles
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM public.user_roles WHERE user_id = ANY(client_user_ids);
    END IF;

    -- 9. Delete Clients (sweep by ID and email/phone to catch duplicates)
    DELETE FROM public.clients 
    WHERE id = ANY(client_ids)
       OR email = ANY(client_emails)
       OR phone = ANY(client_phones);

    -- 10. Finally Delete Auth Users (using service_role privileges via SECURITY DEFINER)
    IF client_user_ids IS NOT NULL THEN
        DELETE FROM auth.users WHERE id = ANY(client_user_ids);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Allow users to insert notifications if they are the sender
-- This is necessary for clients notifying admins about signed contracts, etc.

CREATE POLICY "Users can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (from_user_id = auth.uid());

-- Allow users to see their own notifications (already exists likely, but just in case)
-- DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
-- CREATE POLICY "Users can view own notifications" ON public.notifications
--   FOR SELECT USING (user_id = auth.uid());


-- Allow public (anonymous) users to upload to the chat-files bucket
-- This is necessary for the credit application form when used in public mode
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Public users can upload chat files'
    ) THEN
        CREATE POLICY "Public users can upload chat files"
        ON storage.objects FOR INSERT
        WITH CHECK (bucket_id = 'chat-files');
    END IF;
END
$$;

-- Ensure anyone can view (already existed but confirming)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'objects' 
        AND schemaname = 'storage' 
        AND policyname = 'Anyone can view chat files'
    ) THEN
        CREATE POLICY "Anyone can view chat files"
        ON storage.objects FOR SELECT
        USING (bucket_id = 'chat-files');
    END IF;
END
$$;


-- Fix 403 error on notifications: 
-- Allow users to "see" notifications where they are the sender (from_user_id)
-- This is necessary during insert() which implicitly performs a select() to return the new row.
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = from_user_id);

-- Ensure users can insert if they are the sender (should already exist but confirm)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND schemaname = 'public' 
        AND policyname = 'Users can insert notifications'
    ) THEN
        CREATE POLICY "Users can insert notifications" ON public.notifications
          FOR INSERT WITH CHECK (from_user_id = auth.uid());
    END IF;
END
$$;

-- Allow all authenticated users to read user roles for 'gestor'
-- This is needed for clients to find who to notify when a contract is signed.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'user_roles' 
        AND schemaname = 'public' 
        AND policyname = 'Authenticated users can see gestors'
    ) THEN
        CREATE POLICY "Authenticated users can see gestors" ON public.user_roles
          FOR SELECT USING (role = 'gestor' AND auth.role() = 'authenticated');
    END IF;
END
$$;


-- Migration to add needs_resignature column to contracts table
ALTER TABLE public.contracts 
ADD COLUMN IF NOT EXISTS needs_resignature BOOLEAN NOT NULL DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.contracts.needs_resignature IS 'Flag set by admin to request a new signature from the client if the previous one was invalid.';


-- Adds guarantee_photos array column to credit_requests
ALTER TABLE public.credit_requests 
ADD COLUMN IF NOT EXISTS guarantee_photos TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.credit_requests.guarantee_photos IS 'Array of URLs point to images of the guarantee item';


-- Migration: Admin Wallet Ledger System
-- Description: Adds company_wallet and transactional ledger with atomic RPCs.

-- 1. Create company_wallet (Single row table)
CREATE TABLE IF NOT EXISTS public.company_wallet (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001', -- Fixed ID for single row
    balance NUMERIC NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT single_row_check CHECK (id = '00000000-0000-0000-0000-000000000001')
);

-- Initialize wallet if not exists
INSERT INTO public.company_wallet (id, balance)
VALUES ('00000000-0000-0000-0000-000000000001', 0)
ON CONFLICT (id) DO NOTHING;

-- 2. Create wallet_ledger (History)
CREATE TABLE IF NOT EXISTS public.wallet_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    amount NUMERIC NOT NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('injection', 'disbursement', 'repayment')),
    reference_id UUID, -- Can link to credit_request_id or payment_id
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    user_id UUID REFERENCES auth.users(id) -- Who performed the action
);

-- 3. RLS Policies
ALTER TABLE public.company_wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_ledger ENABLE ROW LEVEL SECURITY;

-- Only Gestores can see or manage the wallet
CREATE POLICY "Gestores can view company wallet" ON public.company_wallet
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'gestor'));

CREATE POLICY "Gestores can view ledger" ON public.wallet_ledger
    FOR SELECT TO authenticated
    USING (public.has_role(auth.uid(), 'gestor'));

-- 4. RPC Functions (Atomic Transactions)

-- Function: Inject Funds
CREATE OR REPLACE FUNCTION public.inject_wallet_funds(
    p_amount NUMERIC,
    p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_balance NUMERIC;
BEGIN
    -- Check permissions
    IF NOT public.has_role(auth.uid(), 'gestor') THEN
        RAISE EXCEPTION 'Acesso negado. Apenas gestores podem injetar saldo.';
    END IF;

    -- Update balance
    UPDATE public.company_wallet
    SET balance = balance + p_amount,
        updated_at = now()
    WHERE id = '00000000-0000-0000-0000-000000000001'
    RETURNING balance INTO v_new_balance;

    -- Log transaction
    INSERT INTO public.wallet_ledger (amount, transaction_type, description, user_id)
    VALUES (p_amount, 'injection', p_description, auth.uid());

    RETURN jsonb_build_object('success', true, 'new_balance', v_new_balance);
END;
$$;

-- Function: Disburse Loan (Atomic)
CREATE OR REPLACE FUNCTION public.disburse_loan_with_wallet(
    p_request_id UUID,
    p_user_id UUID, -- Client user_id
    p_client_id UUID,
    p_amount NUMERIC,
    p_interest_rate NUMERIC,
    p_installments INT,
    p_total_amount NUMERIC,
    p_agent_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_current_balance NUMERIC;
BEGIN
    -- Check permissions
    IF NOT public.has_role(auth.uid(), 'gestor') THEN
        RAISE EXCEPTION 'Acesso negado.';
    END IF;

    -- Check balance
    SELECT balance INTO v_current_balance FROM public.company_wallet WHERE id = '00000000-0000-0000-0000-000000000001' FOR UPDATE;
    
    IF v_current_balance < p_amount THEN
        RAISE EXCEPTION 'Saldo insuficiente na carteira da empresa (Disponível: MZN %)', v_current_balance;
    END IF;

    -- 1. Create Loan
    INSERT INTO public.loans (
        client_id, agent_id, amount, interest_rate, installments, 
        total_amount, remaining_amount, status, start_date, end_date
    ) VALUES (
        p_client_id, p_agent_id, p_amount, p_interest_rate, p_installments,
        p_total_amount, p_total_amount, 'active', p_start_date, p_end_date
    );

    -- 2. Update Credit Request
    UPDATE public.credit_requests SET status = 'completed' WHERE id = p_request_id;

    -- 3. Update Wallet Balance
    UPDATE public.company_wallet SET balance = balance - p_amount, updated_at = now() WHERE id = '00000000-0000-0000-0000-000000000001';

    -- 4. Log Transaction
    INSERT INTO public.wallet_ledger (amount, transaction_type, reference_id, description, user_id)
    VALUES (p_amount, 'disbursement', p_request_id, 'Desembolso de empréstimo', auth.uid());

    RETURN jsonb_build_object('success', true);
END;
$$;

-- Function: Receive Payment (Atomic)
CREATE OR REPLACE FUNCTION public.receive_payment_with_wallet(
    p_loan_id UUID,
    p_amount NUMERIC,
    p_payment_method TEXT,
    p_payment_date DATE,
    p_notes TEXT,
    p_received_by UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_remaining NUMERIC;
    v_new_status TEXT := 'active';
BEGIN
    -- 1. Insert Payment
    INSERT INTO public.payments (loan_id, amount, payment_date, payment_method, notes, received_by)
    VALUES (p_loan_id, p_amount, p_payment_date, p_payment_method, p_notes, p_received_by);

    -- 2. Update Loan Balance
    SELECT remaining_amount - p_amount INTO v_remaining FROM public.loans WHERE id = p_loan_id FOR UPDATE;
    
    IF v_remaining <= 0 THEN
        v_remaining := 0;
        v_new_status := 'paid';
    END IF;

    UPDATE public.loans 
    SET remaining_amount = v_remaining, 
        status = v_new_status, 
        updated_at = now() 
    WHERE id = p_loan_id;

    -- 3. Update Wallet Balance (Increments with full payment amount - principal + interest)
    UPDATE public.company_wallet 
    SET balance = balance + p_amount, 
        updated_at = now() 
    WHERE id = '00000000-0000-0000-0000-000000000001';

    -- 4. Log Transaction
    INSERT INTO public.wallet_ledger (amount, transaction_type, reference_id, description, user_id)
    VALUES (p_amount, 'repayment', p_loan_id, 'Recebimento de prestação', p_received_by);

    RETURN jsonb_build_object('success', true, 'remaining_amount', v_remaining, 'status', v_new_status);
END;
$$;


-- ============================================================
-- FIX: Notification System - 3 Critical Bugs
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- ============================================================
-- FIX #1: Create the missing RPC function get_gestors_for_notification
-- Called by notifyEvent.ts but never existed in the database
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_gestors_for_notification()
RETURNS TABLE(user_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ur.user_id
  FROM public.user_roles ur
  WHERE ur.role = 'gestor';
$$;

-- ============================================================
-- FIX #2: Fix RLS INSERT policy on notifications table
-- Old policy only allowed gestors to insert → blocked clients/agents
-- New policy: any authenticated user can insert (app controls the target)
-- ============================================================
DROP POLICY IF EXISTS "Gestors can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;

CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================
-- FIX #3: Fix automation_rules RLS policy
-- Old policy used profiles.role which does not exist
-- New policy uses user_roles table (correct location of role data)
-- ============================================================
DROP POLICY IF EXISTS "Gestores can manage automation rules" ON public.automation_rules;

CREATE POLICY "Gestores can manage automation rules"
  ON public.automation_rules
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'gestor'
    )
  );


-- ============================================================
-- COMPLETE NOTIFICATION SYSTEM FIX
-- Run this entire file in the Supabase SQL Editor
-- All missing tables, RPCs, and policies in one script
-- ============================================================


-- ============================================================
-- BLOCK 1: Tables that may not exist in production
-- automation_rules and user_push_subscriptions
-- ============================================================

-- Automation Rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    event_trigger TEXT NOT NULL,
    message_template TEXT NOT NULL,
    channels TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Web Push Subscriptions table
CREATE TABLE IF NOT EXISTS public.user_push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    endpoint TEXT NOT NULL,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, endpoint)
);

-- Enable RLS on both tables
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_push_subscriptions ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- BLOCK 2: RLS Policies (safe to re-run — uses DROP IF EXISTS)
-- ============================================================

-- automation_rules: fixed to use user_roles (correct table for roles)
DROP POLICY IF EXISTS "Gestores can manage automation rules" ON public.automation_rules;
CREATE POLICY "Gestores can manage automation rules"
    ON public.automation_rules
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'gestor'
        )
    );

-- user_push_subscriptions: users manage their own subscriptions
DROP POLICY IF EXISTS "Users can manage their own push subscriptions" ON public.user_push_subscriptions;
CREATE POLICY "Users can manage their own push subscriptions"
    ON public.user_push_subscriptions
    FOR ALL
    USING (auth.uid() = user_id);

-- notifications INSERT: allow any authenticated user (already applied, safe to re-run)
DROP POLICY IF EXISTS "Gestors can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated users can insert notifications"
    ON public.notifications
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);


-- ============================================================
-- BLOCK 3: Missing RPC Functions
-- ============================================================

-- get_gestors_for_notification (called by notifyEvent.ts — was missing)
CREATE OR REPLACE FUNCTION public.get_gestors_for_notification()
RETURNS TABLE(user_id UUID)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT ur.user_id
    FROM public.user_roles ur
    WHERE ur.role = 'gestor';
$$;

GRANT EXECUTE ON FUNCTION public.get_gestors_for_notification() TO authenticated;

-- check_daily_payments: rewritten to actually INSERT notifications directly
-- (previous version had PERFORM http_post commented out — never worked)
CREATE OR REPLACE FUNCTION public.check_daily_payments()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    loan_record RECORD;
    v_client_user_id UUID;
BEGIN
    -- 1. Payments due in 5 days
    FOR loan_record IN
        SELECT l.id, l.client_id, l.amount, l.end_date, c.name AS client_name, c.user_id AS client_user_id
        FROM public.loans l
        JOIN public.clients c ON c.id = l.client_id
        WHERE l.status = 'active'
          AND l.end_date = CURRENT_DATE + INTERVAL '5 days'
    LOOP
        IF loan_record.client_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, type, title, body, link_url)
            VALUES (
                loan_record.client_user_id,
                'system',
                '⏰ Lembrete de Pagamento',
                'O seu pagamento de MZN ' || loan_record.amount || ' vence em 5 dias (' || loan_record.end_date || '). Pague em dia para evitar juros.',
                '/meus-creditos'
            );
        END IF;
    END LOOP;

    -- 2. Payments due tomorrow
    FOR loan_record IN
        SELECT l.id, l.client_id, l.amount, l.end_date, c.name AS client_name, c.user_id AS client_user_id
        FROM public.loans l
        JOIN public.clients c ON c.id = l.client_id
        WHERE l.status = 'active'
          AND l.end_date = CURRENT_DATE + INTERVAL '1 day'
    LOOP
        IF loan_record.client_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, type, title, body, link_url)
            VALUES (
                loan_record.client_user_id,
                'alert',
                '🚨 Pagamento Vence Amanhã!',
                'URGENTE: O seu pagamento de MZN ' || loan_record.amount || ' vence AMANHÃ (' || loan_record.end_date || '). Pague hoje para evitar juros de mora.',
                '/meus-creditos'
            );
        END IF;
    END LOOP;

    -- 3. Overdue payments
    FOR loan_record IN
        SELECT l.id, l.client_id, l.amount, l.end_date, c.name AS client_name, c.user_id AS client_user_id
        FROM public.loans l
        JOIN public.clients c ON c.id = l.client_id
        WHERE l.status = 'active'
          AND l.end_date < CURRENT_DATE
    LOOP
        IF loan_record.client_user_id IS NOT NULL THEN
            INSERT INTO public.notifications (user_id, type, title, body, link_url)
            VALUES (
                loan_record.client_user_id,
                'alert',
                '❌ Pagamento em Atraso',
                'O seu pagamento de MZN ' || loan_record.amount || ' está VENCIDO desde ' || loan_record.end_date || '. Regularize urgentemente.',
                '/meus-creditos'
            );
        END IF;
    END LOOP;
END;
$$;


-- ============================================================
-- BLOCK 4: Enable Realtime on notifications table
-- Required for useNotifications hook to receive live updates
-- ============================================================
DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION
        WHEN duplicate_object THEN NULL; -- Already added, skip
    END;
END;
$$;


-- ============================================================
-- BLOCK 5: Seed default automation rules (if table was just created)
-- ============================================================
INSERT INTO public.automation_rules (name, event_trigger, message_template, channels, active)
VALUES
    ('Aprovação de Empréstimo', 'loan_approved', 'Parabéns! O seu empréstimo de {amount} MZN foi aprovado.', ARRAY['PUSH'], true),
    ('Lembrete 5 dias', 'payment_due_5_days', 'O seu pagamento de {amount} MZN vence em 5 dias ({due_date}).', ARRAY['PUSH'], true),
    ('Lembrete 1 dia', 'payment_due_1_day', 'URGENTE: O seu pagamento de {amount} MZN vence AMANHÃ ({due_date}).', ARRAY['PUSH'], true),
    ('Pagamento Vencido', 'payment_overdue', 'O seu pagamento de {amount} MZN está VENCIDO desde {due_date}.', ARRAY['PUSH'], true)
ON CONFLICT DO NOTHING;


-- ==========================================
-- FIX REALTIME NOTIFICATIONS
-- Run this in the Supabase SQL Editor
-- ==========================================

-- 1. Enable REPLICA IDENTITY FULL
-- This is crucial for Supabase Realtime to track changes and filters correctly
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- 2. Ensure the table is in the realtime publication
DO $$
BEGIN
    -- Try to add the table to the publication
    -- If it already exists, it will catch the duplicate_object exception
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION
        WHEN duplicate_object THEN 
            RAISE NOTICE 'Table notifications is already in the publication.';
        WHEN OTHERS THEN
            RAISE NOTICE 'Error adding table to publication: %', SQLERRM;
    END;
END;
$$;

-- 3. Verify Publication (Optional check)
-- SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications';


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


-- 1. Fix Profiles table (Add missing avatar_url)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 2. Automation: Credit Request Lifecycle Notifications
CREATE OR REPLACE FUNCTION public.notify_credit_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- [A] Initial Request (Pending)
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.notifications (user_id, title, body, type, link_url)
        VALUES (
            NEW.user_id,
            'Pedido Recebido! ✅',
            'O seu pedido de crédito foi enviado com sucesso. Regressaremos com uma resposta em breve. Por favor, aguarde.',
            'system',
            '/pedidos'
        );
    END IF;

    -- [B] Status Changed to Approved
    IF (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'approved') THEN
        INSERT INTO public.notifications (user_id, title, body, type, link_url)
        VALUES (
            NEW.user_id,
            'Pedido Aprovado! 🚀',
            'Boas notícias! O seu crédito foi aprovado. O próximo passo é assinar o contrato digital para receber o valor.',
            'system',
            '/contratos'
        );
    END IF;

    -- [C] Status Changed to Rejected
    IF (TG_OP = 'UPDATE' AND OLD.status = 'pending' AND NEW.status = 'rejected') THEN
        INSERT INTO public.notifications (user_id, title, body, type, link_url)
        VALUES (
            NEW.user_id,
            'Atualização do Pedido ℹ️',
            'Infelizmente o seu pedido não foi aprovado desta vez. Pode consultar os detalhes na seção de histórico.',
            'system',
            '/historico'
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_credit_lifecycle ON public.credit_requests;
CREATE TRIGGER tr_notify_credit_lifecycle
AFTER INSERT OR UPDATE ON public.credit_requests
FOR EACH ROW
EXECUTE FUNCTION public.notify_credit_lifecycle();


-- 3. Automation: Contract and Balance Notifications
CREATE OR REPLACE FUNCTION public.notify_contract_and_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Get user_id from client record
    SELECT user_id INTO v_user_id FROM public.clients WHERE id = NEW.client_id;

    -- [D] Balance Injected (Loan starts)
    IF (TG_OP = 'INSERT' AND NEW.status = 'active') THEN
        INSERT INTO public.notifications (user_id, title, body, type, link_url)
        VALUES (
            v_user_id,
            'Saldo Disponível! 💰',
            'O valor do seu empréstimo já foi injetado. Lembre-se: pague até a data limite para evitar a taxa de 1,5% ao dia.',
            'system',
            '/'
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_notify_contract_and_balance ON public.loans;
CREATE TRIGGER tr_notify_contract_and_balance
AFTER INSERT ON public.loans
FOR EACH ROW
EXECUTE FUNCTION public.notify_contract_and_balance();


-- Migration: Support for tiered credit options and installments
-- Date: 2026-03-14

-- 1. Update credit_requests table
ALTER TABLE public.credit_requests 
ADD COLUMN IF NOT EXISTS credit_option TEXT, -- 'A', 'B', 'C'
ADD COLUMN IF NOT EXISTS is_installment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS installment_months INTEGER,
ADD COLUMN IF NOT EXISTS amortization_plan JSONB,
ADD COLUMN IF NOT EXISTS interest_rate_at_request NUMERIC(5,2);

-- 2. Update loans table to reflect active plans
ALTER TABLE public.loans
ADD COLUMN IF NOT EXISTS credit_option TEXT,
ADD COLUMN IF NOT EXISTS is_installment BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS total_installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS remaining_installments INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS next_installment_date DATE,
ADD COLUMN IF NOT EXISTS next_capitalization_date DATE, -- For Option B jump or recapitalization
ADD COLUMN IF NOT EXISTS original_principal NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS amortization_plan JSONB;

-- 3. Update payments table
ALTER TABLE public.payments
ADD COLUMN IF NOT EXISTS installment_number INTEGER;

-- Comment on columns for clarity
COMMENT ON COLUMN public.credit_requests.credit_option IS 'A (500-4k, 30%), B (5k-100k, 20/30%), C (5k-100k, 30%)';
COMMENT ON COLUMN public.credit_requests.amortization_plan IS 'Array of installments [ { "date": "...", "amount": "...", "principal": "...", "interest": "..." } ]';


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


-- Migration: Early Liquidation / Discount Fix
-- Description: Updates the payment RPC to handle interest waivers (liquidation).
-- Date: 2026-03-23

CREATE OR REPLACE FUNCTION public.receive_payment_with_wallet(
    p_loan_id UUID,
    p_amount NUMERIC,
    p_payment_method TEXT,
    p_payment_date DATE,
    p_notes TEXT,
    p_received_by UUID,
    p_installment_number INTEGER DEFAULT NULL,
    p_is_liquidation BOOLEAN DEFAULT FALSE
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
    -- 1. Insert Payment Record
    INSERT INTO public.payments (loan_id, amount, payment_date, payment_method, notes, received_by, installment_number)
    VALUES (p_loan_id, p_amount, p_payment_date, p_payment_method, p_notes, p_received_by, p_installment_number);

    -- 2. Update Loan Balance and Status
    SELECT remaining_amount, total_amount INTO v_remaining, v_total_amount 
    FROM public.loans WHERE id = p_loan_id FOR UPDATE;
    
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
        'status', v_new_status
    );
END;
$$;


-- 1. Definição Robusta da Função de Vínculo de Agente
CREATE OR REPLACE FUNCTION public.link_agent_to_client(
    p_client_email TEXT,
    p_client_phone TEXT DEFAULT NULL,
    p_client_id_number TEXT DEFAULT NULL,
    p_client_address TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_agent_id UUID;
    v_client_id UUID;
BEGIN
    -- Obter o ID do agente (quem está chamando a função)
    v_agent_id := auth.uid();
    
    IF v_agent_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Não autorizado: ID do agente não encontrado');
    END IF;

    -- Tentar encontrar o cliente pelo email ou telefone
    SELECT id INTO v_client_id 
    FROM public.clients 
    WHERE (email = p_client_email AND email IS NOT NULL)
       OR (phone = p_client_phone AND phone IS NOT NULL)
    LIMIT 1;

    IF v_client_id IS NOT NULL THEN
        -- Vincular o cliente ao agente e atualizar dados extras
        UPDATE public.clients
        SET 
            agent_id = v_agent_id,
            phone = COALESCE(p_client_phone, phone),
            id_number = COALESCE(p_client_id_number, id_number),
            address = COALESCE(p_client_address, address),
            updated_at = now()
        WHERE id = v_client_id;

        -- REPARAÇÃO: Se houver pedidos de crédito deste cliente SEM agente, vincular agora
        UPDATE public.credit_requests
        SET agent_id = v_agent_id
        WHERE (client_email = p_client_email OR client_phone = p_client_phone)
          AND (agent_id IS NULL);

        -- REPARAÇÃO: Se houver empréstimos deste cliente SEM agente, vincular agora
        -- Nota: a tabela loans usa client_id
        UPDATE public.loans
        SET agent_id = v_agent_id
        WHERE client_id = v_client_id
          AND (agent_id IS NULL);

        RETURN jsonb_build_object('success', true, 'client_id', v_client_id);
    ELSE
        RETURN jsonb_build_object('success', false, 'error', 'Cliente não encontrado para o email/telefone fornecido');
    END IF;
END;
$$;

-- [REMOVED] Data-specific fix not needed for fresh database


-- ============================================================
-- RPC: delete_agents_bulk
-- Safely deletes agent accounts while preserving client data.
-- Agent references on clients/loans are automatically SET NULL
-- by the existing foreign key constraints.
-- ============================================================

CREATE OR REPLACE FUNCTION public.delete_agents_bulk(agent_user_ids UUID[])
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_deleted INT := 0;
  v_skipped INT := 0;
  v_verified UUID[];
BEGIN
  -- Safety: only gestors can call this
  IF NOT public.has_role(auth.uid(), 'gestor'::app_role) THEN
    RAISE EXCEPTION 'Permissão negada. Apenas gestores podem eliminar agentes.';
  END IF;

  -- Validate input
  IF agent_user_ids IS NULL OR array_length(agent_user_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'Lista de agentes vazia.';
  END IF;

  -- Only delete confirmed agents (verify they have role 'agente')
  SELECT array_agg(ur.user_id) INTO v_verified
  FROM public.user_roles ur
  WHERE ur.user_id = ANY(agent_user_ids)
    AND ur.role = 'agente'::app_role;

  IF v_verified IS NULL OR array_length(v_verified, 1) IS NULL THEN
    RAISE EXCEPTION 'Nenhum agente válido encontrado na lista fornecida.';
  END IF;

  -- Delete each verified agent from auth.users
  -- The foreign key cascades handle everything:
  --   profiles, user_roles, notifications, chat_messages → ON DELETE CASCADE
  --   clients.agent_id, loans.agent_id, credit_requests.agent_id → ON DELETE SET NULL
  --   agent_goals → ON DELETE CASCADE
  FOREACH v_id IN ARRAY v_verified LOOP
    BEGIN
      DELETE FROM auth.users WHERE id = v_id;
      v_deleted := v_deleted + 1;
    EXCEPTION WHEN OTHERS THEN
      v_skipped := v_skipped + 1;
      RAISE WARNING 'Falha ao eliminar agente %: %', v_id, SQLERRM;
    END;
  END LOOP;

  RETURN jsonb_build_object(
    'deleted', v_deleted,
    'skipped', v_skipped,
    'total', array_length(agent_user_ids, 1)
  );
END;
$$;

-- Grant execute to authenticated users (RLS inside the function handles authorization)
GRANT EXECUTE ON FUNCTION public.delete_agents_bulk(UUID[]) TO authenticated;


-- ==========================================
-- UNIVERSAL CLEANUP MIGRATION (V2)
-- Run this in your Supabase SQL Editor
-- ==========================================

-- 1. Function to list all auth users (to find orphans)
CREATE OR REPLACE FUNCTION list_all_auth_users()
RETURNS TABLE (
    user_id UUID,
    email TEXT,
    created_at TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    role_meta TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        id as user_id, 
        u.email::TEXT, 
        u.created_at, 
        u.last_sign_in_at as last_login,
        u.raw_user_meta_data->>'role' as role_meta
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$;

-- 2. Advanced deep deletion function targeting auth.users.id directly
CREATE OR REPLACE FUNCTION delete_users_bulk(user_ids UUID[])
RETURNS VOID AS $$
DECLARE
    client_ids UUID[];
    client_emails TEXT[];
    client_phones TEXT[];
    loan_ids UUID[];
    request_ids UUID[];
BEGIN
    -- Collect all associated client IDs, emails, and phones based on the user_ids
    SELECT array_agg(id), array_agg(email) FILTER (WHERE email IS NOT NULL), array_agg(phone) FILTER (WHERE phone IS NOT NULL)
    INTO client_ids, client_emails, client_phones
    FROM public.clients 
    WHERE user_id = ANY(user_ids);

    -- Collect ALL emails from profiles as well
    SELECT array_agg(email) FILTER (WHERE email IS NOT NULL)
    INTO client_emails
    FROM (
        SELECT unnest(client_emails) as email
        UNION
        SELECT email FROM public.profiles WHERE id = ANY(user_ids) AND email IS NOT NULL
    ) as merged_emails;

    -- Collect related loan and request IDs
    IF client_ids IS NOT NULL THEN
        SELECT array_agg(id) INTO loan_ids FROM public.loans WHERE client_id = ANY(client_ids);
    END IF;

    SELECT array_agg(id) INTO request_ids FROM public.credit_requests 
    WHERE user_id = ANY(user_ids)
       OR (client_ids IS NOT NULL AND id IN (SELECT credit_request_id FROM public.contracts WHERE client_id = ANY(client_ids)))
       OR (client_emails IS NOT NULL AND client_email = ANY(client_emails))
       OR (client_phones IS NOT NULL AND client_phone = ANY(client_phones));

    -- CASCADE DELETES
    IF loan_ids IS NOT NULL THEN
        DELETE FROM public.payments WHERE loan_id = ANY(loan_ids);
        DELETE FROM public.wallet_ledger WHERE reference_id = ANY(loan_ids);
    END IF;

    IF client_ids IS NOT NULL THEN
        DELETE FROM public.loans WHERE client_id = ANY(client_ids);
    END IF;

    DELETE FROM public.contracts 
    WHERE (client_ids IS NOT NULL AND client_id = ANY(client_ids))
       OR (request_ids IS NOT NULL AND credit_request_id = ANY(request_ids));

    DELETE FROM public.chat_messages WHERE sender_id = ANY(user_ids) OR receiver_id = ANY(user_ids);
    DELETE FROM public.notifications WHERE user_id = ANY(user_ids) OR from_user_id = ANY(user_ids);

    DELETE FROM public.credit_requests 
    WHERE (request_ids IS NOT NULL AND id = ANY(request_ids))
       OR user_id = ANY(user_ids)
       OR (client_emails IS NOT NULL AND client_email = ANY(client_emails))
       OR (client_phones IS NOT NULL AND client_phone = ANY(client_phones));

    -- CORE RECORDS
    DELETE FROM public.profiles WHERE id = ANY(user_ids);
    DELETE FROM public.user_roles WHERE user_id = ANY(user_ids);
    DELETE FROM public.clients 
    WHERE user_id = ANY(user_ids)
       OR (client_ids IS NOT NULL AND id = ANY(client_ids))
       OR (client_emails IS NOT NULL AND email = ANY(client_emails))
       OR (client_phones IS NOT NULL AND phone = ANY(client_phones));

    -- AUTH USERS
    DELETE FROM auth.users WHERE id = ANY(user_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


