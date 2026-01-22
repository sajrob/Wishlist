/**
 * Profile page component that allows users to view and update their account information.
 * Redesigned for a modern, premium look without glassmorphism.
 */
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useUserStats } from '../hooks/useUserStats';
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from '../utils/nameUtils';
import {
    User,
    Mail,
    AtSign,
    Settings,
    LayoutGrid,
    Package,
    ShieldCheck,
    Camera,
    CheckCircle2,
    Users,
    Link
} from 'lucide-react';
import { cn } from '@/lib/utils';

type ProfileForm = {
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
};

const Profile = () => {
    const { user } = useAuth();
    const { data: profile, isLoading: profileLoading } = useProfile(user?.id || null);
    const { data: stats, isLoading: statsLoading } = useUserStats(user?.id || undefined);
    const updateProfileMutation = useUpdateProfile();

    const [formData, setFormData] = useState<ProfileForm>({
        username: '',
        first_name: '',
        last_name: '',
        full_name: '',
        email: '',
    });

    useEffect(() => {
        if (user) {
            const meta = user.user_metadata || {};
            let firstName = meta.first_name || '';
            let lastName = meta.last_name || '';

            if (!firstName && meta.full_name) {
                const names = meta.full_name.trim().split(' ');
                firstName = names[0];
                lastName = names.slice(1).join(' ');
            }

            setFormData({
                first_name: firstName,
                last_name: lastName,
                full_name: meta.full_name || '',
                email: user.email || '',
                username: profile?.username || meta.username || '',
            });
        }
    }, [user, profile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const fullName = `${formData.first_name} ${formData.last_name}`.trim();
        await updateProfileMutation.mutateAsync({
            id: user.id,
            first_name: formData.first_name,
            last_name: formData.last_name,
            full_name: fullName,
            username: formData.username,
        });
    };

    const loading = profileLoading || updateProfileMutation.isPending;

    return (
        <div className="min-h-screen bg-background pb-12">
            <main className="max-w-5xl mx-auto px-4 py-6">
                <Tabs defaultValue="settings" className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Form */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-md overflow-hidden bg-card ring-1 ring-border">
                                <CardHeader className="bg-muted/50 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl md:text-xl font-bold tracking-tight text-foreground">
                                                {formData.full_name || 'Your Profile'}
                                            </CardTitle>
                                            <CardDescription>
                                                <span className="font-medium">@{formData.username || 'username'}</span>
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <form onSubmit={handleUpdateProfile}>
                                    <CardContent className="p-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="first_name" className="text-sm font-semibold">First Name</Label>
                                                <Input
                                                    id="first_name"
                                                    value={formData.first_name}
                                                    onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                                    placeholder="Jane"
                                                    className="h-11 focus-visible:ring-primary"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="last_name" className="text-sm font-semibold">Last Name</Label>
                                                <Input
                                                    id="last_name"
                                                    value={formData.last_name}
                                                    onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                                    placeholder="Doe"
                                                    className="h-11 focus-visible:ring-primary"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="username" className="text-sm font-semibold flex items-center gap-2">
                                                Username
                                                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Public handle</span>
                                            </Label>
                                            <div className="relative">
                                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="username"
                                                    value={formData.username}
                                                    onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                                    placeholder="username"
                                                    className="pl-10 h-11 font-mono focus-visible:ring-primary"
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground">Use letters, numbers, and underscores only. This is how friends find you.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2 text-muted-foreground">
                                                Email Address
                                                <ShieldCheck className="w-3 h-3" />
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={formData.email}
                                                    disabled
                                                    className="pl-10 h-11 bg-muted/50 text-muted-foreground cursor-not-allowed border-dashed focus-visible:ring-0"
                                                />
                                            </div>
                                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3 text-green-500" />
                                                Your email is verified and cannot be changed.
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-6 bg-muted/30 border-t flex justify-between items-center">
                                        <p className="text-xs text-muted-foreground max-w-[200px]">
                                            Last updated: {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'New Account'}
                                        </p>
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="px-8 h-11 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
                                        >
                                            {updateProfileMutation.isPending ? 'Saving...' : 'Save Settings'}
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        </div>

                        {/* Right Column - Sideways Stats/Info */}
                        <div className="space-y-6">
                            <Card className="border-none shadow-md bg-primary text-primary-foreground overflow-hidden h-fit">
                                <div className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-lg text-white font-bold">Quick Stats</h3>
                                        <p className="text-primary-foreground/70 text-sm">Your activity at a glance.</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex flex-col items-center text-center">
                                            <Package className="w-4 h-4 mb-1 opacity-80" />
                                            <div className="text-xl font-black">
                                                {statsLoading ? "..." : stats?.items || 0}
                                            </div>
                                            <div className="text-[9px] uppercase font-bold tracking-widest opacity-70">Items</div>
                                        </div>
                                        <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex flex-col items-center text-center">
                                            <LayoutGrid className="w-4 h-4 mb-1 opacity-80" />
                                            <div className="text-xl font-black">
                                                {statsLoading ? "..." : stats?.categories || 0}
                                            </div>
                                            <div className="text-[9px] uppercase font-bold tracking-widest opacity-70">Wishlists</div>
                                        </div>
                                        <div className="bg-white/10 p-3 rounded-xl border border-white/10 flex flex-col items-center text-center">
                                            <Users className="w-4 h-4 mb-1 opacity-80" />
                                            <div className="text-xl font-black">
                                                {statsLoading ? "..." : stats?.friends || 0}
                                            </div>
                                            <div className="text-[9px] uppercase font-bold tracking-widest opacity-70">Friends</div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                                            Account Active
                                        </div>
                                    </div>
                                </div>
                            </Card>

                            <Card className="border-none shadow-md bg-card ring-1 ring-border">
                                <CardHeader className="p-4 pb-0">
                                    <CardTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-tighter">
                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                        Security
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 space-y-3">
                                    <p className="text-xs text-muted-foreground">Your account is secured with Supabase Auth.</p>
                                    <Button variant="outline" size="sm" className="w-full bg-slate-500 text-primary-foreground text-xs font-semibold py-4" >
                                        <a href="/forgot-password">Reset Password</a>
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <TabsContent value="stats" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Card className="border-none shadow-md bg-card ring-1 ring-border">
                            <CardContent className="p-12 text-center space-y-4">
                                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center text-muted-foreground">
                                    <LayoutGrid className="w-8 h-8" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-bold">Activity Dashboard</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        Detailed analytics and activity history will be available soon. Keep sharing your wishlist to see more insights!
                                    </p>
                                </div>
                                <Button variant="secondary" onClick={() => window.location.href = '/'}>
                                    Go to Wishlist
                                </Button>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
};

export default Profile;

