import React, { useState, useEffect, useMemo } from 'react';
import { toast } from "sonner";
import { confirmDelete } from '../utils/toastHelpers';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchFriends, fetchFollowers, fetchProfiles } from '../utils/supabaseHelpers';
import { getInitials, getFirstName } from '../utils/nameUtils';
import type { FriendWishlistSummary } from '../types';
import './FriendsWishlists.css';

type ConnectionTab = 'friends' | 'following' | 'followers';

const FriendsWishlists = () => {
    const { user } = useAuth();
    const [following, setFollowing] = useState<FriendWishlistSummary[]>([]);
    const [followers, setFollowers] = useState<FriendWishlistSummary[]>([]);
    const [activeTab, setActiveTab] = useState<ConnectionTab>('friends');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            void fetchConnections();
        }
    }, [user]);

    const fetchConnections = async () => {
        if (!user) return;
        setLoading(true);
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
        } catch (error) {
            console.error('Error fetching connections:', error);
        } finally {
            setLoading(false);
        }
    };

    const mutualFriends = useMemo(() => {
        const followingSet = new Set(following.map(f => f.id));
        return followers.filter(f => followingSet.has(f.id));
    }, [following, followers]);

    const handleUnfollow = async (e: React.MouseEvent, friendId: string) => {
        e.preventDefault();
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
        if (list.length === 0) {
            return (
                <div className="empty-state-card">
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
            <div className="wishlists-list">
                {list.map(person => {
                    const isFollowing = following.some(f => f.id === person.id);
                    const isMutual = mutualFriends.some(f => f.id === person.id);

                    return (
                        <Link key={person.id} to={`/wishlist/${person.id}`} className="friend-list-item">
                            <div className="friend-item-main">
                                <div className="friend-avatar">
                                    {getInitials(person.name)}
                                </div>
                                <div className="friend-info">
                                    <span className="friend-name">
                                        {person.name}
                                        {isMutual && <span className="mutual-badge">Mutual</span>}
                                    </span>
                                </div>
                            </div>

                            <div className="friend-item-meta">
                                <div className="friend-actions">
                                    {isFollowing ? (
                                        <button
                                            className="unfollow-btn-small"
                                            onClick={(e) => handleUnfollow(e, person.id)}
                                            title="Unfollow"
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
                        </Link>
                    );
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh' }}>
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="friends-wishlists-container">
            <div className="friends-wishlists-header">
                <h1>Social Network</h1>
                <p>Manage your friends, followers, and following</p>
            </div>

            <div className="tabs-container">
                <button
                    className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
                    onClick={() => setActiveTab('friends')}
                >
                    Friends <span className="tab-count">{mutualFriends.length}</span>
                </button>
                <button
                    className={`tab-btn ${activeTab === 'following' ? 'active' : ''}`}
                    onClick={() => setActiveTab('following')}
                >
                    Following <span className="tab-count">{following.length}</span>
                </button>
                <button
                    className={`tab-btn ${activeTab === 'followers' ? 'active' : ''}`}
                    onClick={() => setActiveTab('followers')}
                >
                    Followers <span className="tab-count">{followers.length}</span>
                </button>
            </div>

            {activeTab === 'friends' && renderList(mutualFriends, 'friends')}
            {activeTab === 'following' && renderList(following, 'following')}
            {activeTab === 'followers' && renderList(followers, 'followers')}
        </div>
    );
};

export default FriendsWishlists;
