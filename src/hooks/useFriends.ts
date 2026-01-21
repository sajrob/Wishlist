/**
 * Custom hook for managing friend connections using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchFriends, fetchFollowers, followUser, unfollowUser } from '@/api';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import { confirmDelete } from '../utils/toastHelpers';

export type FriendSummary = {
    id: string;
    full_name: string;
    username?: string;
    avatar_url?: string;
    mutual?: boolean;
};

export function useFriends(userId: string | undefined) {
    const queryClient = useQueryClient();

    const { data: followingResponse, isLoading: isLoadingFollowing } = useQuery({
        queryKey: queryKeys.friends(userId || ''),
        queryFn: () => fetchFriends(userId!),
        enabled: !!userId,
    });

    const { data: followersResponse, isLoading: isLoadingFollowers } = useQuery({
        queryKey: queryKeys.followers(userId || ''),
        queryFn: () => fetchFollowers(userId!),
        enabled: !!userId,
    });

    const followingList: FriendSummary[] = (followingResponse?.data || [])
        .map((f: any) => f.profiles)
        .filter(Boolean);

    const followersList: FriendSummary[] = (followersResponse?.data || [])
        .map((f: any) => f.profiles)
        .filter(Boolean);

    const followingIds = new Set(followingList.map(f => f.id));
    const followerIds = new Set(followersList.map(f => f.id));

    const following = followingList.map(f => ({
        ...f,
        mutual: followerIds.has(f.id),
    }));

    const followers = followersList.map(f => ({
        ...f,
        mutual: followingIds.has(f.id),
    }));

    const followMutation = useMutation({
        mutationFn: (friendId: string) => followUser(userId!, friendId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.friends(userId || '') });
            queryClient.invalidateQueries({ queryKey: queryKeys.followers(userId || '') });
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
            queryClient.invalidateQueries({ queryKey: queryKeys.followers(userId || '') });
        },
        onError: (error) => {
            console.error('Error unfollowing:', error);
            toast.error('Could not unfollow user');
        }
    });

    const handleUnfollow = (friendId: string, friendName: string, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        confirmDelete({
            title: `Unfollow ${friendName}?`,
            description: "You won't be able to see their private wishlists anymore.",
            deleteLabel: 'Unfollow',
            onDelete: async () => {
                await unfollowMutation.mutateAsync(friendId);
                toast.success(`Unfollowed ${friendName}`);
            },
        });
    };

    const handleFollowBack = (friendId: string, friendName: string, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        followMutation.mutate(friendId);
    };

    return {
        following,
        followers,
        mutualFriends: following.filter(f => f.mutual),
        isFollowing: (friendId: string) => followingIds.has(friendId),
        follow: followMutation.mutateAsync,
        unfollow: unfollowMutation.mutateAsync,
        isFollowLoading: followMutation.isPending,
        isUnfollowLoading: unfollowMutation.isPending,
        loading: isLoadingFollowing || isLoadingFollowers,
        handleUnfollow,
        handleFollowBack,
        refetch: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.friends(userId || '') });
            queryClient.invalidateQueries({ queryKey: queryKeys.followers(userId || '') });
        },
    };
}
