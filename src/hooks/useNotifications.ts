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
    if (!userId) return;

    // Heartbeat for PWA: refresh when user returns to app/tab
    const handleFocus = () => {
      console.log('[Realtime] App focused, refreshing notifications...');
      refresh();
    };

    // Unlock audio on first interaction
    const unlockAudio = () => {
      console.log('[Audio] User interacted, unlocking notification sounds...');
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const tempCtx = new AudioContextClass();
        tempCtx.resume().then(() => {
          console.log('[Audio] Context unlocked');
          tempCtx.close();
        });
      }
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('click', unlockAudio);
    window.addEventListener('touchstart', unlockAudio);

    // Initial refresh
    refresh();

    // Use a unique suffix for this hook instance to allow multiple subscriptions (Header + MobileHeader)
    const instanceId = Math.random().toString(36).substring(7);
    const channelName = `notifs-live-${instanceId}`;
    console.log(`[Realtime] Initializing channel: ${channelName} for user: ${userId}`);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          const newNotif = payload.new as any;
          if (newNotif.user_id === userId) {
            console.log('[Realtime] New notification matches current user!', newNotif);
            playNotificationSound();
            refresh();
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log(`[Realtime] ✅ Connected to ${channelName}`);
        }
        if (err) {
          console.error(`[Realtime] Subscription error for ${channelName}:`, err);
        }
        if (status === 'CHANNEL_ERROR') {
          console.error(`[Realtime] FAILED to connect. Using fallback refresh.`);
        }
      });

    return () => {
      console.log(`[Realtime] Cleaning up channel ${channelName}`);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
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
    .replace(/-/g, '+')
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
