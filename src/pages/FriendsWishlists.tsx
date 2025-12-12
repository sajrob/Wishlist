import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
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
            <div className="friends-wishlists-container">
                <LoadingSpinner message="Loading friends' wishlists..." inline={true} />
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
                <EmptyState
                    icon="🎁"
                    title="No Public Wishlists Yet"
                    message="None of your friends have made their wishlists public yet, or you haven't followed anyone."
                    action={{ text: 'Find Friends', to: '/find-users' }}
                />
            ) : (
                <div className="wishlists-grid">
                    {friendsWishlists.map(friend => (
                        <div key={friend.id} className="wishlist-card">
                            <div className="wishlist-card-header">
                                <div className="user-avatar-large">{getInitials(friend.name)}</div>
                                <div className="wishlist-info">
                                    <h3>{getPossessiveName(friend.firstName)} Wishlist</h3>
                                    <p className="user-full-name">{friend.name}</p>
                                </div>
                            </div>

                            <div className="wishlist-stats">
                                <div className="stat">
                                    <span className="stat-icon">🌍</span>
                                    <span className="stat-value">{friend.publicCategories}</span>
                                    <span className="stat-label">Public Categories</span>
                                </div>
                                <div className="stat">
                                    <span className="stat-icon">🎁</span>
                                    <span className="stat-value">{friend.totalItems}</span>
                                    <span className="stat-label">Items</span>
                                </div>
                            </div>

                            <Link to={`/wishlist/${friend.id}`} className="view-wishlist-btn">
                                View Wishlist →
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FriendsWishlists;


