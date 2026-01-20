/**
 * Custom hook for managing friend connections
 * Handles fetching friends, followers, following, and managing relationships
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'sonner';
import { confirmDelete } from '../utils/toastHelpers';

export type FriendSummary = {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
    mutual?: boolean;
};

export type ConnectionTab = 'friends' | 'following' | 'followers';

export function useFriends(userId: string | undefined) {
    const [following, setFollowing] = useState<FriendSummary[]>([]);
    const [followers, setFollowers] = useState<FriendSummary[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchConnections = useCallback(async () => {
        if (!userId) return;

        try {
            // Fetch following
            const { data: followingData, error: followingError } = await supabase
                .from('friends')
                .select(`
          friend_id,
          profiles!friends_friend_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
                .eq('user_id', userId);

            if (followingError) throw followingError;

            // Fetch followers
            const { data: followersData, error: followersError } = await supabase
                .from('friends')
                .select(`
          user_id,
          profiles!friends_user_id_fkey (
            id,
            full_name,
            username,
            avatar_url
          )
        `)
                .eq('friend_id', userId);

            if (followersError) throw followersError;

            const followingList: FriendSummary[] = (followingData || [])
                .map((f: any) => f.profiles)
                .filter(Boolean);

            const followersList: FriendSummary[] = (followersData || [])
                .map((f: any) => f.profiles)
                .filter(Boolean);

            // Mark mutual friends
            const followingIds = new Set(followingList.map(f => f.id));
            const followerIds = new Set(followersList.map(f => f.id));

            const followingWithMutual = followingList.map(f => ({
                ...f,
                mutual: followerIds.has(f.id),
            }));

            const followersWithMutual = followersList.map(f => ({
                ...f,
                mutual: followingIds.has(f.id),
            }));

            setFollowing(followingWithMutual);
            setFollowers(followersWithMutual);
        } catch (error) {
            console.error('Error fetching connections:', error);
            toast.error('Could not load connections');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            void fetchConnections();
        }
    }, [userId, fetchConnections]);

    const handleUnfollow = useCallback(async (friendId: string, friendName: string, e?: React.MouseEvent) => {
        if (!userId) return;

        e?.preventDefault();
        e?.stopPropagation();

        confirmDelete({
            title: `Unfollow ${friendName}?`,
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

                    setFollowing(prev => prev.filter(f => f.id !== friendId));
                    setFollowers(prev =>
                        prev.map(f =>
                            f.id === friendId ? { ...f, mutual: false } : f
                        )
                    );
                    toast.success(`Unfollowed ${friendName}`);
                } catch (error) {
                    console.error('Error unfollowing:', error);
                    toast.error('Could not unfollow user');
                }
            },
        });
    }, [userId]);

    const handleFollowBack = useCallback(async (friendId: string, friendName: string, e?: React.MouseEvent) => {
        if (!userId) return;

        e?.preventDefault();
        e?.stopPropagation();

        try {
            const { error } = await supabase
                .from('friends')
                .insert([{ user_id: userId, friend_id: friendId }]);

            if (error) throw error;

            // Update both lists
            setFollowers(prev =>
                prev.map(f =>
                    f.id === friendId ? { ...f, mutual: true } : f
                )
            );

            const followerToAdd = followers.find(f => f.id === friendId);
            if (followerToAdd) {
                setFollowing(prev => [...prev, { ...followerToAdd, mutual: true }]);
            }

            toast.success(`Now following ${friendName}`);
        } catch (error) {
            console.error('Error following back:', error);
            toast.error('Could not follow user');
        }
    }, [userId, followers]);

    // Derived values
    const mutualFriends = following.filter(f => f.mutual);

    return {
        following,
        followers,
        mutualFriends,
        loading,
        handleUnfollow,
        handleFollowBack,
        refetch: fetchConnections,
    };
}
