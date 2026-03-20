import { supabase } from '@/integrations/supabase/client';

type NotifyEventType =
    | 'NEW_CREDIT_REQUEST'
    | 'CREDIT_APPROVED'
    | 'CREDIT_REJECTED'
    | 'CONTRACT_SIGNED'
    | 'RESIGN_REQUESTED'
    | 'LOAN_INJECTED'
    | 'PAYMENT_RECEIVED'
    | 'LOAN_PAID_OFF'
    | 'AGENT_REQUEST_UPDATE'
    | 'CHAT_MESSAGE';

interface NotifyParams {
    clientName?: string;
    amount?: number;
    totalWithInterest?: number;
    remainingAmount?: number;
    rejectReason?: string;
    userId?: string;        // target user
    fromUserId?: string;    // who performed the action
    agentUserId?: string;   // agent associated with request
    action?: 'approved' | 'rejected';
}

const fmt = (v: number) => v.toLocaleString('pt-MZ', { minimumFractionDigits: 0 });

async function getAllGestorIds(): Promise<string[]> {
    console.log('[notifyEvent] Fetching gestor IDs via RPC...');
    const { data, error } = await supabase.rpc('get_gestors_for_notification' as any);
    if (error) {
        console.error('[notifyEvent] Error fetching gestors:', error);
        return [];
    }
    const ids = ((data as any) || []).map((r: { user_id: string }) => r.user_id);
    console.log('[notifyEvent] Found gestors to notify:', ids);
    return ids;
}

async function insertNotifications(entries: Array<{
    user_id: string;
    type: 'chat' | 'system' | 'alert';
    title: string;
    body: string;
    from_user_id?: string | null;
    link_url?: string;
}>) {
    if (entries.length === 0) {
        console.warn('[notifyEvent] ⚠️ No entries to insert. Check gestor IDs or target user.');
        return;
    }
    console.log(`[notifyEvent] 📤 Attempting to insert ${entries.length} notifications:`, entries.map(e => ({ to: e.user_id, title: e.title })));
    const { error } = await supabase.from('notifications').insert(entries);
    if (error) {
        console.error('[notifyEvent] ❌ FAILED to insert notifications:', error);
    } else {
        console.log('[notifyEvent] ✅ Success: Notifications inserted in DB.');
    }
}

export async function notifyEvent(event: NotifyEventType, params: NotifyParams) {
    try {
        switch (event) {

            // ── Client submits a new credit request → notify all gestors (and agent) ──
            case 'NEW_CREDIT_REQUEST': {
                const gestorIds = await getAllGestorIds();
                const interest = (params.amount || 0) * 0.3;
                const total = (params.amount || 0) + interest;

                const entries: Parameters<typeof insertNotifications>[0] = gestorIds.map(id => ({
                    user_id: id,
                    type: 'alert' as const,
                    title: '📋 Novo Pedido de Crédito',
                    body: `${params.clientName} solicitou MZN ${fmt(params.amount || 0)}. Total c/ 30% juros: MZN ${fmt(total)}.`,
                    from_user_id: params.fromUserId || null,
                    link_url: '/credit-requests',
                }));

                // If an agent created this, notify them too
                if (params.agentUserId) {
                    entries.push({
                        user_id: params.agentUserId,
                        type: 'alert' as const,
                        title: '📋 Pedido de Crédito Submetido',
                        body: `O pedido para ${params.clientName} (MZN ${fmt(params.amount || 0)}) foi submetido com sucesso e aguarda análise.`,
                        from_user_id: params.fromUserId || null,
                        link_url: '/credit-requests',
                    });
                }

                await insertNotifications(entries);
                break;
            }

            // ── Admin approves credit request → notify client ──
            case 'CREDIT_APPROVED': {
                if (!params.userId) break;
                await insertNotifications([{
                    user_id: params.userId,
                    type: 'alert',
                    title: '✅ Pedido de Crédito Aprovado!',
                    body: `O seu pedido de MZN ${fmt(params.amount || 0)} foi aprovado! Um contrato foi gerado — aceda a "Contratos" para assinar.`,
                    from_user_id: params.fromUserId || null,
                    link_url: '/contratos',
                }]);
                break;
            }

            // ── Admin rejects credit request → notify client ──
            case 'CREDIT_REJECTED': {
                if (!params.userId) break;
                await insertNotifications([{
                    user_id: params.userId,
                    type: 'alert',
                    title: '❌ Pedido de Crédito Rejeitado',
                    body: `O seu pedido de MZN ${fmt(params.amount || 0)} foi rejeitado. Motivo: ${params.rejectReason || 'Sem motivo especificado.'}`,
                    from_user_id: params.fromUserId || null,
                    link_url: '/pedidos',
                }]);
                break;
            }

            // ── Client signs contract → notify all gestors (and agent) ──
            case 'CONTRACT_SIGNED': {
                const gestorIds = await getAllGestorIds();
                const entries: Parameters<typeof insertNotifications>[0] = gestorIds.map(id => ({
                    user_id: id,
                    type: 'alert' as const,
                    title: '✍️ Contrato Assinado',
                    body: `${params.clientName} acabou de assinar o contrato. Pode proceder à injecção do saldo.`,
                    from_user_id: params.fromUserId || null,
                    link_url: '/credit-requests',
                }));

                // If this client belongs to an agent, notify the agent
                if (params.agentUserId) {
                    entries.push({
                        user_id: params.agentUserId,
                        type: 'alert' as const,
                        title: '✍️ Contrato Assinado pelo Cliente',
                        body: `${params.clientName} assinou o contrato! O pedido está agora pronto para injecção de saldo.`,
                        from_user_id: params.fromUserId || null,
                        link_url: '/credit-requests',
                    });
                }

                await insertNotifications(entries);
                break;
            }

            // ── Admin requests re-signature → notify client ──
            case 'RESIGN_REQUESTED': {
                if (!params.userId) break;
                await insertNotifications([{
                    user_id: params.userId,
                    type: 'alert',
                    title: '⚠️ Nova Assinatura Necessária',
                    body: 'A sua assinatura no contrato foi considerada inválida. Por favor, aceda a "Contratos" e assine novamente.',
                    from_user_id: params.fromUserId || null,
                    link_url: '/contratos',
                }]);
                break;
            }

            // ── Admin injects loan balance → notify client ──
            case 'LOAN_INJECTED': {
                if (!params.userId) break;
                const total = params.totalWithInterest || (params.amount || 0) * 1.3;
                await insertNotifications([{
                    user_id: params.userId,
                    type: 'alert',
                    title: '💰 Saldo Creditado!',
                    body: `MZN ${fmt(params.amount || 0)} foram creditados na sua conta. Dívida total com 30% de juros: MZN ${fmt(total)}. Prazo: 30 dias.`,
                    from_user_id: params.fromUserId || null,
                    link_url: '/meus-creditos',
                }]);
                break;
            }

            // ── Admin records payment → notify client ──
            case 'PAYMENT_RECEIVED': {
                if (!params.userId) break;
                const remaining = params.remainingAmount ?? 0;
                await insertNotifications([{
                    user_id: params.userId,
                    type: 'alert',
                    title: '💳 Pagamento Recebido',
                    body: `Recebemos o seu pagamento de MZN ${fmt(params.amount || 0)}. ${remaining > 0 ? `Saldo restante: MZN ${fmt(remaining)}.` : 'A sua dívida foi totalmente paga!'} Obrigado!`,
                    from_user_id: params.fromUserId || null,
                    link_url: '/meus-creditos',
                }]);
                break;
            }

            // ── Loan fully paid → notify client + all gestors ──
            case 'LOAN_PAID_OFF': {
                const entries: Parameters<typeof insertNotifications>[0] = [];
                if (params.userId) {
                    entries.push({
                        user_id: params.userId,
                        type: 'system',
                        title: '🎉 Parabéns! Crédito Quitado!',
                        body: 'Você pagou totalmente o seu crédito. Já pode solicitar um novo crédito quando quiser!',
                        from_user_id: null,
                        link_url: '/pedidos',
                    });
                }
                const gestorIds = await getAllGestorIds();
                gestorIds.forEach(id => {
                    entries.push({
                        user_id: id,
                        type: 'system',
                        title: '🎉 Crédito Quitado',
                        body: `O cliente ${params.clientName || 'Desconhecido'} liquidou totalmente o crédito de MZN ${fmt(params.amount || 0)}.`,
                        from_user_id: null,
                    });
                });
                await insertNotifications(entries);
                break;
            }

            // ── Notify agent about request update ──
            case 'AGENT_REQUEST_UPDATE': {
                if (!params.agentUserId) break;
                const actionLabel = params.action === 'approved' ? 'aprovado' : 'rejeitado';
                await insertNotifications([{
                    user_id: params.agentUserId,
                    type: 'alert',
                    title: `📢 Pedido ${params.action === 'approved' ? 'Aprovado' : 'Rejeitado'}`,
                    body: `O pedido de ${params.clientName} (MZN ${fmt(params.amount || 0)}) foi ${actionLabel}.`,
                    from_user_id: params.fromUserId || null,
                    link_url: '/credit-requests',
                }]);
                break;
            }

            // ── Chat message received ──
            case 'CHAT_MESSAGE': {
                console.log('[notifyEvent] Processing CHAT_MESSAGE. Target:', params.userId, 'From:', params.fromUserId);
                if (!params.userId) {
                    console.error('[notifyEvent] ABORTED: No target userId for CHAT_MESSAGE.');
                    break;
                }
                await insertNotifications([{
                    user_id: params.userId,
                    type: 'chat',
                    title: `💬 Mensagem de ${params.clientName || 'Utilizador'}`,
                    body: params.rejectReason || 'Nova mensagem recebida no chat.',
                    from_user_id: params.fromUserId || null,
                    link_url: '/chat',
                }]);
                break;
            }
        }
    } catch (err) {
        console.warn('[notifyEvent] Error sending notification:', event, err);
    }
}
