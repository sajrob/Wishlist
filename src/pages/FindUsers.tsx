import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './FindUsers.css';

type ProfileRecord = {
    id: string;
    full_name: string;
};

const FindUsers = () => {
    const { user } = useAuth();
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<ProfileRecord[]>([]);
    const [friends, setFriends] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            void fetchFriends();
            void searchUsers('');
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
        setSearching(true);
        try {
            let queryBuilder = supabase.from('profiles').select('*').neq('id', user.id).limit(20);

            if (searchQuery) {
                queryBuilder = queryBuilder.ilike('full_name', `%${searchQuery}%`);
            }

            const { data, error } = await queryBuilder;

            if (error) throw error;
            setUsers((data || []) as ProfileRecord[]);
        } catch (error) {
            console.error('Error searching users:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            void searchUsers(query);
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const handleFollow = async (friendId: string) => {
        if (!user) return;
        try {
            const { error } = await supabase.from('friends').insert([{ user_id: user.id, friend_id: friendId }]);

            if (error) throw error;

            setFriends(prev => new Set(prev).add(friendId));
        } catch (error) {
            console.error('Error following user:', error);
            alert('Could not follow user. Make sure you have run the database setup script.');
        }
    };

    const getInitials = (name: string) => {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';
    };

    return (
        <div className="find-users-container">
            <div className="find-users-header">
                <h1>Find Friends</h1>
                <p>Discover other people and see their wishlists.</p>
            </div>

            <div className="search-box">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search by name..."
                    value={query}
                    onChange={handleSearchChange}
                />
                <span className="search-icon">🔍</span>
            </div>

            {searching ? (
                <div className="loading-spinner">Searching...</div>
            ) : (
                <div className="users-grid">
                    {users.length === 0 ? (
                        <div className="empty-state">
                            {query ? 'No users found matching your search.' : 'Start typing to find friends.'}
                        </div>
                    ) : (
                        users.map(profile => (
                            <div key={profile.id} className="user-card">
                                <div className="user-avatar">{getInitials(profile.full_name)}</div>
                                <div className="user-info">
                                    <div className="user-name">{profile.full_name}</div>
                                </div>

                                {friends.has(profile.id) ? (
                                    <>
                                        <button className="action-btn following-btn">✓ Following</button>
                                        <Link to={`/wishlist/${profile.id}`}>
                                            <button className="action-btn view-btn">View Wishlist</button>
                                        </Link>
                                    </>
                                ) : (
                                    <button className="action-btn follow-btn" onClick={() => handleFollow(profile.id)}>
                                        Follow +
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default FindUsers;


