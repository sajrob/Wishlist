/**
 * Custom hook for managing notifications
 * Handles fetching, marking as read, and deleting notifications
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { Notification } from '../types';
import { toast } from 'sonner';

export function useNotifications(userId: string | undefined) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAllRead, setMarkingAllRead] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;

        try {
            const { data, error } = await supabase
                .from('notifications')
                .select(`
                    *,
                    actor:profiles!notifications_actor_id_fkey (
                        id,
                        full_name,
                        username
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            toast.error('Could not load notifications');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            void fetchNotifications();
        }
    }, [userId, fetchNotifications]);

    const markAsRead = useCallback(async (id: string) => {
        try {
            // Optimistically update UI
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
            );

            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            // Revert optimistic update
            await fetchNotifications();
        }
    }, [fetchNotifications]);

    const markAllAsRead = useCallback(async () => {
        if (!userId || notifications.every(n => n.is_read)) return;

        setMarkingAllRead(true);
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;

            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            toast.success('All notifications marked as read');
        } catch (error) {
            console.error('Error marking all as read:', error);
            toast.error('Could not mark all as read');
        } finally {
            setMarkingAllRead(false);
        }
    }, [userId, notifications]);

    const deleteNotification = useCallback(async (id: string) => {
        try {
            const { error } = await supabase
                .from('notifications')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setNotifications(prev => prev.filter(n => n.id !== id));
            toast.success('Notification removed');
        } catch (error) {
            console.error('Error deleting notification:', error);
            toast.error('Could not delete notification');
        }
    }, []);

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return {
        notifications,
        loading,
        markingAllRead,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refetch: fetchNotifications,
    };
}
