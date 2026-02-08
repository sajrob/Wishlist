/**
 * Custom hook for managing wishlist items using React Query
 */
import { useQueryClient } from '@tanstack/react-query';
import { useOptimisticMutation } from './useOptimisticMutation';
import { createItem, updateItem, deleteItem, toggleClaim as apiToggleClaim } from '@/api';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { ItemInsert, WishlistItem } from '@/types';


export function useItems(userId: string | undefined) {
    const queryClient = useQueryClient();

    const createMutation = useOptimisticMutation(
        (itemData: ItemInsert) => createItem(itemData),
        {
            actionType: 'CREATE_ITEM',
            table: 'items',
            onSuccess: (response: any) => {
                if (response?.error) throw response.error;
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
                toast.success('Item added successfully');
            },
            onError: (error) => {
                console.error('Error creating item:', error);
                toast.error('Failed to add item');
            }
        }
    );

    const updateMutation = useOptimisticMutation(
        ({ itemId, updates }: { itemId: string, updates: Partial<WishlistItem> }) =>
            updateItem(itemId, updates),
        {
            actionType: 'UPDATE_ITEM',
            table: 'items',
            onSuccess: (response: any) => {
                if (response?.error) throw response.error;
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
            },
            onError: (error) => {
                console.error('Error updating item:', error);
                toast.error('Failed to update item');
            }
        }
    );

    const deleteMutation = useOptimisticMutation(
        (itemId: string) => deleteItem(itemId),
        {
            actionType: 'DELETE_ITEM',
            table: 'items',
            onSuccess: (response: any) => {
                if (response?.error) throw response.error;
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
                toast.success('Item deleted');
            },
            onError: (error) => {
                console.error('Error deleting item:', error);
                toast.error('Failed to delete item');
            }
        }
    );

    const claimMutation = useOptimisticMutation(
        ({ itemId, claimUserId, isClaimed }: { itemId: string, claimUserId: string, isClaimed: boolean }) =>
            apiToggleClaim(itemId, claimUserId, isClaimed),
        {
            actionType: 'CLAIM_ITEM',
            table: 'claims',

            onSuccess: (response: any) => {
                if (response?.error) throw response.error;
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
                queryClient.invalidateQueries({ queryKey: queryKeys.itemsWithClaims(userId || '') });
            },
            onError: (error) => {
                console.error('Error toggling claim:', error);
                toast.error('Failed to update claim');
            }
        }
    );

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

