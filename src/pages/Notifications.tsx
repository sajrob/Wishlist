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
import { formatDate } from "../utils/dateUtils";

const NOTIFICATION_ICONS = {
    follow: {
        icon: UserPlus,
        bgColor: 'bg-blue-100',
        textColor: 'text-blue-600'
    },
    wishlist_share: {
        icon: Gift,
        bgColor: 'bg-pink-100',
        textColor: 'text-pink-600'
    },
    default: {
        icon: Bell,
        bgColor: 'bg-gray-100',
        textColor: 'text-gray-600'
    }
} as const;

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

    const getIcon = (type: string) => {
        const config = NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS] || NOTIFICATION_ICONS.default;
        const Icon = config.icon;
        return (
            <div className={`p-2 ${config.bgColor} ${config.textColor} rounded-full`}>
                <Icon className="size-5" />
            </div>
        );
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
                    <div className="max-w-2xl mx-auto space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
