import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { subscribeToPushNotifications, unsubscribeFromPushNotifications } from '@/lib/pushNotifications';
import { toast } from 'sonner';

export function usePushNotifications() {
    const { user } = useAuth();
    const [permission, setPermission] = useState<NotificationPermission>(
        'Notification' in window ? Notification.permission : 'denied'
    );
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkSubscription() {
            if (!('serviceWorker' in navigator) || !user) {
                setLoading(false);
                return;
            }

            try {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                setIsSubscribed(!!subscription);
            } catch (err) {
                console.error('Error checking push subscription:', err);
            } finally {
                setLoading(false);
            }
        }

        checkSubscription();
    }, [user]);

    const requestPermission = async () => {
        if (!('Notification' in window)) return 'denied';

        const result = await Notification.requestPermission();
        setPermission(result);
        return result;
    };

    const subscribe = async () => {
        if (!user) return;
        setLoading(true);

        // Request permission first if not granted
        if (Notification.permission !== 'granted') {
            const perm = await requestPermission();
            if (perm !== 'granted') {
                setLoading(false);
                toast.error('Notification permission denied');
                return;
            }
        }

        const sub = await subscribeToPushNotifications(user.id);
        if (sub) {
            setIsSubscribed(true);
            toast.success('Successfully subscribed to notifications!');
        } else {
            toast.error('Failed to subscribe to notifications');
        }
        setLoading(false);
    };

    const unsubscribe = async () => {
        if (!user) return;
        setLoading(true);
        const success = await unsubscribeFromPushNotifications(user.id);
        if (success) {
            setIsSubscribed(false);
            toast.success('Unsubscribed from notifications');
        } else {
            toast.error('Failed to unsubscribe');
        }
        setLoading(false);
    };

    return {
        permission,
        isSubscribed,
        loading,
        subscribe,
        unsubscribe,
        requestPermission
    };
}
