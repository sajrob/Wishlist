/**
 * Custom hook for managing category operations (CRUD) using React Query
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

    const createMutation = useMutation({
        mutationFn: async (categoryData: CategoryFormData) => {
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.items(userId) });
            toast.success('Category created successfully');
        },
        onError: (error) => {
            console.error('Error creating category:', error);
            toast.error('Failed to create category');
        }
    });

    const updateMutation = useMutation({
        mutationFn: async ({ categoryId, categoryData }: { categoryId: string, categoryData: CategoryFormData }) => {
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.items(userId) });
            toast.success('Category updated successfully');
        },
        onError: (error) => {
            console.error('Error updating category:', error);
            toast.error('Failed to update category');
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (categoryId: string) => {
            const { error: itemsError } = await uncategorizeItems(categoryId);
            if (itemsError) throw itemsError;

            const { error: catError } = await apiDeleteCategory(categoryId);
            if (catError) throw catError;

            return true;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.items(userId) });
            toast.success('Category deleted successfully');
        },
        onError: (error) => {
            console.error('Error deleting category:', error);
            toast.error('Failed to delete category');
        }
    });

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
