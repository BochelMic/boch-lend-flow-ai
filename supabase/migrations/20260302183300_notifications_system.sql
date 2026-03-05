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

-- Policies for automation_rules (Only Gestores can manage)
CREATE POLICY "Gestores can manage automation rules"
    ON public.automation_rules
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'gestor'
        )
    );

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
