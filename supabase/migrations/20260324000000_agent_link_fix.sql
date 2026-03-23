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

-- 2. FIX ESPECÍFICO: Recuperar dados do ultimocliente@gmal.com
-- Este bloco tenta encontrar o agente que criou o cliente originalmente 
-- (baseado no registro do cliente se ele já tiver agent_id, ou via metadados do auth se possível)
-- Como não temos certeza do ID do agente sem consultar o banco, 
-- vamos usar uma lógica que busca o agente vinculado ao registro de cliente.

DO $$
DECLARE
    v_target_email TEXT := 'ultimocliente@gmal.com';
    v_agent_id UUID;
    v_client_id UUID;
BEGIN
    -- Encontrar o cliente
    SELECT id, agent_id INTO v_client_id, v_agent_id 
    FROM public.clients 
    WHERE email = v_target_email;

    IF v_client_id IS NOT NULL AND v_agent_id IS NOT NULL THEN
        -- Garantir que todos os pedidos dele tenham o agente
        UPDATE public.credit_requests
        SET agent_id = v_agent_id
        WHERE client_email = v_target_email
          AND agent_id IS NULL;

        -- Garantir que todos os empréstimos dele tenham o agente
        UPDATE public.loans
        SET agent_id = v_agent_id
        WHERE client_id = v_client_id
          AND agent_id IS NULL;
          
        RAISE NOTICE 'Dados recuperados para o cliente %', v_target_email;
    END IF;
END $$;
