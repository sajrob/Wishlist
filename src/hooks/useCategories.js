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
    updateItemsCategory
} from '../utils/supabaseHelpers';

/**
 * Hook for managing category operations
 * 
 * @param {string} userId - The current user's ID
 * @param {Function} onSuccess - Optional callback after successful operations
 * @param {Function} onError - Optional callback after failed operations
 * @returns {Object} Category management methods
 * 
 * @example
 * const { createCategory, updateCategory, deleteCategory } = useCategories(user.id);
 * await createCategory({ name: "Electronics", is_public: true });
 */
export function useCategories(userId, onSuccess, onError) {
    /**
     * Creates a new category and optionally assigns items to it
     * 
     * @param {Object} categoryData - Category data
     * @param {string} categoryData.name - Category name
     * @param {boolean} categoryData.is_public - Whether category is public
     * @param {string[]} categoryData.itemIds - Optional array of item IDs to add to category
     * @returns {Promise<Object>} Created category data
     */
    const createCategory = useCallback(async (categoryData) => {
        try {
            // 1. Create the category
            const { data: newCategory, error: catError } = await createCategoryHelper({
                user_id: userId,
                name: categoryData.name,
                is_public: categoryData.is_public || false
            });

            if (catError) throw catError;

            // 2. If items were selected, assign them to the new category
            if (categoryData.itemIds && categoryData.itemIds.length > 0) {
                const { error: itemsError } = await updateItemsCategory(
                    categoryData.itemIds,
                    newCategory.id
                );

                if (itemsError) throw itemsError;
            }

            // Call success callback if provided
            if (onSuccess) {
                onSuccess('Category created successfully');
            }

            return { data: newCategory, error: null };
        } catch (error) {
            console.error('Error creating category:', error);

            // Call error callback if provided
            if (onError) {
                onError('Failed to create category');
            }

            return { data: null, error };
        }
    }, [userId, onSuccess, onError]);

    /**
     * Updates an existing category
     * Replaces all items in the category with the new selection
     * 
     * @param {string} categoryId - Category ID to update
     * @param {Object} categoryData - Updated category data
     * @param {string} categoryData.name - New category name
     * @param {boolean} categoryData.is_public - New public status
     * @param {string[]} categoryData.itemIds - New array of item IDs for this category
     * @returns {Promise<Object>} Updated category data
     */
    const updateCategory = useCallback(async (categoryId, categoryData) => {
        try {
            // 1. Update category name and public status
            const { error: catError } = await updateCategoryHelper(categoryId, {
                name: categoryData.name,
                is_public: categoryData.is_public
            });

            if (catError) throw catError;

            // 2. Remove all items from this category first
            const { error: clearError } = await uncategorizeItems(categoryId);
            if (clearError) throw clearError;

            // 3. Add selected items to this category
            if (categoryData.itemIds && categoryData.itemIds.length > 0) {
                const { error: addError } = await updateItemsCategory(
                    categoryData.itemIds,
                    categoryId
                );

                if (addError) throw addError;
            }

            // Call success callback if provided
            if (onSuccess) {
                onSuccess('Category updated successfully');
            }

            return { data: true, error: null };
        } catch (error) {
            console.error('Error updating category:', error);

            // Call error callback if provided
            if (onError) {
                onError('Failed to update category');
            }

            return { data: null, error };
        }
    }, [onSuccess, onError]);

    /**
     * Deletes a category and uncategorizes all items in it
     * 
     * @param {string} categoryId - Category ID to delete
     * @returns {Promise<Object>} Success status
     */
    const deleteCategory = useCallback(async (categoryId) => {
        try {
            // 1. First, uncategorize all items in this category
            const { error: itemsError } = await uncategorizeItems(categoryId);
            if (itemsError) throw itemsError;

            // 2. Delete the category
            const { error: catError } = await deleteCategoryHelper(categoryId);
            if (catError) throw catError;

            // Call success callback if provided
            if (onSuccess) {
                onSuccess('Category deleted successfully');
            }

            return { data: true, error: null };
        } catch (error) {
            console.error('Error deleting category:', error);

            // Call error callback if provided
            if (onError) {
                onError('Failed to delete category');
            }

            return { data: null, error };
        }
    }, [onSuccess, onError]);

    /**
     * Toggles a category's public/private status
     * 
     * @param {string} categoryId - Category ID
     * @param {boolean} currentIsPublic - Current public status
     * @returns {Promise<Object>} New public status
     */
    const toggleCategoryPrivacy = useCallback(async (categoryId, currentIsPublic) => {
        try {
            const newIsPublic = !currentIsPublic;

            const { error } = await updateCategoryHelper(categoryId, {
                is_public: newIsPublic
            });

            if (error) throw error;

            // Call success callback if provided
            if (onSuccess) {
                onSuccess(`Category is now ${newIsPublic ? 'public' : 'private'}`);
            }

            return { data: { is_public: newIsPublic }, error: null };
        } catch (error) {
            console.error('Error toggling category privacy:', error);

            // Call error callback if provided
            if (onError) {
                onError('Failed to update category privacy');
            }

            return { data: null, error };
        }
    }, [onSuccess, onError]);

    return {
        createCategory,
        updateCategory,
        deleteCategory,
        toggleCategoryPrivacy
    };
}
