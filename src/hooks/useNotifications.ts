import { useState, useEffect, useCallback } from 'react';

export interface Notification {
  id: string;
  type: 'chat' | 'system' | 'alert';
  title: string;
  body: string;
  from?: string;
  fromRole?: string;
  timestamp: string;
  read: boolean;
}

const NOTIF_KEY = 'app_notifications';

// Deriva notificações a partir das mensagens de chat não lidas
function deriveNotifications(userId: string): Notification[] {
  const messages = JSON.parse(localStorage.getItem('chat_messages') || '[]');
  const existing = JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]') as Notification[];
  const existingIds = new Set(existing.map((n: Notification) => n.id));

  const newFromChat: Notification[] = messages
    .filter((m: any) => m.receiverId === userId && !m.read)
    .filter((m: any) => !existingIds.has(`chat_${m.id}`))
    .map((m: any): Notification => ({
      id: `chat_${m.id}`,
      type: m.content.startsWith('📢') ? 'alert' : 'chat',
      title: m.content.startsWith('📢') ? 'Aviso do Gestor' : `Mensagem de ${m.senderName}`,
      body: m.content.replace('📢 [Aviso do Gestor] ', ''),
      from: m.senderName,
      fromRole: m.senderRole,
      timestamp: m.timestamp,
      read: false,
    }));

  if (newFromChat.length === 0) return existing;

  const merged = [...existing, ...newFromChat];
  localStorage.setItem(NOTIF_KEY, JSON.stringify(merged));
  return merged;
}

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = useCallback(() => {
    if (!userId) return;
    const derived = deriveNotifications(userId);
    setNotifications(derived);
  }, [userId]);

  useEffect(() => {
    refresh();
    // Polling a cada 3 segundos para capturar novas mensagens
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadChat = notifications.filter((n) => !n.read && n.type === 'chat').length;
  const unreadAlerts = notifications.filter((n) => !n.read && (n.type === 'alert' || n.type === 'system')).length;

  const markAllRead = useCallback(() => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    setNotifications(updated);
  }, [notifications]);

  const markOneRead = useCallback((id: string) => {
    const updated = notifications.map((n) => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(updated));
    setNotifications(updated);
  }, [notifications]);

  const clearAll = useCallback(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify([]));
    setNotifications([]);
  }, []);

  return {
    notifications: notifications.slice().sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    unreadCount,
    unreadChat,
    unreadAlerts,
    markAllRead,
    markOneRead,
    clearAll,
    refresh,
  };
}
