/**
 * Custom hook for searching users using React Query
 */
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchProfiles } from '@/api';
import { useFriends } from './useFriends';

export type ProfileRecord = {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
};

export function useUserSearch(userId: string | undefined) {
    const [query, setQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    const { follow, handleUnfollow, following } = useFriends(userId);
    const friendIds = new Set(following.map(f => f.id));

    const { data: searchResponse, isLoading: searching } = useQuery({
        queryKey: ['user-search', query, userId],
        queryFn: () => {
            const cleanQuery = query.trim().replace(/^@/, '');
            return searchProfiles(cleanQuery, userId!);
        },
        enabled: !!userId && query.trim().length > 0,
    });

    const users = (searchResponse?.data || []) as ProfileRecord[];

    const handleFollow = (friendId: string, _name: string) => {
        void follow(friendId);
    };

    const searchUsers = useCallback((searchQuery: string) => {
        setQuery(searchQuery);
        setHasSearched(true);
    }, []);

    return {
        query,
        setQuery,
        users,
        friends: friendIds,
        searching,
        hasSearched,
        setHasSearched,
        searchUsers,
        handleFollow,
        handleUnfollow,
    };
}
