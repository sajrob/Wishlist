/**
 * Find Users page component that allows users to search for and follow other users.
 * Facilitates social interaction by letting users discover and view friends' wishlists.
 */
import React, { useState, useEffect } from 'react';
import { toast } from "sonner";
import { confirmDelete } from '../utils/toastHelpers';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistContext } from '../context/WishlistContext';
import { AppSidebar } from "../components/AppSidebar";
import {
    SidebarProvider,
    SidebarInset,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, UserMinus, User, Sparkles, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from '../utils/nameUtils';
import { Card, CardContent } from '@/components/ui/card';

type ProfileRecord = {
    id: string;
    full_name: string;
    avatar_url?: string;
};

const FindUsers = () => {
    const { user } = useAuth();
    const { categories, loading: wishlistLoading } = useWishlistContext();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<ProfileRecord[]>([]);
    const [friends, setFriends] = useState<Set<string>>(new Set());
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            void fetchFriends();
        }
    }, [user]);

    const fetchFriends = async () => {
        if (!user) return;
        try {
            const { data, error } = await supabase.from('friends').select('friend_id').eq('user_id', user.id);

            if (error) throw error;

            const friendPars = new Set((data || []).map(f => f.friend_id));
            setFriends(friendPars);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const searchUsers = async (searchQuery: string) => {
        if (!user) return;

        if (!searchQuery.trim()) {
            setUsers([]);
            return;
        }

        setSearching(true);
        try {
            let queryBuilder = supabase.from('profiles').select('*').neq('id', user.id).limit(20);

            if (searchQuery) {
                queryBuilder = queryBuilder.ilike('full_name', `%${searchQuery}%`);
            }

            const { data, error } = await queryBuilder;

            if (error) throw error;
            setUsers((data || []) as ProfileRecord[]);
            setHasSearched(true);
        } catch (error) {
            console.error('Error searching users:', error);
            toast.error("Search failed. Please try again.");
        } finally {
            setSearching(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setHasSearched(false);
    };

    const handleSearchSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        void searchUsers(query);
    };

    const handleFollow = async (friendId: string, name: string) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('friends').insert([{ user_id: user.id, friend_id: friendId }]);

            if (error) throw error;

            setFriends(prev => new Set(prev).add(friendId));
            toast.success(`You are now following ${name}!`);
        } catch (error) {
            console.error('Error following user:', error);
            toast.error('Could not follow user.');
        }
    };

    const handleUnfollow = async (friendId: string, name: string) => {
        if (!user) return;

        confirmDelete({
            title: `Unfollow ${name}?`,
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

                    setFriends(prev => {
                        const next = new Set(prev);
                        next.delete(friendId);
                        return next;
                    });
                    toast.success(`Unfollowed ${name}`);
                } catch (error) {
                    console.error('Error unfollowing user:', error);
                    toast.error('Could not unfollow user.');
                }
            }
        });
    };

    return (
        <SidebarProvider className="min-h-0 h-[calc(100vh-64px)]">
            <AppSidebar
                activeCategory={null}
                onCategoryChange={(categoryId) => navigate('/dashboard', { state: { categoryId } })}
                categories={categories}
                loading={wishlistLoading}
            />
            <SidebarInset className="flex flex-col bg-background overflow-hidden font-sans">
                <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b px-6 bg-background sticky top-0 z-10">
                    <div className="flex items-center gap-3 w-full">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="h-4" />
                        <div className="flex flex-col">
                            <h1 className="text-lg font-bold tracking-tight">Find Friends</h1>
                            <p className="text-xs text-muted-foreground">Discover other people and see their wishlists</p>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8">
                    <div className="max-w-3xl mx-auto flex flex-col gap-6 sm:gap-8">
                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative group max-w-xl mx-auto w-full transition-all duration-300">
                            <Input
                                type="text"
                                placeholder="Search by name..."
                                className="h-11 sm:h-12 pl-11 sm:pl-12 pr-4 text-sm sm:text-base rounded-2xl shadow-sm border-2 border-muted-foreground/10 focus-visible:ring-primary/20 focus-visible:border-primary transition-all bg-card/50 backdrop-blur-sm"
                                value={query}
                                onChange={handleSearchChange}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Button
                                type="submit"
                                size="sm"
                                className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 h-8 sm:h-9 rounded-xl px-3 sm:px-4 text-xs font-bold sm:font-semibold shadow-none active:scale-95 transition-all"
                                disabled={searching}
                            >
                                {searching ? <Loader2 className="size-3.5 sm:size-4 animate-spin" /> : "Search"}
                            </Button>
                        </form>

                        {/* Results */}
                        <div className="space-y-4">
                            {searching ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[1, 2, 3, 4].map(n => (
                                        <div key={n} className="p-4 bg-card border rounded-2xl flex items-center gap-4 animate-pulse">
                                            <div className="size-12 rounded-full bg-muted" />
                                            <div className="space-y-2 flex-1">
                                                <div className="h-4 w-1/2 bg-muted rounded" />
                                                <div className="h-3 w-1/4 bg-muted rounded" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : users.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in duration-500">
                                    {hasSearched ? (
                                        <>
                                            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
                                                <Search className="size-10 text-muted-foreground/40" />
                                            </div>
                                            <h2 className="text-xl font-bold">No results found</h2>
                                            <p className="text-muted-foreground mt-2 max-w-xs">
                                                We couldn't find anyone matching "{query}". Try a different name?
                                            </p>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-6">
                                                <Sparkles className="size-10 text-primary/40" />
                                            </div>
                                            <h2 className="text-xl font-bold text-foreground">Find Your People</h2>
                                            <p className="text-muted-foreground mt-2 max-w-xs">
                                                Search for friends, family, or colleagues to see their public wishlists and start celebrating!
                                            </p>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {users.map(profile => {
                                        const isFollowing = friends.has(profile.id);
                                        return (
                                            <div
                                                key={profile.id}
                                                className="group relative"
                                            >
                                                <Card className="overflow-hidden border-muted-foreground/10 hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 bg-card/50 backdrop-blur-sm rounded-[24px]">
                                                    <CardContent className="p-3">
                                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                                            <Avatar className="size-12 sm:size-14 border shadow-sm group-hover:scale-105 transition-transform duration-300 shrink-0">
                                                                <AvatarImage src={profile.avatar_url} />
                                                                <AvatarFallback className="text-base sm:text-lg bg-primary/5 text-primary font-bold">
                                                                    {getInitials(profile.full_name)}
                                                                </AvatarFallback>
                                                            </Avatar>

                                                            <div className="flex-1 min-w-0">
                                                                <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors text-sm sm:text-base">
                                                                    {profile.full_name}
                                                                </h3>
                                                                <p className="text-[10px] sm:text-xs text-muted-foreground font-medium uppercase tracking-tight">
                                                                    {isFollowing ? "Following" : "Discovering"}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="flex-1 gap-2 items-center w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-none border-dashed">
                                                            {isFollowing ? (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        onClick={() => handleFollow(profile.id, profile.full_name)}
                                                                        className="absolute top-6 right-8 h-9 sm:h-8 w-auto sm:w-auto rounded-xl px-5 text-[11px] font-bold gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all"
                                                                    >
                                                                        <UserMinus className="size-4" />
                                                                        Unfollow
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => handleFollow(profile.id, profile.full_name)}
                                                                    className="h-9 absolute top-6 right-8 sm:h-8 w-auto sm:w-auto rounded-xl px-5 text-[11px] font-bold gap-2 shadow-md hover:shadow-lg active:scale-95 transition-all"
                                                                >
                                                                    <UserPlus className="size-4" />
                                                                    Follow
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default FindUsers;


