/**
 * Friends Wishlists page component that manages social connections.
 * Displays mutual friends, people the user follows, and the user's followers,
 * providing links to view their respective wishlists.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { toast } from "sonner";
import { confirmDelete } from '../utils/toastHelpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import { FriendCardSkeleton } from '../components/FriendCardSkeleton';
import { AppSidebar } from "../components/AppSidebar";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { fetchFriends, fetchFollowers, fetchProfiles } from '../utils/supabaseHelpers';
import { getInitials, getFirstName } from '../utils/nameUtils';
import type { FriendWishlistSummary, Profile } from '../types';
import {
    Users,
    UserPlus,
    UserMinus,
    Heart,
    Handshake,
    Sparkles,
    Search,
    ChevronRight,
    Gift
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from '@/lib/utils';
// import './FriendsWishlists.css'; // Removing dependency on old CSS

type ConnectionTab = 'friends' | 'following' | 'followers';

// Module-level cache to persist data across route changes within the same session
let cachedFollowing: FriendWishlistSummary[] | null = null;
let cachedFollowers: FriendWishlistSummary[] | null = null;
let cachedActiveTab: ConnectionTab = 'friends';

// Try to initialize from sessionStorage if available
try {
    const storedFollowing = sessionStorage.getItem('wishlist_cachedFollowing');
    const storedFollowers = sessionStorage.getItem('wishlist_cachedFollowers');
    const storedTab = sessionStorage.getItem('wishlist_activeTab');
    if (storedFollowing && !cachedFollowing) cachedFollowing = JSON.parse(storedFollowing);
    if (storedFollowers && !cachedFollowers) cachedFollowers = JSON.parse(storedFollowers);
    if (storedTab) cachedActiveTab = storedTab as ConnectionTab;
} catch (e) {
    console.error('Error loading cache from sessionStorage:', e);
}

const FriendsWishlists = () => {
    const { user } = useAuth();
    const [following, setFollowing] = useState<FriendWishlistSummary[]>(cachedFollowing || []);
    const [followers, setFollowers] = useState<FriendWishlistSummary[]>(cachedFollowers || []);
    const [activeTab, setActiveTab] = useState<ConnectionTab>(cachedActiveTab);
    const [loading, setLoading] = useState(!cachedFollowing);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (user) {
            void fetchConnections();
        }
    }, [user]);

    const fetchConnections = async () => {
        if (!user) return;
        // Only show loading skeletons if we don't have any data yet
        if (!cachedFollowing || cachedFollowing.length === 0) {
            setLoading(true);
        }
        try {
            // Fetch people YOU follow
            const { data: followingData, error: fError } = await fetchFriends(user.id);
            if (fError) throw fError;

            // Fetch people who follow YOU
            const { data: followersData, error: folError } = await fetchFollowers(user.id);
            if (folError) throw folError;

            const followingIds = (followingData || []).map(f => f.friend_id);
            const followersIds = (followersData || []).map(f => f.user_id);

            // Fetch profiles for everyone involved
            const allIds = Array.from(new Set([...followingIds, ...followersIds]));
            if (allIds.length === 0) {
                setFollowing([]);
                setFollowers([]);
                setLoading(false);
                return;
            }

            const { data: profilesData, error: pError } = await fetchProfiles(allIds);
            if (pError) throw pError;

            const profilesMap = new Map((profilesData as Profile[] || []).map(p => [p.id, p]));

            const followingList: FriendWishlistSummary[] = followingIds.map(id => {
                const profile = profilesMap.get(id);
                return {
                    id,
                    name: profile?.full_name || 'Unknown User',
                    firstName: profile ? getFirstName(profile, 'Friend') : 'Friend',
                };
            });

            const followersList: FriendWishlistSummary[] = followersIds.map(id => {
                const profile = profilesMap.get(id);
                return {
                    id,
                    name: profile?.full_name || 'Unknown User',
                    firstName: profile ? getFirstName(profile, 'User') : 'Friend',
                };
            });

            setFollowing(followingList);
            setFollowers(followersList);
            cachedFollowing = followingList;
            cachedFollowers = followersList;

            // Update sessionStorage
            try {
                sessionStorage.setItem('wishlist_cachedFollowing', JSON.stringify(followingList));
                sessionStorage.setItem('wishlist_cachedFollowers', JSON.stringify(followersList));
            } catch (e) {
                console.error('Error saving cache to sessionStorage:', e);
            }
        } catch (error) {
            console.error('Error fetching connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab: ConnectionTab) => {
        setActiveTab(tab);
        cachedActiveTab = tab;
        sessionStorage.setItem('wishlist_activeTab', tab);
    };

    const mutualFriends = useMemo(() => {
        const followingSet = new Set(following.map(f => f.id));
        return followers.filter(f => followingSet.has(f.id));
    }, [following, followers]);

    const handleUnfollow = async (e: React.MouseEvent, friendId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;

        confirmDelete({
            title: "Unfollow user?",
            description: "You won't be able to see their private wishlists anymore.",
            deleteLabel: "Unfollow",
            onDelete: async () => {
                try {
                    const { error } = await supabase
                        .from('friends')
                        .delete()
                        .eq('user_id', user.id)
                        .eq('friend_id', friendId);

                    if (error) throw error;

                    setFollowing(prev => prev.filter(f => f.id !== friendId));
                    toast.success('Unfollowed successfully');
                } catch (error) {
                    console.error('Error unfollowing user:', error);
                    toast.error('Failed to unfollow user.');
                }
            }
        });
    };

    const handleFollowBack = async (e: React.MouseEvent, userId: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) return;

        try {
            const { error } = await supabase
                .from('friends')
                .insert([{ user_id: user.id, friend_id: userId }]);

            if (error) throw error;

            // Refetch or update state
            void fetchConnections();
            toast.success('Following back!');
        } catch (error) {
            console.error('Error following user:', error);
            toast.error('Failed to follow back.');
        }
    };

    const renderList = (list: FriendWishlistSummary[], type: ConnectionTab) => {
        const filteredList = list.filter(person =>
            person.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (loading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <FriendCardSkeleton key={i} />
                    ))}
                </div>
            );
        }

        if (filteredList.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mb-6 ring-8 ring-primary/5">
                        {type === 'friends' ? <Handshake className="size-10 text-primary/40" /> :
                            type === 'following' ? <Heart className="size-10 text-primary/40" /> :
                                <Users className="size-10 text-primary/40" />}
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {searchQuery ? "No matches found" :
                            type === 'friends' ? 'No Mutual Friends Yet' :
                                type === 'following' ? 'Not Following Anyone' :
                                    'No Followers Yet'}
                    </h2>
                    <p className="text-muted-foreground mt-3 max-w-sm mx-auto leading-relaxed">
                        {searchQuery ? `We couldn't find anyone matching "${searchQuery}" in your ${type}.` :
                            type === 'friends' ? 'Connect with others to see mutual friends here. When you follow someone and they follow you back, they appear here!' :
                                type === 'following' ? "You haven't followed any users to see their wishlists yet. Start discovering people to celebrate with!" :
                                    'No one has followed you yet. Share your profile with friends to start building your network!'}
                    </p>
                    {(type !== 'followers' || searchQuery) && (
                        <div className="mt-8 flex gap-3">
                            {searchQuery && (
                                <Button variant="outline" onClick={() => setSearchQuery('')} className="rounded-xl px-6">
                                    Clear Search
                                </Button>
                            )}
                            <Button asChild className="rounded-xl px-8 shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
                                <Link to="/find-users">
                                    <Sparkles className="size-4 mr-2" />
                                    Find People
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {filteredList.map(person => {
                    const isFollowing = following.some(f => f.id === person.id);
                    const isMutual = mutualFriends.some(f => f.id === person.id);

                    return (
                        <div key={person.id} className="group relative">
                            <Link to={`/wishlist/${person.id}`}>
                                <Card className="overflow-hidden border-muted-foreground/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-card/50 backdrop-blur-sm rounded-[24px]">
                                    <CardContent className="p-3">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="size-14 border-2 border-background shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0">
                                                <AvatarImage src={undefined} />
                                                <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold lowercase">
                                                    {getInitials(person.name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <h3 className="font-bold text-base tracking-tight group-hover:text-primary transition-colors truncate">
                                                        {person.name}
                                                    </h3>
                                                    {isMutual && <Badge className="h-4 px-1.5 bg-green-500/10 text-green-600 border-none text-[8px] font-bold uppercase tracking-wider">Mutual</Badge>}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                                                        <Gift className="size-2.5" />
                                                        View wishlist
                                                    </p>
                                                    <ChevronRight className="size-2.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex gap-2">
                                                {isFollowing ? (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 rounded-full px-3 text-[10px] font-bold bg-muted/50 hover:bg-destructive/10 hover:text-destructive transition-colors border-none shadow-none"
                                                        onClick={(e) => handleUnfollow(e, person.id)}
                                                    >
                                                        Unfollow
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        className="h-8 rounded-full px-3 text-[10px] font-bold gap-1.5 shadow-md hover:shadow-lg active:scale-95 transition-all"
                                                        onClick={(e) => handleFollowBack(e, person.id)}
                                                    >
                                                        <UserPlus className="size-3" />
                                                        Follow
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        </div>
                    );
                })}
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
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 bg-background sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold tracking-tight">Social Network</h1>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-tight opacity-70">Connections & Friends</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-6xl mx-auto flex flex-col gap-4 sm:gap-6 p-4 sm:p-6 lg:p-10">
                        <Tabs
                            value={activeTab}
                            onValueChange={(v) => handleTabChange(v as ConnectionTab)}
                            className="space-y-8"
                        >
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                                <TabsList className="h-11 bg-muted/50 p-1 rounded-xl border-none w-full md:w-auto flex overflow-x-auto no-scrollbar justify-start sm:justify-center md:justify-start">
                                    <TabsTrigger
                                        value="friends"
                                        className="flex-1 md:flex-none h-9 rounded-lg px-2 sm:px-6 gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95 whitespace-nowrap"
                                    >
                                        <Handshake className="size-3.5 shrink-0" />
                                        <span>Friends</span>
                                        <Badge variant="secondary" className="ml-0.5 h-4.5 px-1 min-w-[18px] justify-center bg-white/10 text-inherit border-none pointer-events-none text-[9px]">
                                            {mutualFriends.length}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="following"
                                        className="flex-1 md:flex-none h-9 rounded-lg px-2 sm:px-6 gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95 whitespace-nowrap"
                                    >
                                        <Heart className="size-3.5 shrink-0" />
                                        <span>Following</span>
                                        <Badge variant="secondary" className="ml-0.5 h-4.5 px-1 min-w-[18px] justify-center bg-white/10 text-inherit border-none pointer-events-none text-[9px]">
                                            {following.length}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="followers"
                                        className="flex-1 md:flex-none h-9 rounded-lg px-2 sm:px-6 gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg active:scale-95 whitespace-nowrap"
                                    >
                                        <Users className="size-3.5 shrink-0" />
                                        <span>Followers</span>
                                        <Badge variant="secondary" className="ml-0.5 h-4.5 px-1 min-w-[18px] justify-center bg-white/10 text-inherit border-none pointer-events-none text-[9px]">
                                            {followers.length}
                                        </Badge>
                                    </TabsTrigger>
                                </TabsList>

                                <div className="relative group w-full md:max-w-[240px] transition-all duration-300">
                                    <Input
                                        placeholder="Search connections..."
                                        className="h-10 pl-10 pr-4 text-xs rounded-xl bg-card border-muted-foreground/10 focus-visible:ring-primary/20 transition-all font-medium shadow-sm"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                </div>
                            </div>

                            <TabsContent value="friends" className="m-0 focus-visible:outline-none">
                                {renderList(mutualFriends, 'friends')}
                            </TabsContent>
                            <TabsContent value="following" className="m-0 focus-visible:outline-none">
                                {renderList(following, 'following')}
                            </TabsContent>
                            <TabsContent value="followers" className="m-0 focus-visible:outline-none">
                                {renderList(followers, 'followers')}
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default FriendsWishlists;
