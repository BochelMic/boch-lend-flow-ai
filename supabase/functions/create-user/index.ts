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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

    // --- In-function Authorization ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ success: false, error: 'Token de autorização em falta.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify caller identity using their token
    const supabaseCaller = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user: callerUser }, error: authError } = await supabaseCaller.auth.getUser();
    if (authError || !callerUser) {
      return new Response(JSON.stringify({ success: false, error: 'Sessão inválida ou expirada. Faça login novamente.' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check caller role
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUser.id)
      .maybeSingle();

    const callerRole = roleData?.role || callerUser.user_metadata?.role;
    if (callerRole !== 'gestor' && callerRole !== 'agente') {
      return new Response(JSON.stringify({ success: false, error: 'Apenas gestores e agentes podem criar utilizadores.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    // --- End Authorization ---

    const { email, password, name, role, agent_id, phone, empresa_id } = await req.json();

    // Create user via admin API
    const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, role, agent_id, phone, empresa_id },
    });

    if (createError) {
      return new Response(JSON.stringify({ success: false, error: createError.message }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert role into user_roles table
    if (role) {
      await supabaseAdmin.from('user_roles').upsert({
        user_id: userData.user.id,
        role: role,
      }, { onConflict: 'user_id' });
    }

    // Insert profile
    await supabaseAdmin.from('profiles').upsert({
      user_id: userData.user.id,
      name: name,
      email: email,
    }, { onConflict: 'user_id' });

    return new Response(JSON.stringify({ success: true, user_id: userData.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
