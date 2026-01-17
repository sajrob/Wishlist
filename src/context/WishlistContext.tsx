import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { fetchUserItems, fetchUserCategories } from "../utils/supabaseHelpers";
import type { Category, WishlistItem } from "../types";

type WishlistContextValue = {
    allItems: WishlistItem[];
    categories: Category[];
    loading: boolean;
    error: Error | null;
    refresh: () => Promise<void>;
    setAllItems: React.Dispatch<React.SetStateAction<WishlistItem[]>>;
    setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
};

const WishlistContext = createContext<WishlistContextValue | undefined>(undefined);

export function useWishlistContext(): WishlistContextValue {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error("useWishlistContext must be used within a WishlistProvider");
    }
    return context;
}

export function WishlistProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth();
    const [allItems, setAllItems] = useState<WishlistItem[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        if (!user) {
            setAllItems([]);
            setCategories([]);
            setLoading(false);
            return;
        }

        // Only set loading to true if we don't have data, or if we want to show a spinner
        // For smooth UX, we might want to keep showing stale data while re-fetching
        if (allItems.length === 0 && categories.length === 0) {
            setLoading(true);
        }

        setError(null);

        try {
            const [itemsResponse, categoriesResponse] = await Promise.all([
                fetchUserItems(user.id, false),
                fetchUserCategories(user.id),
            ]);

            if (itemsResponse.error) throw itemsResponse.error;
            if (categoriesResponse.error) throw categoriesResponse.error;

            setAllItems(itemsResponse.data || []);
            setCategories(categoriesResponse.data || []);
        } catch (err) {
            console.error("Error fetching wishlist data:", err);
            setError(err as Error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Initial fetch when user changes
    useEffect(() => {
        void fetchData();
    }, [user]);

    const value = {
        allItems,
        categories,
        loading,
        error,
        refresh: fetchData,
        setAllItems,
        setCategories,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
