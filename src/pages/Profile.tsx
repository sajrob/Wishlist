/**
 * Profile page component that allows users to view and update their account information.
 */
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useAuth } from '../context/AuthContext';
import { useProfile } from '../hooks/useProfile';
import { useUpdateProfile } from '../hooks/useUpdateProfile';
import { useUserStats } from '../hooks/useUserStats';
import { Skeleton } from "@/components/ui/skeleton";
import { getInitials } from '../utils/nameUtils';
import './Profile.css';

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
        <div className="profile-container max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-6 pb-8 border-b">
                {profileLoading ? (
                    <>
                        <Skeleton className="w-24 h-24 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                            {getInitials(formData.full_name)}
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-3xl font-bold tracking-tight">{formData.full_name || 'User'}</h1>
                            <p className="text-muted-foreground">{formData.email}</p>
                        </div>
                    </>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <h2 className="text-xl font-semibold">Overview</h2>
                    <div className="grid grid-cols-1 gap-4">
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Wishlist Items</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                {statsLoading ? (
                                    <Skeleton className="h-9 w-12" />
                                ) : (
                                    <div className="text-3xl font-bold text-primary">{stats?.items || 0}</div>
                                )}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Categories</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                {statsLoading ? (
                                    <Skeleton className="h-9 w-12" />
                                ) : (
                                    <div className="text-3xl font-bold text-primary">{stats?.categories || 0}</div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                    <h2 className="text-xl font-semibold">Account Settings</h2>
                    <Card>
                        <form onSubmit={handleUpdateProfile}>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input
                                            id="username"
                                            value={formData.username}
                                            onChange={e => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                            placeholder="username"
                                            className="font-mono bg-muted/30"
                                        />
                                        <p className="text-xs text-muted-foreground">This will be your unique handle.</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="first_name">First Name</Label>
                                            <Input
                                                id="first_name"
                                                value={formData.first_name}
                                                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                                                placeholder="First Name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="last_name">Last Name</Label>
                                            <Input
                                                id="last_name"
                                                value={formData.last_name}
                                                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                                                placeholder="Last Name"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        disabled
                                        className="bg-muted text-muted-foreground cursor-not-allowed border-dashed"
                                    />
                                    <p className="text-xs text-muted-foreground pt-1">Email cannot be changed.</p>
                                </div>
                            </CardContent>
                            <CardFooter className="p-6 bg-muted/20 border-t flex justify-end">
                                <Button type="submit" disabled={loading} className="px-8 font-semibold">
                                    {updateProfileMutation.isPending ? 'Saving Changes...' : 'Save Changes'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
