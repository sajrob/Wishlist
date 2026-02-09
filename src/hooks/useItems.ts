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
            onMutate: async (newItem: ItemInsert) => {
                const queryKey = queryKeys.items(userId || '');
                const previousItems = queryClient.getQueryData<WishlistItem[]>(queryKey);

                if (previousItems) {
                    const optimisticItem: WishlistItem = {
                        ...newItem,
                        id: 'temp-' + Date.now(),
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        claims: [],
                    } as any;

                    queryClient.setQueryData<WishlistItem[]>(queryKey, old =>
                        [optimisticItem, ...(old || [])]
                    );
                }

                return { previousItems };
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
                toast.success('Item added successfully');
            },
            onError: (error, variables, context: any) => {
                if (context?.previousItems) {
                    queryClient.setQueryData(queryKeys.items(userId || ''), context.previousItems);
                }
                console.error('[useItems] createItem Error:', error);
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
            onMutate: async ({ itemId, updates }) => {
                const queryKey = queryKeys.items(userId || '');
                const previousItems = queryClient.getQueryData<WishlistItem[]>(queryKey);

                if (previousItems) {
                    queryClient.setQueryData<WishlistItem[]>(queryKey, old =>
                        old?.map(item => item.id === itemId ? { ...item, ...updates } : item)
                    );
                }

                return { previousItems };
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
            },
            onError: (error, variables, context: any) => {
                if (context?.previousItems) {
                    queryClient.setQueryData(queryKeys.items(userId || ''), context.previousItems);
                }
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
            onMutate: async (itemId) => {
                const queryKey = queryKeys.items(userId || '');
                const previousItems = queryClient.getQueryData<WishlistItem[]>(queryKey);

                if (previousItems) {
                    queryClient.setQueryData<WishlistItem[]>(queryKey, old =>
                        old?.filter(item => item.id !== itemId)
                    );
                }

                return { previousItems };
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
                toast.success('Item deleted');
            },
            onError: (error, variables, context: any) => {
                if (context?.previousItems) {
                    queryClient.setQueryData(queryKeys.items(userId || ''), context.previousItems);
                }
                console.error('[useItems] deleteItem Error:', error);
                toast.error('Failed to delete item');
            }
        }
    );

    const claimMutation = useOptimisticMutation(
        ({ itemId, claimUserId, isClaimed }: { itemId: string, claimUserId: string, isClaimed: boolean }) =>
            apiToggleClaim(itemId, claimUserId, isClaimed),
        {
            actionType: ({ isClaimed }) => isClaimed ? 'UNCLAIM_ITEM' : 'CLAIM_ITEM',
            table: 'claims',

            onMutate: async ({ itemId, claimUserId, isClaimed }) => {
                const queryKey = queryKeys.items(userId || '');
                const previousItems = queryClient.getQueryData<WishlistItem[]>(queryKey);

                if (previousItems) {
                    queryClient.setQueryData<WishlistItem[]>(queryKey, old =>
                        old?.map(item => {
                            if (item.id === itemId) {
                                const newClaims = isClaimed
                                    ? (item.claims || []).filter(c => c.user_id !== claimUserId)
                                    : [...(item.claims || []), {
                                        id: 'temp-' + Date.now(),
                                        item_id: itemId,
                                        user_id: claimUserId,
                                        created_at: new Date().toISOString()
                                    } as any];
                                return { ...item, claims: newClaims };
                            }
                            return item;
                        })
                    );
                }

                return { previousItems };
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
                queryClient.invalidateQueries({ queryKey: queryKeys.itemsWithClaims(userId || '') });
            },
            onError: (error, variables, context: any) => {
                if (context?.previousItems) {
                    queryClient.setQueryData(queryKeys.items(userId || ''), context.previousItems);
                }
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

