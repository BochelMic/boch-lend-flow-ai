import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = useCallback(async () => {
    if (!userId) return;

    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setNotifications(data.map((n: any) => ({
        id: n.id,
        type: n.type as 'chat' | 'system' | 'alert',
        title: n.title,
        body: n.body,
        timestamp: n.created_at,
        read: n.read,
      })));
    }
  }, [userId]);

  useEffect(() => {
    refresh();

    // Subscribe to realtime notifications
    const channel = supabase
      .channel('user-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refresh, userId]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const unreadChat = notifications.filter((n) => !n.read && n.type === 'chat').length;
  const unreadAlerts = notifications.filter((n) => !n.read && (n.type === 'alert' || n.type === 'system')).length;

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, [userId]);

  const markOneRead = useCallback(async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  }, []);

  const clearAll = useCallback(async () => {
    if (!userId) return;
    await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId);
    setNotifications([]);
  }, [userId]);

  return {
    notifications,
    unreadCount,
    unreadChat,
    unreadAlerts,
    markAllRead,
    markOneRead,
    clearAll,
    refresh,
  };
}
