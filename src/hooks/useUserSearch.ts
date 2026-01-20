/**
 * Custom hook for searching users
 * Handles user search with debounce and follow/unfollow state
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { confirmDelete } from '../utils/toastHelpers';

export type ProfileRecord = {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
};

export function useUserSearch(userId: string | undefined) {
    const [query, setQuery] = useState('');
    const [users, setUsers] = useState<ProfileRecord[]>([]);
    const [friends, setFriends] = useState<Set<string>>(new Set());
    const [searching, setSearching] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch user's current friends on mount
    useEffect(() => {
        if (userId) {
            void fetchFriends();
        }
    }, [userId]);

    const fetchFriends = async () => {
        if (!userId) return;
        try {
            const { data, error } = await supabase
                .from('friends')
                .select('friend_id')
                .eq('user_id', userId);

            if (error) throw error;
            const friendIds = new Set((data || []).map(f => f.friend_id));
            setFriends(friendIds);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const searchUsers = useCallback(async (searchQuery: string) => {
        if (!userId || !searchQuery.trim()) {
            setUsers([]);
            return;
        }

        setSearching(true);
        try {
            // Remove @ symbol if present, since usernames in DB don't include it
            const cleanQuery = searchQuery.trim().replace(/^@/, '');

            const { data, error } = await supabase
                .from('profiles')
                .select('id, full_name, username, avatar_url')
                .neq('id', userId)
                .or(`full_name.ilike.%${cleanQuery}%,username.ilike.%${cleanQuery}%`)
                .limit(20);

            if (error) throw error;
            setUsers((data || []) as ProfileRecord[]);
            setHasSearched(true);
        } catch (error) {
            console.error('Error searching users:', error);
            toast.error('Search failed.');
        } finally {
            setSearching(false);
        }
    }, [userId]);

    const handleFollow = useCallback(async (friendId: string, name: string) => {
        if (!userId) return;
        try {
            const { error } = await supabase
                .from('friends')
                .insert([{ user_id: userId, friend_id: friendId }]);

            if (error) throw error;
            setFriends(prev => new Set(prev).add(friendId));
            toast.success(`Following ${name}`);
        } catch (error) {
            toast.error('Could not follow user.');
        }
    }, [userId]);

    const handleUnfollow = useCallback(async (friendId: string, name: string) => {
        if (!userId) return;
        confirmDelete({
            title: `Unfollow ${name}?`,
            description: "You won't be able to see their private wishlists anymore.",
            deleteLabel: 'Unfollow',
            onDelete: async () => {
                try {
                    const { error } = await supabase
                        .from('friends')
                        .delete()
                        .eq('user_id', userId)
                        .eq('friend_id', friendId);

                    if (error) throw error;
                    setFriends(prev => {
                        const next = new Set(prev);
                        next.delete(friendId);
                        return next;
                    });
                    toast.success(`Unfollowed ${name}`);
                } catch (error) {
                    toast.error('Could not unfollow user.');
                }
            },
        });
    }, [userId]);

    return {
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
    };
}
