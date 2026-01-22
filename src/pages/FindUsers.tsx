/**
 * Find Users page component that allows users to search for and follow other users.
 */
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlistContext } from '../context/WishlistContext';
import { AppSidebar } from "../components/AppSidebar";
import { PageHeader } from "../components/PageHeader";
import {
    SidebarProvider,
    SidebarInset,
} from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, UserPlus, UserMinus, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from '../utils/nameUtils';
import { useUserSearch } from '../hooks/useUserSearch';
import { FriendCardSkeleton } from '../components/FriendCardSkeleton';
import EmptyState from '../components/EmptyState';

const FindUsers = () => {
    const { user } = useAuth();
    const { categories, loading: wishlistLoading } = useWishlistContext();
    const navigate = useNavigate();

    const {
        query,
        setQuery,
        users,
        friends,
        searching,
        hasSearched,
        setHasSearched,
        searchUsers,
        handleFollow,
        handleUnfollow,
    } = useUserSearch(user?.id);

    const handleSearchSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        void searchUsers(query);
    };

    return (
        <SidebarProvider className="min-h-0 h-[calc(100vh-64px)]">
            <AppSidebar
                activeCategory={null}
                onCategoryChange={(categoryId) => navigate('/dashboard', { state: { categoryId } })}
                categories={categories}
                loading={wishlistLoading}
            />
            <SidebarInset className="flex flex-col bg-background overflow-hidden">
                <PageHeader
                    title="Find Friends"
                />

                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    <div className="max-w-4xl mx-auto flex flex-col gap-8">
                        {/* Search Bar */}
                        <form onSubmit={handleSearchSubmit} className="relative group max-w-xl mx-auto w-full">
                            <Input
                                placeholder="Search by name or @username..."
                                className="h-12 pl-12 pr-4 placeholder:text-xs rounded-2xl shadow-sm border-2"
                                value={query}
                                onChange={(e) => { setQuery(e.target.value); setHasSearched(false); }}
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                            <Button type="submit" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-9 rounded-xl px-4" disabled={searching}>
                                {searching ? <Loader2 className="size-4 animate-spin" /> : "Search"}
                            </Button>
                        </form>

                        {/* Results */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {searching ? (
                                Array.from({ length: 6 }).map((_, i) => (
                                    <FriendCardSkeleton key={i} />
                                ))
                            ) : users.length === 0 && hasSearched ? (
                                <div className="col-span-full">
                                    <EmptyState
                                        title="No users found"
                                        message={`We couldn't find any users matching "${query}"`}
                                        icon={<Search className="size-10 text-muted-foreground/40" />}
                                    />
                                </div>
                            ) : (
                                users.map(profile => {
                                    const isFollowing = friends.has(profile.id);
                                    return (
                                        <Link key={profile.id} to={`/wishlist/${profile.id}`}>
                                            <Card className="hover:shadow-lg transition-all rounded-[24px] border-muted-foreground/10 h-full group">
                                                <CardContent className="p-3">
                                                    <div className="flex items-center gap-4">
                                                        <Avatar className="size-14 border-2 transition-transform group-hover:scale-105">
                                                            <AvatarImage src={profile.avatar_url} />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                                {getInitials(profile.full_name)}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="flex-1 min-w-0">
                                                            {/* 1. NAME */}
                                                            <h3 className="font-bold text-base truncate group-hover:text-primary transition-colors">
                                                                {profile.full_name}
                                                            </h3>

                                                            {/* 2. USERNAME */}
                                                            <div className="flex items-center">
                                                                <span className="truncate text-xs text-muted-foreground">
                                                                    @{profile.username || 'user' + getInitials(profile.full_name).toLowerCase()}
                                                                </span>
                                                            </div>

                                                            {/* 3. STATUS */}
                                                            <p className="text-[10px] mt-1 text-muted-foreground font-medium uppercase tracking-wider opacity-70">
                                                                {isFollowing ? "Following" : "Discovering"}
                                                            </p>
                                                        </div>

                                                        <div className="shrink-0">
                                                            {isFollowing ? (
                                                                <Button
                                                                    variant="secondary"
                                                                    size="sm"
                                                                    className="h-8 rounded-full text-[10px] font-bold bg-red-500/10 hover:bg-red-500/20 hover:text-red-600 transition-colors"
                                                                    onClick={(e) => { e.preventDefault(); handleUnfollow(profile.id, profile.full_name); }}
                                                                >
                                                                    <UserMinus className="size-3 mr-1 text-red-500" />
                                                                    <span className="hidden min-[340px]:inline">Unfollow</span>
                                                                </Button>
                                                            ) : (
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 rounded-full text-[10px] font-bold active:scale-95 transition-all"
                                                                    onClick={(e) => { e.preventDefault(); handleFollow(profile.id, profile.full_name); }}
                                                                >
                                                                    <UserPlus className="size-3 mr-1" />
                                                                    <span className="hidden min-[340px]:inline">Follow</span>
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default FindUsers;