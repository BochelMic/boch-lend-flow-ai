import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'
import webpush from 'https://esm.sh/web-push@3.6.6'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const payload = await req.json()
    console.log("Webhook Payload received:", JSON.stringify(payload, null, 2));

    // Determine the type of notification based on the payload structure
    // If it comes from our PostgreSQL HTTP trigger:
    let userId = payload.userId;
    let type = payload.type || 'system';
    let title = payload.title;
    let body = payload.body;
    let link_url = payload.link_url || '/';
    let event = payload.event;

    // If it comes directly from a Supabase Database Webhook (Insert on credit_requests, loans, etc)
    if (payload.type === 'INSERT' && payload.table) {
      if (payload.table === 'credit_requests') {
        const record = payload.record;

        // We need to notify agents/gestores. For simplicity, we fetch all gestores.
        const { data: gestores } = await supabaseClient
          .from('profiles')
          .select('user_id')
          .eq('role', 'gestor');

        title = 'Novo Pedido de Crédito';
        body = `Um novo pedido de crédito de ${record.amount} MZN foi recebido.`;
        link_url = '/admin/pedidos';

        // Notify all gestores
        if (gestores) {
          for (const g of gestores) {
            await processNotification(supabaseClient, g.user_id, type, title, body, link_url);
          }
        }
        return new Response(JSON.stringify({ success: true, message: 'Notified gestores' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      else if (payload.table === 'loans') {
        // Logic for loan approved
        const record = payload.record;
        if (record.status === 'active') {
          title = 'Empréstimo Aprovado';
          body = `O seu empréstimo de ${record.amount} MZN foi aprovado.`;
          link_url = '/';
          // Notify client
          await processNotification(supabaseClient, record.client_id, type, title, body, link_url);
          return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
      }
      else if (payload.table === 'chat_messages') {
        const record = payload.record;
        title = 'Nova Mensagem';
        body = `Recebeu uma nova mensagem no chat.`;
        link_url = '/chat';

        await processNotification(supabaseClient, record.receiver_id, 'chat', title, body, link_url);
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
    }

    // Direct HTTP call (from the PG Trigger we just wrote)
    if (title && body) {
      // If userId is missing but we have client_id, resolve user_id from client_id
      if (!userId && payload.client_id) {
        const { data: client } = await supabaseClient.from('clients').select('user_id').eq('id', payload.client_id).single();
        if (client) userId = client.user_id;
      }

      if (userId) {
        await processNotification(supabaseClient, userId, type, title, body, link_url);
      } else if (event === 'credit_request_created') {
        // Notify Gestores
        const { data: gestores } = await supabaseClient.from('profiles').select('user_id').eq('role', 'gestor');
        if (gestores) {
          for (const g of gestores) {
            await processNotification(supabaseClient, g.user_id, type, title, body, link_url);
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function processNotification(supabaseClient: any, userId: string, type: string, title: string, body: string, link_url: string) {
  if (!userId) return;

  // 1. In-App Notification
  await supabaseClient
    .from('notifications')
    .insert({
      user_id: userId,
      type: type || 'system',
      title,
      body,
      link_url,
      read: false
    })

  // 2. Web Push Notification
  const { data: subs } = await supabaseClient
    .from('user_push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (subs && subs.length > 0) {
    const vapidData = {
      publicKey: Deno.env.get('VAPID_PUBLIC_KEY') || '',
      privateKey: Deno.env.get('VAPID_PRIVATE_KEY') || '',
      subject: 'mailto:admin@bochel.co.mz'
    }

    if (vapidData.publicKey && vapidData.privateKey) {
      webpush.setVapidDetails(vapidData.subject, vapidData.publicKey, vapidData.privateKey)

      const pushPayload = JSON.stringify({ title, body, url: link_url || '/' })

      for (const sub of subs) {
        const pushSubscription = { endpoint: sub.endpoint, keys: { auth: sub.auth, p256dh: sub.p256dh } }
        try {
          await webpush.sendNotification(pushSubscription, pushPayload)
        } catch (e) {
          console.error('Error sending push:', e.message)
        }
      }
    }
  }
}
