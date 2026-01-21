/**
 * Notifications page component that displays user-specific alerts and updates with a modern, premium UI.
 * Shows activity such as new followers and wishlist shares using Tailwind CSS.
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { AppSidebar } from "../components/AppSidebar";
import { PageHeader } from "../components/PageHeader";
import {
    SidebarProvider,
    SidebarInset,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Bell, UserPlus, Gift, CheckCheck, Trash2, ArrowRight } from "lucide-react";
import { useNotifications } from "../hooks/useNotifications";

const Notifications = () => {
    const { user } = useAuth();
    const {
        notifications,
        loading,
        markingAllRead,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications(user?.id);

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

    return (
        <SidebarProvider className="min-h-0 h-[calc(100vh-64px)]">
            <AppSidebar
                activeCategory={null}
                onCategoryChange={() => { }}
                categories={[]}
            />
            <SidebarInset className="flex flex-col bg-background overflow-hidden font-sans">
                <PageHeader
                    title="Notifications"
                    subtitle="Stay updated with your wishlist activity"
                    actions={
                        unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => markAllAsRead()}
                                disabled={markingAllRead}
                                className="text-xs font-semibold gap-2 hover:bg-primary/5 hover:text-primary transition-colors h-8 px-3 rounded-full"
                            >
                                <CheckCheck className="size-3.5" />
                                Mark all as read
                            </Button>
                        )
                    }
                />

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
                                            {notification.actor?.full_name && (
                                                <span className="font-bold text-foreground">
                                                    {notification.actor.full_name}{' '}
                                                </span>
                                            )}
                                            {notification.type === 'follow'
                                                ? 'started following you.'
                                                : notification.type === 'wishlist_share'
                                                    ? 'shared a wishlist category with you.'
                                                    : notification.message}
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
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                void deleteNotification(notification.id);
                                            }}
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
