/**
 * Friends Wishlists page component that manages social connections.
 * Displays mutual friends, people the user follows, and the user's followers,
 * providing links to view their respective wishlists.
 */
import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistContext } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { FriendCardSkeleton } from '../components/FriendCardSkeleton';
import { AppSidebar } from "../components/AppSidebar";
import { PageHeader } from "../components/PageHeader";
import {
    SidebarProvider,
    SidebarInset,
} from "@/components/ui/sidebar";
import { getInitials } from '../utils/nameUtils';
import { useFriends } from '../hooks/useFriends';
import {
    Users,
    UserPlus,
    Heart,
    Handshake,
    Search,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ConnectionTab = 'friends' | 'following' | 'followers';

const FriendsWishlists = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { categories, loading: wishlistLoading } = useWishlistContext();
    const [activeTab, setActiveTab] = useState<ConnectionTab>('friends');
    const [searchQuery, setSearchQuery] = useState('');

    const {
        following,
        followers,
        mutualFriends,
        loading,
        handleUnfollow,
        handleFollowBack,
    } = useFriends(user?.id);

    const handleTabChange = (tab: ConnectionTab) => {
        setActiveTab(tab);
    };

    const renderList = (list: typeof following, type: ConnectionTab) => {
        const filteredList = list.filter(person =>
            person.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            person.username?.toLowerCase().includes(searchQuery.toLowerCase())
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
                            type === 'friends' ? 'Connect with others to see mutual friends here.' :
                                type === 'following' ? "You haven't followed any users yet." :
                                    'No one has followed you yet.'}
                    </p>
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
                                            <div className="relative shrink-0">
                                                <Avatar className="size-14 border-2 border-background shadow-md group-hover:scale-105 transition-transform duration-300">
                                                    <AvatarImage src={person.avatar_url} />
                                                    <AvatarFallback className="text-lg bg-primary/10 text-primary font-bold uppercase">
                                                        {getInitials(person.full_name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {isMutual && (
                                                    <Badge className="absolute bottom-0 left-1 h-4 px-1.5 bg-green-800 text-green-100 border-none text-[8px] font-bold uppercase tracking-wider">
                                                        Mutual
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="flex items-center gap-1.5 mb-0.5">
                                                    <h3 className="font-bold text-base tracking-tight group-hover:text-primary transition-colors truncate">
                                                        {person.full_name}
                                                    </h3>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="truncate text-xs text-muted-foreground">
                                                        @{person.username || `user${getInitials(person.full_name).toLowerCase()}`}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex gap-2">
                                                {isFollowing ? (
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        className="h-8 rounded-full px-3 text-[10px] font-bold bg-muted/70 hover:bg-destructive/10 hover:text-destructive transition-colors border border-red-400/30 shadow-none"
                                                        onClick={(e) => handleUnfollow(person.id, person.full_name, e)}
                                                    >
                                                        Unfollow
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        className="h-8 rounded-full px-3 text-[10px] font-bold gap-1.5 shadow-md hover:shadow-lg active:scale-95 transition-all"
                                                        onClick={(e) => handleFollowBack(person.id, person.full_name, e)}
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
                onCategoryChange={(categoryId) => navigate('/dashboard', { state: { categoryId } })}
                categories={categories}
                loading={wishlistLoading}
            />
            <SidebarInset className="flex flex-col bg-background overflow-hidden font-sans">
                <PageHeader
                    title="Social Network"
                    subtitle="Connections & Friends"
                />

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
                                        className="flex-1 md:flex-none h-9 rounded-lg px-2 sm:px-6 gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
                                    >
                                        <span>Friends</span>
                                        <Badge variant="secondary" className="ml-0.5 h-4.5 px-1 min-w-[18px] justify-center bg-white/10 text-inherit border-none pointer-events-none text-[9px]">
                                            {mutualFriends.length}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="following"
                                        className="flex-1 md:flex-none h-9 rounded-lg px-2 sm:px-6 gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
                                    >
                                        <span>Following</span>
                                        <Badge variant="secondary" className="ml-0.5 h-4.5 px-1 min-w-[18px] justify-center bg-white/10 text-inherit border-none pointer-events-none text-[9px]">
                                            {following.length}
                                        </Badge>
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="followers"
                                        className="flex-1 md:flex-none h-9 rounded-lg px-2 sm:px-6 gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-bold transition-all data-[state=active]:bg-primary data-[state=active]:text-white"
                                    >
                                        <span>Followers</span>
                                        <Badge variant="secondary" className="ml-0.5 h-4.5 px-1 min-w-[18px] justify-center bg-white/10 text-inherit border-none pointer-events-none text-[9px]">
                                            {followers.length}
                                        </Badge>
                                    </TabsTrigger>
                                </TabsList>

                                <div className="relative group w-full md:max-w-[240px]">
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