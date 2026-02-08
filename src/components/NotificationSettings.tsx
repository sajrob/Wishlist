import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Settings2, Sparkles } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Skeleton } from "@/components/ui/skeleton";

export function NotificationSettings() {
    const { isSubscribed, loading, subscribe, unsubscribe, permission } = usePushNotifications();

    if (loading) {
        return (
            <Card className="border-none shadow-md bg-card ring-1 ring-border overflow-hidden">
                <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-20 w-full" />
                </CardContent>
            </Card>
        );
    }

    const handleToggle = () => {
        if (isSubscribed) {
            unsubscribe();
        } else {
            subscribe();
        }
    };

    return (
        <Card className="border-none shadow-md bg-card ring-1 ring-border overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardHeader className="bg-muted/50 border-b pb-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight">Push Notifications</CardTitle>
                        <CardDescription>Stay updated on claims and connections.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                        <Label className="text-sm font-bold flex items-center gap-2">
                            Enable Notifications
                            {isSubscribed && (
                                <span className="text-[10px] bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">
                                    Active
                                </span>
                            )}
                        </Label>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Receive alerts when someone claims an item from your wishlist or sends you a friend request.
                        </p>
                    </div>
                    <Switch
                        checked={isSubscribed}
                        onCheckedChange={handleToggle}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>

                {permission === 'denied' && (
                    <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3">
                        <BellOff className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-destructive">Notifications Blocked</p>
                            <p className="text-[11px] text-destructive/80 leading-tight">
                                Your browser has blocked notification permissions. Please enable them in your browser settings to receive updates.
                            </p>
                        </div>
                    </div>
                )}

                {isSubscribed && (
                    <div className="pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Settings2 className="w-3.5 h-3.5 text-primary" />
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Notification Types</h4>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold">Wishlist Claims</p>
                                    <p className="text-[10px] text-muted-foreground italic">Notify when someone claims a gift</p>
                                </div>
                                <Switch checked disabled className="scale-75 opacity-50" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-xs font-semibold">Friend Requests</p>
                                    <p className="text-[10px] text-muted-foreground italic">Notify when someone wants to connect</p>
                                </div>
                                <Switch checked disabled className="scale-75 opacity-50" />
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-primary/5 rounded-xl p-4 flex items-start gap-3 border border-primary/10">
                    <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Notifications help you stay connected with your community and ensure you never miss a thoughtful guest from your friends.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
