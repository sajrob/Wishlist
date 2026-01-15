/**
 * Notifications page component that displays user-specific alerts and updates.
 * Shows activity such as new followers and allows users to mark notifications as read.
 */
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types';
import { Link } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            void fetchNotifications();
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user!.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
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
            // Revert changes if needed, but for is_read it's usually fine to ignore
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) return <div className="loading-spinner">Loading notifications...</div>;

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h1>Notifications</h1>
            </div>

            <div className="notifications-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        No notifications yet.
                    </div>
                ) : (
                    notifications.map(notification => (
                        <Link
                            to={
                                notification.type === 'follow'
                                    ? `/wishlist/${notification.actor_id}`
                                    : notification.type === 'wishlist_share'
                                        ? `/wishlist/${notification.actor_id}?category=${notification.category_id}`
                                        : '#'
                            }
                            key={notification.id}
                            className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                            onClick={() => {
                                if (!notification.is_read) {
                                    void markAsRead(notification.id);
                                }
                            }}
                        >
                            <div className="notification-icon">
                                {notification.type === 'follow' ? '👤' : notification.type === 'wishlist_share' ? '🎁' : '🔔'}
                            </div>
                            <div className="notification-content">
                                <p className="notification-message">{notification.message}</p>
                                <span className="notification-time">{formatDate(notification.created_at)}</span>
                            </div>
                            {!notification.is_read && (
                                <div className="notification-status" title="Unread"></div>
                            )}
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
