/**
 * Custom hook for searching users using React Query
 */
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { searchProfiles, followUser, unfollowUser, fetchFriends } from '@/api';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import { confirmDelete } from '../utils/toastHelpers';

export type ProfileRecord = {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
};

export function useUserSearch(userId: string | undefined) {
    const queryClient = useQueryClient();
    const [query, setQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

    // Fetch user's friends to show follow/unfollow status
    const { data: friendsResponse } = useQuery({
        queryKey: queryKeys.friends(userId || ''),
        queryFn: () => fetchFriends(userId!),
        enabled: !!userId,
    });

    const friendIds = new Set((friendsResponse?.data || []).map((f: any) => f.friend_id));

    const { data: searchResponse, isLoading: searching } = useQuery({
        queryKey: ['user-search', query],
        queryFn: () => {
            const cleanQuery = query.trim().replace(/^@/, '');
            return searchProfiles(cleanQuery, userId!);
        },
        enabled: !!userId && query.trim().length > 0,
    });

    const users = (searchResponse?.data || []) as ProfileRecord[];

    const followMutation = useMutation({
        mutationFn: (friendId: string) => followUser(userId!, friendId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.friends(userId || '') });
            toast.success('Started following');
        },
        onError: (error) => {
            console.error('Error following:', error);
            toast.error('Could not follow user');
        }
    });

    const unfollowMutation = useMutation({
        mutationFn: (friendId: string) => unfollowUser(userId!, friendId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.friends(userId || '') });
        },
        onError: (error) => {
            console.error('Error unfollowing:', error);
            toast.error('Could not unfollow user');
        }
    });

    const handleFollow = (friendId: string, name: string) => {
        followMutation.mutate(friendId);
    };

    const handleUnfollow = (friendId: string, name: string) => {
        confirmDelete({
            title: `Unfollow ${name}?`,
            description: "You won't be able to see their private wishlists anymore.",
            deleteLabel: 'Unfollow',
            onDelete: async () => {
                await unfollowMutation.mutateAsync(friendId);
                toast.success(`Unfollowed ${name}`);
            },
        });
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
