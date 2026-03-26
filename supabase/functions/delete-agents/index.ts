import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify caller is a gestor
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !caller) {
      return new Response(JSON.stringify({ success: false, error: 'Token inválido' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check caller has gestor role
    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .in('role', ['gestor', 'superadmin'])
      .limit(1)
      .single();

    if (!callerRole) {
      return new Response(JSON.stringify({ success: false, error: 'Permissão negada. Apenas gestores podem eliminar agentes.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { agent_user_ids } = await req.json();

    if (!agent_user_ids || !Array.isArray(agent_user_ids) || agent_user_ids.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Lista de agentes inválida' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify all IDs are actual agents
    const { data: agentRoles } = await supabaseAdmin
      .from('user_roles')
      .select('user_id')
      .in('user_id', agent_user_ids)
      .eq('role', 'agente');

    const verifiedAgentIds = agentRoles?.map(r => r.user_id) || [];

    if (verifiedAgentIds.length === 0) {
      return new Response(JSON.stringify({ success: false, error: 'Nenhum agente válido encontrado na lista' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Step 1: Nullify agent_id on clients (transfer to gestor management)
    await supabaseAdmin
      .from('clients')
      .update({ agent_id: null })
      .in('agent_id', verifiedAgentIds);

    // Step 2: Nullify agent_id on loans
    await supabaseAdmin
      .from('loans')
      .update({ agent_id: null })
      .in('agent_id', verifiedAgentIds);

    // Step 3: Nullify agent_id on credit_requests
    await supabaseAdmin
      .from('credit_requests')
      .update({ agent_id: null })
      .in('agent_id', verifiedAgentIds);

    // Step 4: Delete agent-specific data
    await supabaseAdmin
      .from('agent_performance')
      .delete()
      .in('agent_id', verifiedAgentIds);

    // Step 5: Delete notifications for these users
    await supabaseAdmin
      .from('notifications')
      .delete()
      .in('user_id', verifiedAgentIds);

    // Step 6: Delete chat messages
    await supabaseAdmin
      .from('chat_messages')
      .delete()
      .in('sender_id', verifiedAgentIds);

    await supabaseAdmin
      .from('chat_messages')
      .delete()
      .in('receiver_id', verifiedAgentIds);

    // Step 7: Delete user_roles
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .in('user_id', verifiedAgentIds);

    // Step 8: Delete profiles
    await supabaseAdmin
      .from('profiles')
      .delete()
      .in('user_id', verifiedAgentIds);

    // Step 9: Delete auth users (this cascades remaining FK references)
    const errors: string[] = [];
    for (const userId of verifiedAgentIds) {
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (deleteError) {
        errors.push(`Falha ao eliminar user ${userId}: ${deleteError.message}`);
      }
    }

    if (errors.length > 0 && errors.length === verifiedAgentIds.length) {
      return new Response(JSON.stringify({ success: false, error: errors.join('; ') }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      deleted: verifiedAgentIds.length - errors.length,
      total: verifiedAgentIds.length,
      skipped: agent_user_ids.length - verifiedAgentIds.length,
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
