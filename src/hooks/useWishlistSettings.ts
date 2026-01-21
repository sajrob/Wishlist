/**
 * Custom hook for managing wishlist public/private settings using React Query
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWishlistSettings, updateWishlistSettings } from '@/api';
import { queryKeys } from '@/lib/queryClient';

export function useWishlistSettings(userId: string | null) {
    const queryClient = useQueryClient();

    const { data: response, isLoading: loading, error } = useQuery({
        queryKey: queryKeys.settings(userId || ''),
        queryFn: () => fetchWishlistSettings(userId!),
        enabled: !!userId,
    });

    const isPublic = response?.data?.is_public || false;

    const updateMutation = useMutation({
        mutationFn: (newIsPublic: boolean) => updateWishlistSettings(userId!, newIsPublic),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.settings(userId || '') });
        },
        onError: (error) => {
            console.error('Error updating wishlist settings:', error);
        }
    });

    const togglePublic = async () => {
        await updateMutation.mutateAsync(!isPublic);
        return true;
    };

    const setPublicStatus = async (status: boolean) => {
        await updateMutation.mutateAsync(status);
        return true;
    };

    return {
        isPublic,
        loading,
        error: error as Error | null,
        togglePublic,
        setIsPublic: setPublicStatus,
        refetch: () => queryClient.invalidateQueries({ queryKey: queryKeys.settings(userId || '') }),
    };
}

export function useWishlistSettingsReadOnly(userId: string | null): { isPublic: boolean; loading: boolean } {
    const { data: response, isLoading: loading } = useQuery({
        queryKey: queryKeys.settings(userId || ''),
        queryFn: () => fetchWishlistSettings(userId!),
        enabled: !!userId,
    });

    const isPublic = response?.data?.is_public || false;

    return { isPublic, loading };
}
