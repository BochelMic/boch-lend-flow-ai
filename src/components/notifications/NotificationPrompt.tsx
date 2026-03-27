import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BellRing, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const NotificationPrompt = ({ userId }: { userId?: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Only show if user is logged in, browser supports notifications, and permission hasn't been asked yet
        if (!userId || !('Notification' in window)) return;

        // We can also use localStorage to not annoy the user every single time if they clicked "Later"
        const hasDismissed = localStorage.getItem('notification-prompt-dismissed');

        if (Notification.permission === 'default' && !hasDismissed) {
            // Delay slightly so it doesn't pop up immediately on login, making it feel less aggressive
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [userId]);

    const handleAllow = async () => {
        setIsOpen(false);
        try {
            const permission = await Notification.requestPermission();

            if (permission === 'granted' && 'serviceWorker' in navigator && 'PushManager' in window) {
                // Now that we have permission, trigger the subscription
                const registration = await navigator.serviceWorker.ready;
                let subscription = await registration.pushManager.getSubscription();

                const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
                if (!VAPID_PUBLIC_KEY) {
                    console.error('[Push] VITE_VAPID_PUBLIC_KEY not found in environment');
                    return;
                }

                // Force renewal if key changed or subscription is stale
                const lastUsedKey = localStorage.getItem('last-vapid-key');
                if (subscription && lastUsedKey !== VAPID_PUBLIC_KEY) {
                    console.log('[Push] VAPID key mismatch, renewing subscription...');
                    await subscription.unsubscribe();
                    subscription = null;
                }

                if (!subscription) {
                    const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

                    try {
                        subscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedVapidKey
                        });
                        console.log('[Push] New subscription successful');
                        localStorage.setItem('last-vapid-key', VAPID_PUBLIC_KEY);
                    } catch (e) {
                        console.error('[Push] Subscription failed. Retrying with fresh registration...', e);
                        const currentSub = await registration.pushManager.getSubscription();
                        if (currentSub) await currentSub.unsubscribe();

                        subscription = await registration.pushManager.subscribe({
                            userVisibleOnly: true,
                            applicationServerKey: convertedVapidKey
                        });
                        localStorage.setItem('last-vapid-key', VAPID_PUBLIC_KEY);
                    }
                }

                if (subscription) {
                    const subJson = subscription.toJSON();
                    if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
                        console.log('[Push] Syncing correct subscription with database...');
                        await supabase.from('user_push_subscriptions').upsert({
                            user_id: userId,
                            endpoint: subJson.endpoint,
                            p256dh: subJson.keys.p256dh,
                            auth: subJson.keys.auth
                        }, { onConflict: 'user_id, endpoint' });
                    }
                }
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    };

    const handleDismiss = () => {
        setIsOpen(false);
        localStorage.setItem('notification-prompt-dismissed', 'true');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-md">
                <div className="absolute right-4 top-4">
                    <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full" onClick={handleDismiss}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <DialogHeader className="flex flex-col items-center text-center sm:text-center mt-4">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                        <BellRing className="h-8 w-8 text-primary animate-pulse" />
                    </div>
                    <DialogTitle className="text-xl">Ativar Notificações?</DialogTitle>
                    <DialogDescription className="pt-2 text-base">
                        Mantenha-se atualizado(a) com alertas importantes sobre os seus pedidos e mensagens.
                        Prometemos enviar apenas o essencial.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-col gap-2 mt-2">
                    <Button onClick={handleAllow} className="w-full bg-primary hover:bg-primary/90 text-lg py-6">
                        Sim, quero receber
                    </Button>
                    <Button variant="ghost" onClick={handleDismiss} className="w-full text-muted-foreground w-full">
                        Talvez mais tarde
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

// Utility
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
