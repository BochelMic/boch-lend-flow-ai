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
  link_url?: string;
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
        link_url: n.link_url,
      })));
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      console.log('[useNotifications] No userId provided, skipping subscription.');
      return;
    }

    refresh();

    // Use a unique name but don't re-create it unless userId actually changes
    const channelName = `notifs_${userId}`;
    console.log(`[Realtime] Initializing channel: ${channelName}`);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('[Realtime] Message received!', payload.new);
          playNotificationSound();
          refresh();
        }
      )
      .subscribe((status) => {
        console.log(`[Realtime] Status for ${channelName}:`, status);
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] FAILED to connect. Check SQL publications and RLS. (User: ${userId})`);
        }
      });

    return () => {
      console.log(`[Realtime] Cleaning up channel ${channelName}`);
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

// Utility function to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// A pleasant, asset-free double-chime notification sound using Web Audio API
export const playNotificationSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);

      gain.gain.setValueAtTime(0, ctx.currentTime + startTime);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    // Play E5 then A5
    playNote(659.25, 0, 0.4);
    playNote(880.00, 0.15, 0.6);
  } catch (e) {
    console.warn("Could not play notification sound", e);
  }
};
