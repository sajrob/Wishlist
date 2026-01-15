/**
 * Notifications page component that displays user-specific alerts and updates with a modern, premium UI.
 * Shows activity such as new followers and wishlist shares using Tailwind CSS.
 */
import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Notification } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import { AppSidebar } from "../components/AppSidebar";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, UserPlus, Gift, CheckCheck, Trash2, ArrowRight, Circle } from "lucide-react";
import { toast } from "sonner";

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [markingAllRead, setMarkingAllRead] = useState(false);

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
            toast.error('Could not load notifications');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
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
        }
    };

    const markAllAsRead = async () => {
        if (notifications.every(n => n.is_read)) return;

        setMarkingAllRead(true);
        try {
            const { error } = await supabase
                .from('notifications')
                .update({ is_read: true })
                .eq('user_id', user!.id)
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
    };

    const deleteNotification = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
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
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.abs(now.getTime() - date.getTime()) / 36e5;

        if (diffInHours < 24 && date.getDate() === now.getDate()) {
            return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }

        return date.toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'follow':
                return <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><UserPlus className="size-5" /></div>;
            case 'wishlist_share':
                return <div className="p-2 bg-pink-100 text-pink-600 rounded-full"><Gift className="size-5" /></div>;
            default:
                return <div className="p-2 bg-gray-100 text-gray-600 rounded-full"><Bell className="size-5" /></div>;
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <SidebarProvider className="min-h-0 h-[calc(100vh-64px)]">
            <AppSidebar
                activeCategory={null}
                onCategoryChange={() => { }}
                categories={[]}
            />
            <SidebarInset className="flex flex-col bg-background overflow-hidden font-sans">
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-6 bg-background sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold tracking-tight">Notifications</h1>
                            <p className="text-xs text-muted-foreground">Stay updated with your wishlist activity</p>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={markAllAsRead}
                            disabled={markingAllRead}
                            className="text-xs font-semibold gap-2 hover:bg-primary/5 hover:text-primary transition-colors h-8 px-3 rounded-full"
                        >
                            <CheckCheck className="size-3.5" />
                            Mark all as read
                        </Button>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
                    <div className="max-w-2xl mx-auto space-y-3">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="flex gap-4 p-4 items-center bg-card border rounded-2xl">
                                    <Skeleton className="size-10 rounded-full shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-[80%]" />
                                        <Skeleton className="h-3 w-[40%]" />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                    <Bell className="size-10 text-muted-foreground/40" />
                                </div>
                                <h2 className="text-xl font-bold">All caught up!</h2>
                                <p className="text-muted-foreground mt-2 max-w-xs">
                                    You don't have any notifications right now. We'll let you know when things happen!
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    to={
                                        notification.type === 'follow'
                                            ? `/wishlist/${notification.actor_id}`
                                            : notification.type === 'wishlist_share'
                                                ? `/wishlist/${notification.actor_id}?category=${notification.category_id}`
                                                : '#'
                                    }
                                    className={`group relative flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md hover:border-primary/20 ${!notification.is_read
                                        ? 'bg-blue-50/40 border-blue-100/50 shadow-sm'
                                        : 'bg-card border-border hover:bg-muted/30'
                                        }`}
                                    onClick={() => {
                                        if (!notification.is_read) {
                                            void markAsRead(notification.id);
                                        }
                                    }}
                                >
                                    <div className="shrink-0 relative">
                                        {getIcon(notification.type)}
                                        {!notification.is_read && (
                                            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-600 border-2 border-white"></span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 pr-8">
                                        <p className={`text-sm md:text-base mb-1 ${!notification.is_read ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                            {notification.message}
                                        </p>
                                        <span className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-wider flex items-center gap-2">
                                            {formatDate(notification.created_at)}
                                            {!notification.is_read && (
                                                <>
                                                    <span className="size-1 bg-muted-foreground/40 rounded-full" />
                                                    <span className="text-blue-600 font-bold">New</span>
                                                </>
                                            )}
                                        </span>
                                    </div>

                                    <div className="absolute right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                            onClick={(e) => deleteNotification(notification.id, e)}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                        <ArrowRight className="size-4 text-muted-foreground/40" />
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default Notifications;
