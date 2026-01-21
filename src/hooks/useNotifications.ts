/**
 * Custom hook for managing notifications using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification as apiDeleteNotification } from '@/api';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';

export function useNotifications(userId: string | undefined) {
    const queryClient = useQueryClient();

    const { data: response, isLoading } = useQuery({
        queryKey: queryKeys.notifications(userId || ''),
        queryFn: () => fetchNotifications(userId!),
        enabled: !!userId,
    });

    const notifications = response?.data || [];

    const markReadMutation = useMutation({
        mutationFn: (id: string) => markNotificationRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId || '') });
        },
        onError: (error) => {
            console.error('Error marking notification as read:', error);
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => markAllNotificationsRead(userId || ''),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId || '') });
            toast.success('All notifications marked as read');
        },
        onError: (error) => {
            console.error('Error marking all as read:', error);
            toast.error('Could not mark all as read');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => apiDeleteNotification(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId || '') });
            toast.success('Notification removed');
        },
        onError: (error) => {
            console.error('Error deleting notification:', error);
            toast.error('Could not delete notification');
        }
    });

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return {
        notifications,
        loading: isLoading,
        markingAllRead: markAllReadMutation.isPending,
        unreadCount,
        markAsRead: markReadMutation.mutate,
        markAllAsRead: markAllReadMutation.mutate,
        deleteNotification: deleteMutation.mutate,
        refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications(userId || '') }),
    };
}
