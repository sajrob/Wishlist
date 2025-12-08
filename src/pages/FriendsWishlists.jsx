import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './FriendsWishlists.css';

const FriendsWishlists = () => {
    const { user } = useAuth();
    const [friendsWishlists, setFriendsWishlists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchFriendsWishlists();
        }
    }, [user]);

    const fetchFriendsWishlists = async () => {
        setLoading(true);
        try {
            // 1. Get friends (users I'm following)
            const { data: friendsData, error: friendsError } = await supabase
                .from('friends')
                .select('friend_id')
                .eq('user_id', user.id);

            if (friendsError) throw friendsError;

            if (!friendsData || friendsData.length === 0) {
                setFriendsWishlists([]);
                setLoading(false);
                return;
            }

            const friendIds = friendsData.map(f => f.friend_id);

            // 2. Get profiles for those friends
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .in('id', friendIds);

            if (profilesError) throw profilesError;

            // 3. Get public categories for those friends
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('user_id, id, is_public')
                .in('user_id', friendIds)
                .eq('is_public', true);

            if (categoriesError) throw categoriesError;

            // If no public categories, return empty
            if (!categoriesData || categoriesData.length === 0) {
                setFriendsWishlists([]);
                setLoading(false);
                return;
            }

            // Count public categories per user
            const categoriesCount = {};
            const usersWithPublicCategories = new Set();
            const publicCategoryIds = new Set();

            categoriesData.forEach(cat => {
                categoriesCount[cat.user_id] = (categoriesCount[cat.user_id] || 0) + 1;
                usersWithPublicCategories.add(cat.user_id);
                publicCategoryIds.add(cat.id);
            });

            // 4. Get items in public categories
            const { data: itemsData, error: itemsError } = await supabase
                .from('items')
                .select('user_id, category_id')
                .in('category_id', Array.from(publicCategoryIds));

            if (itemsError) throw itemsError;

            // Count items in public categories per user
            const itemsCount = {};
            itemsData?.forEach(item => {
                itemsCount[item.user_id] = (itemsCount[item.user_id] || 0) + 1;
            });

            // 5. Combine all data - only users with public categories
            const combined = profilesData
                .filter(profile => usersWithPublicCategories.has(profile.id))
                .map(profile => ({
                    id: profile.id,
                    name: profile.full_name,
                    firstName: profile.first_name || profile.full_name?.split(' ')[0] || 'Friend',
                    publicCategories: categoriesCount[profile.id] || 0,
                    totalItems: itemsCount[profile.id] || 0
                }));

            setFriendsWishlists(combined);
        } catch (error) {
            console.error('Error fetching friends wishlists:', error);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        return name
            ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : 'U';
    };

    const getPossessiveName = (name) => {
        const suffix = name.slice(-1).toLowerCase() === 's' ? "'" : "'s";
        return `${name}${suffix}`;
    };

    if (loading) {
        return (
            <div className="friends-wishlists-container">
                <div className="loading-spinner">Loading friends' wishlists...</div>
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
                <div className="empty-state">
                    <div className="empty-icon">🎁</div>
                    <h2>No Public Wishlists Yet</h2>
                    <p>
                        None of your friends have made their wishlists public yet, or you haven't followed anyone.
                    </p>
                    <Link to="/find-users" className="primary-btn">
                        Find Friends
                    </Link>
                </div>
            ) : (
                <div className="wishlists-grid">
                    {friendsWishlists.map(friend => (
                        <div key={friend.id} className="wishlist-card">
                            <div className="wishlist-card-header">
                                <div className="user-avatar-large">
                                    {getInitials(friend.name)}
                                </div>
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
