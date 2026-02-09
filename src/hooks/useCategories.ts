/**
 * Custom hook for managing category operations (CRUD) using React Query
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useOptimisticMutation } from './useOptimisticMutation';
import {
    createCategory as apiCreateCategory,
    updateCategory as apiUpdateCategory,
    deleteCategory as apiDeleteCategory,
    uncategorizeItems,
    updateItemsCategory,
} from '@/api';
import { queryKeys } from '@/lib/queryClient';
import type { CategoryFormData } from '../types';
import { toast } from 'sonner';

export function useCategories(userId: string) {
    const queryClient = useQueryClient();

    const createMutation = useOptimisticMutation(
        async (categoryData: CategoryFormData) => {
            const { data: newCategory, error: catError } = await apiCreateCategory({
                user_id: userId,
                name: categoryData.name,
                is_public: categoryData.is_public || false,
            });

            if (catError) throw catError;

            if (categoryData.itemIds && categoryData.itemIds.length > 0 && newCategory) {
                const { error: itemsError } = await updateItemsCategory(categoryData.itemIds, newCategory.id);
                if (itemsError) throw itemsError;
            }

            return newCategory;
        },
        {
            actionType: 'CREATE_CATEGORY',
            table: 'categories',
            onMutate: async (newCategory: CategoryFormData) => {
                const queryKey = queryKeys.categories(userId);
                const previousCategories = queryClient.getQueryData<any[]>(queryKey);

                if (previousCategories) {
                    const optimisticCategory = {
                        id: 'temp-' + Date.now(),
                        name: newCategory.name,
                        is_public: newCategory.is_public || false,
                        user_id: userId,
                        created_at: new Date().toISOString(),
                    };

                    queryClient.setQueryData<any[]>(queryKey, old =>
                        [optimisticCategory, ...(old || [])]
                    );
                }

                return { previousCategories };
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId) });
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId) });
                toast.success('Category created successfully');
            },
            onError: (error, variables, context: any) => {
                if (context?.previousCategories) {
                    queryClient.setQueryData(queryKeys.categories(userId), context.previousCategories);
                }
                console.error('Error creating category:', error);
                toast.error('Failed to create category');
            }
        }
    );

    const updateMutation = useOptimisticMutation(
        async ({ categoryId, categoryData }: { categoryId: string, categoryData: CategoryFormData }) => {
            const { error: catError } = await apiUpdateCategory(categoryId, {
                name: categoryData.name,
                is_public: categoryData.is_public,
            });

            if (catError) throw catError;

            const { error: clearError } = await uncategorizeItems(categoryId);
            if (clearError) throw clearError;

            if (categoryData.itemIds && categoryData.itemIds.length > 0) {
                const { error: addError } = await updateItemsCategory(categoryData.itemIds, categoryId);
                if (addError) throw addError;
            }

            return true;
        },
        {
            actionType: 'UPDATE_CATEGORY',
            table: 'categories',
            onMutate: async ({ categoryId, categoryData }) => {
                const queryKey = queryKeys.categories(userId);
                const previousCategories = queryClient.getQueryData<any[]>(queryKey);

                if (previousCategories) {
                    queryClient.setQueryData<any[]>(queryKey, old =>
                        old?.map(cat => cat.id === categoryId ? { ...cat, ...categoryData } : cat)
                    );
                }

                return { previousCategories };
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId) });
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId) });
                toast.success('Category updated successfully');
            },
            onError: (error, variables, context: any) => {
                if (context?.previousCategories) {
                    queryClient.setQueryData(queryKeys.categories(userId), context.previousCategories);
                }
                console.error('Error updating category:', error);
                toast.error('Failed to update category');
            }
        }
    );

    const deleteMutation = useOptimisticMutation(
        async (categoryId: string) => {
            const { error: itemsError } = await uncategorizeItems(categoryId);
            if (itemsError) throw itemsError;

            const { error: catError } = await apiDeleteCategory(categoryId);
            if (catError) throw catError;

            return true;
        },
        {
            actionType: 'DELETE_CATEGORY',
            table: 'categories',
            onMutate: async (categoryId) => {
                const queryKey = queryKeys.categories(userId);
                const previousCategories = queryClient.getQueryData<any[]>(queryKey);

                if (previousCategories) {
                    queryClient.setQueryData<any[]>(queryKey, old =>
                        old?.filter(cat => cat.id !== categoryId)
                    );
                }

                return { previousCategories };
            },
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId) });
                queryClient.invalidateQueries({ queryKey: queryKeys.items(userId) });
                toast.success('Category deleted successfully');
            },
            onError: (error, variables, context: any) => {
                if (context?.previousCategories) {
                    queryClient.setQueryData(queryKeys.categories(userId), context.previousCategories);
                }
                console.error('Error deleting category:', error);
                toast.error('Failed to delete category');
            }
        }
    );

    const togglePrivacyMutation = useMutation({
        mutationFn: async ({ categoryId, currentIsPublic }: { categoryId: string, currentIsPublic: boolean }) => {
            const newIsPublic = !currentIsPublic;
            const { error } = await apiUpdateCategory(categoryId, {
                is_public: newIsPublic,
            });
            if (error) throw error;
            return newIsPublic;
        },
        onSuccess: (newIsPublic) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId) });
            toast.success(`Category is now ${newIsPublic ? 'public' : 'private'}`);
        },
        onError: (error) => {
            console.error('Error toggling category privacy:', error);
            toast.error('Failed to update category privacy');
        }
    });

    return {
        createCategory: createMutation.mutateAsync,
        updateCategory: (categoryId: string, categoryData: CategoryFormData) =>
            updateMutation.mutateAsync({ categoryId, categoryData }),
        deleteCategory: deleteMutation.mutateAsync,
        toggleCategoryPrivacy: (categoryId: string, currentIsPublic: boolean) =>
            togglePrivacyMutation.mutateAsync({ categoryId, currentIsPublic }),
        isCreating: createMutation.isPending,
        isUpdating: updateMutation.isPending,
        isDeleting: deleteMutation.isPending,
    };
}
