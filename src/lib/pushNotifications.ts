import { supabase } from '@/supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export async function subscribeToPushNotifications(userId: string) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        throw new Error('Push notifications are not supported by this browser.');
    }

    if (!VAPID_PUBLIC_KEY) {
        throw new Error('VAPID public key is missing. Please check your environment variables.');
    }

    console.log('[Push] Attempting to find service worker...');

    // Check if we already have a registration first
    let registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
        console.log('[Push] No active registration found, waiting for ready...');
        registration = await Promise.race([
            navigator.serviceWorker.ready,
            new Promise<ServiceWorkerRegistration>((_, reject) =>
                setTimeout(() => reject(new Error('Service Worker ready timeout (10s)')), 10000)
            )
        ]);
    }

    console.log('[Push] Service worker found:', registration.scope);

    // Check for existing subscription
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
        // Subscribe if no existing subscription
        subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
    }

    // Save subscription to Supabase
    const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
            user_id: userId,
            endpoint: subscription.endpoint,
            p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
            auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!)))
        }, { onConflict: 'user_id, endpoint' });

    if (error) {
        console.error('Supabase upsert error:', error);
        throw new Error(`Failed to save subscription: ${error.message}`);
    }

    return subscription;
}

export async function unsubscribeFromPushNotifications(userId: string) {
    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();

        if (subscription) {
            // Unsubscribe from browser
            await subscription.unsubscribe();

            // Delete from Supabase
            const { error } = await supabase
                .from('push_subscriptions')
                .delete()
                .match({ user_id: userId, endpoint: subscription.endpoint });

            if (error) throw error;
        }
        return true;
    } catch (err) {
        console.error('Error unsubscribing from push notifications:', err);
        return false;
    }
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
