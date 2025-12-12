/**
 * Custom hook for managing category operations (CRUD)
 * Provides methods for creating, updating, deleting, and managing categories
 */

import { useCallback } from 'react';
import {
    createCategory as createCategoryHelper,
    updateCategory as updateCategoryHelper,
    deleteCategory as deleteCategoryHelper,
    uncategorizeItems,
    updateItemsCategory,
} from '../utils/supabaseHelpers';
import type { CategoryFormData, UseCategoriesReturn } from '../types';

type Callback = (message: string) => void;

export function useCategories(
    userId: string,
    onSuccess?: Callback,
    onError?: Callback,
): UseCategoriesReturn {
    const createCategory = useCallback(
        async (categoryData: CategoryFormData) => {
            try {
                const { data: newCategory, error: catError } = await createCategoryHelper({
                    user_id: userId,
                    name: categoryData.name,
                    is_public: categoryData.is_public || false,
                });

                if (catError) throw catError;

                if (categoryData.itemIds && categoryData.itemIds.length > 0 && newCategory) {
                    const { error: itemsError } = await updateItemsCategory(categoryData.itemIds, newCategory.id);
                    if (itemsError) throw itemsError;
                }

                if (onSuccess) {
                    onSuccess('Category created successfully');
                }

                return { data: newCategory, error: null };
            } catch (error) {
                console.error('Error creating category:', error);

                if (onError) {
                    onError('Failed to create category');
                }

                return { data: null, error: error as Error };
            }
        },
        [userId, onSuccess, onError],
    );

    const updateCategory = useCallback(
        async (categoryId: string, categoryData: CategoryFormData) => {
            try {
                const { error: catError } = await updateCategoryHelper(categoryId, {
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

                if (onSuccess) {
                    onSuccess('Category updated successfully');
                }

                return { data: true, error: null };
            } catch (error) {
                console.error('Error updating category:', error);

                if (onError) {
                    onError('Failed to update category');
                }

                return { data: null, error: error as Error };
            }
        },
        [onSuccess, onError],
    );

    const deleteCategory = useCallback(
        async (categoryId: string) => {
            try {
                const { error: itemsError } = await uncategorizeItems(categoryId);
                if (itemsError) throw itemsError;

                const { error: catError } = await deleteCategoryHelper(categoryId);
                if (catError) throw catError;

                if (onSuccess) {
                    onSuccess('Category deleted successfully');
                }

                return { data: true, error: null };
            } catch (error) {
                console.error('Error deleting category:', error);

                if (onError) {
                    onError('Failed to delete category');
                }

                return { data: null, error: error as Error };
            }
        },
        [onSuccess, onError],
    );

    const toggleCategoryPrivacy = useCallback(
        async (categoryId: string, currentIsPublic: boolean) => {
            try {
                const newIsPublic = !currentIsPublic;

                const { error } = await updateCategoryHelper(categoryId, {
                    is_public: newIsPublic,
                });

                if (error) throw error;

                if (onSuccess) {
                    onSuccess(`Category is now ${newIsPublic ? 'public' : 'private'}`);
                }

                return { data: { is_public: newIsPublic }, error: null };
            } catch (error) {
                console.error('Error toggling category privacy:', error);

                if (onError) {
                    onError('Failed to update category privacy');
                }

                return { data: null, error: error as Error };
            }
        },
        [onSuccess, onError],
    );

    return {
        createCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryPrivacy,
    };
}


