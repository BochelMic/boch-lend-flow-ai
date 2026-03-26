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
