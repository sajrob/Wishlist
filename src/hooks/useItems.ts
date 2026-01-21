/**
 * Custom hook for managing wishlist items using React Query
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createItem, updateItem, deleteItem, toggleClaim } from '@/api';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { ItemInsert, WishlistItem } from '@/types';

export function useItems(userId: string | undefined) {
    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: (itemData: ItemInsert) => createItem(itemData),
        onSuccess: (response) => {
            if (response.error) throw response.error;
            queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
            toast.success('Item added successfully');
        },
        onError: (error) => {
            console.error('Error creating item:', error);
            toast.error('Failed to add item');
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ itemId, updates }: { itemId: string, updates: Partial<WishlistItem> }) =>
            updateItem(itemId, updates),
        onSuccess: (response) => {
            if (response.error) throw response.error;
            queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
        },
        onError: (error) => {
            console.error('Error updating item:', error);
            toast.error('Failed to update item');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (itemId: string) => deleteItem(itemId),
        onSuccess: (response) => {
            if (response.error) throw response.error;
            queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
            toast.success('Item deleted');
        },
        onError: (error) => {
            console.error('Error deleting item:', error);
            toast.error('Failed to delete item');
        }
    });

    const claimMutation = useMutation({
        mutationFn: ({ itemId, claimUserId, isClaimed }: { itemId: string, claimUserId: string, isClaimed: boolean }) =>
            toggleClaim(itemId, claimUserId, isClaimed),
        onSuccess: (response) => {
            if (response.error) throw response.error;
            queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
            queryClient.invalidateQueries({ queryKey: queryKeys.itemsWithClaims(userId || '') });
        },
        onError: (error) => {
            console.error('Error toggling claim:', error);
            toast.error('Failed to update claim');
        }
    });

    return {
        createItem: createMutation.mutateAsync,
        updateItem: updateMutation.mutateAsync,
        deleteItem: deleteMutation.mutateAsync,
        toggleClaim: claimMutation.mutateAsync,
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
