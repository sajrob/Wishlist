/**
 * Custom hook for managing wishlist data (items and categories)
 * Provides a unified interface for fetching and managing wishlist state
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchUserItems, fetchUserCategories } from '../utils/supabaseHelpers';

/**
 * Hook for fetching and managing wishlist data for a specific user
 * 
 * @param {string} userId - The user ID to fetch data for
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to automatically fetch on mount (default: true)
 * @returns {Object} Wishlist data and methods
 * @returns {Array} returns.allItems - All wishlist items for the user
 * @returns {Array} returns.categories - All categories for the user
 * @returns {boolean} returns.loading - Whether data is currently being fetched
 * @returns {Error|null} returns.error - Any error that occurred during fetching
 * @returns {Function} returns.refetch - Function to manually refetch data
 * @returns {Function} returns.setAllItems - Function to manually update items state
 * @returns {Function} returns.setCategories - Function to manually update categories state
 * 
 * @example
 * const { allItems, categories, loading, error, refetch } = useWishlistData(user.id);
 * 
 * @example
 * // With manual fetching
 * const { allItems, refetch } = useWishlistData(user.id, { autoFetch: false });
 * // Later...
 * await refetch();
 */
export function useWishlistData(userId, options = {}) {
    const { autoFetch = true } = options;

    const [allItems, setAllItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetches both items and categories for the user
     * Uses concurrent requests for better performance
     */
    const fetchData = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Fetch items and categories concurrently for better performance
            const [itemsResponse, categoriesResponse] = await Promise.all([
                fetchUserItems(userId),
                fetchUserCategories(userId)
            ]);

            // Check for errors from either request
            if (itemsResponse.error) {
                throw itemsResponse.error;
            }
            if (categoriesResponse.error) {
                throw categoriesResponse.error;
            }

            // Update state with successful data
            setAllItems(itemsResponse.data || []);
            setCategories(categoriesResponse.data || []);
        } catch (err) {
            console.error('Error fetching wishlist data:', err);
            setError(err);
            // Set empty arrays on error to prevent UI issues
            setAllItems([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Auto-fetch on mount and when userId changes
    useEffect(() => {
        if (autoFetch && userId) {
            fetchData();
        }
    }, [userId, autoFetch, fetchData]);

    return {
        allItems,
        categories,
        loading,
        error,
        refetch: fetchData,
        setAllItems,
        setCategories
    };
}

/**
 * Hook for filtering items by category
 * Useful for category-based views
 * 
 * @param {Array} allItems - All items to filter from
 * @param {string|null} activeCategoryId - Category ID to filter by (null for all items)
 * @returns {Array} Filtered items
 * 
 * @example
 * const { allItems } = useWishlistData(user.id);
 * const filteredItems = useFilteredItems(allItems, activeCategory);
 */
export function useFilteredItems(allItems, activeCategoryId) {
    if (activeCategoryId === null) {
        return allItems;
    }
    return allItems.filter(item => item.category_id === activeCategoryId);
}

/**
 * Hook for getting items within a specific category
 * Returns both items and item IDs for convenience
 * 
 * @param {Array} allItems - All items to search through
 * @param {string} categoryId - Category ID to find items for
 * @returns {Object} Category items data
 * @returns {Array} returns.items - Items in the category
 * @returns {Array} returns.itemIds - IDs of items in the category
 * 
 * @example
 * const { items, itemIds } = useCategoryItems(allItems, categoryId);
 */
export function useCategoryItems(allItems, categoryId) {
    const items = allItems.filter(item => item.category_id === categoryId);
    const itemIds = items.map(item => item.id);

    return { items, itemIds };
}

/**
 * Hook for getting uncategorized items
 * 
 * @param {Array} allItems - All items to search through
 * @returns {Array} Items without a category
 * 
 * @example
 * const uncategorizedItems = useUncategorizedItems(allItems);
 */
export function useUncategorizedItems(allItems) {
    return allItems.filter(item => item.category_id === null);
}

/**
 * Hook for getting category statistics
 * Returns counts of items per category
 * 
 * @param {Array} allItems - All items to analyze
 * @param {Array} categories - All categories
 * @returns {Object} Category ID mapped to item count
 * 
 * @example
 * const stats = useCategoryStats(allItems, categories);
 * console.log(stats[categoryId]); // Number of items in that category
 */
export function useCategoryStats(allItems, categories) {
    const stats = {};

    // Initialize all categories with 0 count
    categories.forEach(category => {
        stats[category.id] = 0;
    });

    // Count items in each category
    allItems.forEach(item => {
        if (item.category_id && stats.hasOwnProperty(item.category_id)) {
            stats[item.category_id]++;
        }
    });

    return stats;
}
