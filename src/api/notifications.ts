import { supabase } from '../supabaseClient';
import type { Notification, SupabaseResponse } from '../types';

export async function fetchNotifications(userId: string): Promise<SupabaseResponse<Notification[]>> {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select(`
                *,
                actor:profiles!notifications_actor_id_fkey (
                    id,
                    full_name,
                    username,
                    avatar_url
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return { data: null, error: error as Error };
    }
}

export async function markNotificationRead(id: string): Promise<SupabaseResponse<boolean>> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return { data: null, error: error as Error };
    }
}

export async function markAllNotificationsRead(userId: string): Promise<SupabaseResponse<boolean>> {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        return { data: null, error: error as Error };
    }
}

export async function deleteNotification(id: string): Promise<SupabaseResponse<boolean>> {
    try {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error deleting notification:', error);
        return { data: null, error: error as Error };
    }
}
