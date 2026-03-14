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
