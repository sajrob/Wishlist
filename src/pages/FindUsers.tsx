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
        } finally {
            setSearching(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setHasSearched(false);
    };

    const handleSearchSubmit = () => {
        void searchUsers(query);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

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
                    onKeyDown={handleKeyDown}
                />
                <button
                    className="search-icon"
                    onClick={handleSearchSubmit}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    🔍
                </button>
            </div>

            {searching ? (
                <div className="loading-spinner">Searching...</div>
            ) : (
                <div className="users-list">
                    {users.length === 0 ? (
                        <div className="empty-state">
                            {hasSearched ? 'No users found matching your search.' : 'Type a name and press Enter to find friends.'}
                        </div>
                    ) : (
                        users.map(profile => {
                            const isFollowing = friends.has(profile.id);
                            const Wrapper = isFollowing ? Link : 'div';
                            const wrapperProps = isFollowing
                                ? { to: `/wishlist/${profile.id}`, className: 'user-list-item' }
                                : { className: 'user-list-item' };

                            return (
                                <Wrapper key={profile.id} {...(wrapperProps as any)}>
                                    <div className="user-item-main">
                                        <div className="user-avatar">{getInitials(profile.full_name)}</div>
                                        <div className="user-info">
                                            <div className="user-name">{profile.full_name}</div>
                                        </div>
                                    </div>

                                    <div className="user-actions">
                                        {isFollowing ? (
                                            <span className="badge-following">✓ Following</span>
                                        ) : (
                                            <button className="action-btn follow-btn" onClick={() => handleFollow(profile.id)}>
                                                Follow
                                            </button>
                                        )}
                                    </div>
                                </Wrapper>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

export default FindUsers;


