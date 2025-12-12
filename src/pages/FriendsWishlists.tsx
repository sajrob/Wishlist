import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import { fetchFriends, fetchProfiles, fetchPublicCategories, fetchItemsByCategories } from '../utils/supabaseHelpers';
import { getInitials, getPossessiveName, getFirstName } from '../utils/nameUtils';
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

            const { data: categoriesData, error: categoriesError } = await fetchPublicCategories(friendIds);

            if (categoriesError) throw categoriesError;

            if (!categoriesData || categoriesData.length === 0) {
                setFriendsWishlists([]);
                setLoading(false);
                return;
            }

            const categoriesCount: Record<string, number> = {};
            const usersWithPublicCategories = new Set<string>();
            const publicCategoryIds = new Set<string>();

            categoriesData.forEach(cat => {
                categoriesCount[cat.user_id] = (categoriesCount[cat.user_id] || 0) + 1;
                usersWithPublicCategories.add(cat.user_id);
                publicCategoryIds.add(cat.id);
            });

            const { data: itemsData, error: itemsError } = await fetchItemsByCategories(Array.from(publicCategoryIds));

            if (itemsError) throw itemsError;

            const itemsCount: Record<string, number> = {};
            itemsData?.forEach(item => {
                itemsCount[item.user_id] = (itemsCount[item.user_id] || 0) + 1;
            });

            const combined = (profilesData || [])
                .filter(profile => usersWithPublicCategories.has(profile.id))
                .map(profile => ({
                    id: profile.id,
                    name: profile.full_name,
                    firstName: getFirstName(profile, 'Friend'),
                    publicCategories: categoriesCount[profile.id] || 0,
                    totalItems: itemsCount[profile.id] || 0,
                }));

            setFriendsWishlists(combined);
        } catch (error) {
            console.error('Error fetching friends wishlists:', error);
        } finally {
            setLoading(false);
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
                                    <span className="friend-wishlist-title">
                                        {getPossessiveName(friend.firstName)} Wishlist
                                    </span>
                                </div>
                            </div>

                            <div className="friend-item-meta">
                                <div className="meta-badges">
                                    <span className="meta-badge" title="Public Categories">
                                        <span className="icon">🌍</span> {friend.publicCategories} Categories
                                    </span>
                                    <span className="meta-badge" title="Total Items">
                                        <span className="icon">🎁</span> {friend.totalItems} Items
                                    </span>
                                </div>
                                <div className="item-action-icon">
                                    ›
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
