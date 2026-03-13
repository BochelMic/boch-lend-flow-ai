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
