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
import type { FriendWishlistSummary } from '../types';
import './FriendsWishlists.css';

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

            const profilesMap = new Map((profilesData || []).map(p => [p.id, p]));

            const followingList = followingIds.map(id => {
                const profile = profilesMap.get(id);
                return {
                    id,
                    name: profile?.full_name || 'Unknown User',
                    firstName: profile ? getFirstName(profile, 'Friend') : 'Friend',
                };
            });

            const followersList = followersIds.map(id => {
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
        if (loading) {
            // Show skeleton loading state
            return (
                <div className="cards-grid">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <FriendCardSkeleton key={i} />
                    ))}
                </div>
            );
        }

        if (list.length === 0) {
            return (
                <div className="empty-state-card mt-4">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
                        {type === 'friends' ? '🤝' : type === 'following' ? '🎁' : '👥'}
                    </div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                        {type === 'friends' ? 'No Mutual Friends Yet' :
                            type === 'following' ? 'Not Following Anyone' :
                                'No Followers Yet'}
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        {type === 'friends' ? 'Connect with others to see mutual friends here.' :
                            type === 'following' ? "You haven't followed any users to see their wishlists yet." :
                                'No one has followed you yet. Share your profile to get followers!'}
                    </p>
                    {type !== 'followers' && (
                        <Link to="/find-users" className="action-btn-primary">
                            Find People
                        </Link>
                    )}
                </div>
            );
        }

        return (
            <div className="cards-grid">
                {list.map(person => {
                    const isFollowing = following.some(f => f.id === person.id);
                    const isMutual = mutualFriends.some(f => f.id === person.id);

                    return (
                        <Link key={person.id} to={`/wishlist/${person.id}`} className="wishlist-card">
                            <div className="card-image-container flex items-center justify-center bg-muted/30">
                                <div className="friend-avatar scale-150">
                                    {getInitials(person.name)}
                                </div>
                            </div>
                            <div className="card-content">
                                <div className="item-header flex-col items-start gap-1">
                                    <h2 className="item-name">{person.name}</h2>
                                    {isMutual && <span className="mutual-badge ml-0">Mutual Friend</span>}
                                </div>
                                <div className="card-actions mt-auto border-t pt-2">
                                    <div className="owner-actions">
                                        {isFollowing ? (
                                            <button
                                                className="unfollow-btn-small"
                                                onClick={(e) => handleUnfollow(e, person.id)}
                                            >
                                                Unfollow
                                            </button>
                                        ) : (
                                            <button
                                                className="follow-btn-small"
                                                onClick={(e) => handleFollowBack(e, person.id)}
                                            >
                                                Follow Back
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Link>
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
            <SidebarInset className="flex flex-col bg-background overflow-hidden">
                <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b px-4 bg-background">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col">
                                <h1 className="text-lg font-semibold leading-none">Social Network</h1>
                                <p className="text-xs text-muted-foreground mt-1">Friends, followers, and following</p>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto">
                    <div className="flex flex-col gap-4 p-4">
                        <div className="tabs-container mb-0 border-none pb-0">
                            <button
                                className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
                                onClick={() => handleTabChange('friends')}
                            >
                                Friends <span className="tab-count">{mutualFriends.length}</span>
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
                                onClick={() => handleTabChange('following')}
                            >
                                Following <span className="tab-count">{following.length}</span>
                            </button>
                            <button
                                className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
                                onClick={() => handleTabChange('followers')}
                            >
                                Followers <span className="tab-count">{followers.length}</span>
                            </button>
                        </div>
                        {activeTab === 'friends' && renderList(mutualFriends, 'friends')}
                        {activeTab === 'following' && renderList(following, 'following')}
                        {activeTab === 'followers' && renderList(followers, 'followers')}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
};

export default FriendsWishlists;
