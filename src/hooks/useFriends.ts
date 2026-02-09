/**
 * Custom hook for managing friend connections using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimisticMutation } from './useOptimisticMutation';
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

    const { data: followingRaw = [], isLoading: isLoadingFollowing } = useQuery({
        queryKey: queryKeys.friends(userId || ''),
        queryFn: async () => {
            const res = await fetchFriends(userId!);
            if (res.error) throw res.error;
            return res.data || [];
        },
        enabled: !!userId,
    });

    const { data: followersRaw = [], isLoading: isLoadingFollowers } = useQuery({
        queryKey: queryKeys.followers(userId || ''),
        queryFn: async () => {
            const res = await fetchFollowers(userId!);
            if (res.error) throw res.error;
            return res.data || [];
        },
        enabled: !!userId,
    });

    const followingList: FriendSummary[] = followingRaw
        .map((f: any) => f.profiles)
        .filter(Boolean);

    const followersList: FriendSummary[] = followersRaw
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

    const followMutation = useOptimisticMutation(
        ({ userId, friendId }: { userId: string, friendId: string }) => followUser(userId, friendId),
        {
            actionType: 'FOLLOW_USER',
            table: 'friends',
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.friends(userId || '') });
                queryClient.invalidateQueries({ queryKey: queryKeys.followers(userId || '') });
                toast.success('Started following');
            },
            onError: (error) => {
                console.error('Error following:', error);
                toast.error('Could not follow user');
            }
        }
    );

    const unfollowMutation = useOptimisticMutation(
        ({ userId, friendId }: { userId: string, friendId: string }) => unfollowUser(userId, friendId),
        {
            actionType: 'UNFOLLOW_USER',
            table: 'friends',
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.friends(userId || '') });
                queryClient.invalidateQueries({ queryKey: queryKeys.followers(userId || '') });
            },
            onError: (error) => {
                console.error('Error unfollowing:', error);
                toast.error('Could not unfollow user');
            }
        }
    );

    const handleUnfollow = (friendId: string, friendName: string, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();

        confirmDelete({
            title: `Unfollow ${friendName}?`,
            description: "You won't be able to see their private wishlists anymore.",
            deleteLabel: 'Unfollow',
            onDelete: async () => {
                await unfollowMutation.mutateAsync({ userId: userId!, friendId });
                toast.success(`Unfollowed ${friendName}`);
            },
        });
    };

    const handleFollowBack = (friendId: string, friendName: string, e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        followMutation.mutate({ userId: userId!, friendId });
    };

    return {
        following,
        followers,
        mutualFriends: following.filter(f => f.mutual),
        isFollowing: (friendId: string) => followingIds.has(friendId),
        follow: (friendId: string) => followMutation.mutateAsync({ userId: userId!, friendId }),
        unfollow: (friendId: string) => unfollowMutation.mutateAsync({ userId: userId!, friendId }),
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
