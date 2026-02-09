/**
 * Custom hook for managing wishlist data (items and categories) using React Query
 */
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchUserItems, fetchUserCategories } from '@/api';
import { queryKeys } from '@/lib/queryClient';
import type { Category, CategoryStats, WishlistItem } from '../types';

type Options = {
    includeClaims?: boolean;
};

export function useWishlistData(userId: string | null, options: Options = {}) {
    const { includeClaims = false } = options;
    const queryClient = useQueryClient();

    const { data: allItems = [], isLoading: itemsLoading, error: itemsError } = useQuery({
        queryKey: includeClaims ? queryKeys.itemsWithClaims(userId || '') : queryKeys.items(userId || ''),
        queryFn: async () => {
            const res = await fetchUserItems(userId!, includeClaims);
            if (res.error) throw res.error;
            return res.data || [];
        },
        enabled: !!userId,
    });

    const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
        queryKey: queryKeys.categories(userId || ''),
        queryFn: async () => {
            const res = await fetchUserCategories(userId!);
            if (res.error) throw res.error;
            return res.data || [];
        },
        enabled: !!userId,
    });

    const loading = itemsLoading || categoriesLoading;
    const error = itemsError || categoriesError;

    return {
        allItems,
        categories,
        loading,
        error,
        refetch: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.items(userId || '') });
            queryClient.invalidateQueries({ queryKey: queryKeys.categories(userId || '') });
        },
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
