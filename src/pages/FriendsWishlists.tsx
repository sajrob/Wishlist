import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchFriends, fetchProfiles } from '../utils/supabaseHelpers';
import { getInitials, getFirstName } from '../utils/nameUtils';
import type { FriendWishlistSummary } from '../types';
import './FriendsWishlists.css';

const FriendsWishlists = () => {
    const { user } = useAuth();
    const [friendsWishlists, setFriendsWishlists] = useState<FriendWishlistSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            void fetchFriendsWishlists();
        }
    }, [user]);

    const fetchFriendsWishlists = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const { data: friendsData, error: friendsError } = await fetchFriends(user.id);

            if (friendsError) throw friendsError;

            if (!friendsData || friendsData.length === 0) {
                setFriendsWishlists([]);
                setLoading(false);
                return;
            }

            const friendIds = friendsData.map(f => f.friend_id);

            const { data: profilesData, error: profilesError } = await fetchProfiles(friendIds);

            if (profilesError) throw profilesError;

            const combined = (profilesData || []).map(profile => ({
                id: profile.id,
                name: profile.full_name,
                firstName: getFirstName(profile, 'Friend'),
            }));

            setFriendsWishlists(combined);
        } catch (error) {
            console.error('Error fetching friends wishlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUnfollow = async (e: React.MouseEvent, friendId: string) => {
        e.preventDefault(); // Prevent navigating to the wishlist
        if (!user || !confirm('Are you sure you want to unfollow this user?')) return;

        try {
            const { error } = await supabase
                .from('friends')
                .delete()
                .eq('user_id', user.id)
                .eq('friend_id', friendId);

            if (error) throw error;

            setFriendsWishlists(prev => prev.filter(f => f.id !== friendId));
        } catch (error) {
            console.error('Error unfollowing user:', error);
            alert('Failed to unfollow user.');
        }
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
                <h1>Friends' Wishlists</h1>
                <p>Browse public wishlists from people you're following</p>
            </div>

            {friendsWishlists.length === 0 ? (
                <div className="empty-state-card">
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>No Public Wishlists Yet</h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        None of your friends have made their wishlists public yet, or you haven't followed anyone.
                    </p>
                    <Link to="/find-users" className="action-btn-primary">
                        Find Friends
                    </Link>
                </div>
            ) : (
                <div className="wishlists-list">
                    {friendsWishlists.map(friend => (
                        <Link key={friend.id} to={`/wishlist/${friend.id}`} className="friend-list-item">
                            <div className="friend-item-main">
                                <div className="friend-avatar">
                                    {getInitials(friend.name)}
                                </div>
                                <div className="friend-info">
                                    <span className="friend-name">{friend.name}</span>
                                </div>
                            </div>

                            <div className="friend-item-meta">
                                <div className="friend-actions">
                                    <button
                                        className="unfollow-btn-small"
                                        onClick={(e) => handleUnfollow(e, friend.id)}
                                        title="Unfollow"
                                    >
                                        Unfollow
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FriendsWishlists;
