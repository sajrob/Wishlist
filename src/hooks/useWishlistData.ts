/**
 * Custom hook for managing wishlist data (items and categories)
 * Provides a unified interface for fetching and managing wishlist state
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchUserItems, fetchUserCategories } from '../utils/supabaseHelpers';
import type { Category, CategoryStats, UseWishlistDataReturn, WishlistItem } from '../types';

type Options = {
    autoFetch?: boolean;
    includeClaims?: boolean;
};

export function useWishlistData(userId: string | null, options: Options = {}): UseWishlistDataReturn {
    const { autoFetch = true, includeClaims = false } = options;

    const [allItems, setAllItems] = useState<WishlistItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [itemsResponse, categoriesResponse] = await Promise.all([
                fetchUserItems(userId, includeClaims),
                fetchUserCategories(userId),
            ]);

            if (itemsResponse.error) {
                throw itemsResponse.error;
            }
            if (categoriesResponse.error) {
                throw categoriesResponse.error;
            }

            setAllItems(itemsResponse.data || []);
            setCategories(categoriesResponse.data || []);
        } catch (err) {
            console.error('Error fetching wishlist data:', err);
            setError(err as Error);
            setAllItems([]);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    }, [userId, includeClaims]);

    useEffect(() => {
        if (autoFetch && userId) {
            void fetchData();
        }
    }, [userId, autoFetch, fetchData]);

    return {
        allItems,
        categories,
        loading,
        error,
        refetch: fetchData,
        setAllItems,
        setCategories,
    };
}

export function useFilteredItems(allItems: WishlistItem[], activeCategoryId: string | null) {
    const filtered = activeCategoryId === null
        ? allItems
        : allItems.filter(item => item.category_id === activeCategoryId);

    return [...filtered].sort((a, b) => {
        if (a.is_must_have && !b.is_must_have) return -1;
        if (!a.is_must_have && b.is_must_have) return 1;
        return 0;
    });
}

export function useCategoryItems(allItems: WishlistItem[], categoryId: string) {
    const items = allItems.filter(item => item.category_id === categoryId);
    const itemIds = items.map(item => item.id);

    return { items, itemIds };
}

export function useUncategorizedItems(allItems: WishlistItem[]) {
    const filtered = allItems.filter(item => item.category_id === null);
    return [...filtered].sort((a, b) => {
        if (a.is_must_have && !b.is_must_have) return -1;
        if (!a.is_must_have && b.is_must_have) return 1;
        return 0;
    });
}

export function useCategoryStats(allItems: WishlistItem[], categories: Category[]): CategoryStats {
    const stats: CategoryStats = {};

    categories.forEach(category => {
        stats[category.id] = 0;
    });

    allItems.forEach(item => {
        if (item.category_id && Object.prototype.hasOwnProperty.call(stats, item.category_id)) {
            stats[item.category_id] += 1;
        }
    });

    return stats;
}


