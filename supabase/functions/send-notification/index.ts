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

    // 1. If 'push_only' is true, it means the notification is already in the DB (triggered by tr_push_notification)
    // We just need to send the Web Push.
    if (payload.push_only) {
      console.log("[PushOnly] Direct delivery for user:", payload.userId);
      await deliverWebPush(supabaseClient, payload.userId, payload.title, payload.body, payload.link_url);
      return new Response(JSON.stringify({ success: true, mode: 'push_only' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // 2. Original Logic: Determine type and handle database insertion + push
    let userId = payload.userId;
    const type = payload.type || 'system';
    let title = payload.title;
    let body = payload.body;
    let link_url = payload.link_url || '/';

    // Handle Supabase Database Webhooks (Insert on tables)
    if (payload.type === 'INSERT' && payload.table) {
      if (payload.table === 'credit_requests') {
        const record = payload.record;
        const { data: gestores } = await supabaseClient.from('profiles').select('user_id').eq('role', 'gestor');

        title = 'Novo Pedido de Crédito';
        body = `Um novo pedido de crédito de ${record.amount} MZN foi recebido.`;
        link_url = '/admin/pedidos';

        if (gestores) {
          for (const g of gestores) {
            await processNotification(supabaseClient, g.user_id, 'alert', title, body, link_url);
          }
        }
        return new Response(JSON.stringify({ success: true, message: 'Notified gestores' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      // ... (other table handlers if needed, but tr_push_notification makes most of them redundant)
    }

    // Handle Direct HTTP calls (legacy or specific triggers)
    if (title && body) {
      if (!userId && payload.client_id) {
        const { data: client } = await supabaseClient.from('clients').select('user_id').eq('id', payload.client_id).single();
        if (client) userId = client.user_id;
      }

      if (userId) {
        await processNotification(supabaseClient, userId, type, title, body, link_url);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function deliverWebPush(supabaseClient: any, userId: string, title: string, body: string, link_url: string) {
  const { data: subs } = await supabaseClient
    .from('user_push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  if (subs && subs.length > 0) {
    console.log(`[Push] Found ${subs.length} active subscriptions for user ${userId}`);
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
          console.log(`[Push] Dispatching to endpoint: ${sub.endpoint.substring(0, 30)}...`);
          const response = await webpush.sendNotification(pushSubscription, pushPayload)
          console.log(`[Push] Delivery Success:`, response.statusCode);
        } catch (e) {
          console.error('[Push] Delivery Failure:', e.message)
        }
      }
    } else {
      console.error("[Push] CRITICAL: VAPID keys missing in Edge Function Secrets!");
    }
  } else {
    console.log(`[Push] No active subscriptions found for user ${userId}. Push skipped.`);
  }
}

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
