import React, { createContext, useContext, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useWishlistData } from "../hooks/useWishlistData";
import type { Category, WishlistItem } from "../types";

type WishlistContextValue = {
    allItems: WishlistItem[];
    categories: Category[];
    loading: boolean;
    error: Error | null;
    refresh: () => void;
    // Note: setAllItems and setCategories are now managed by React Query
    // We provide placeholders or update components to not rely on manual state updates
    setAllItems: (items: WishlistItem[] | ((prev: WishlistItem[]) => WishlistItem[])) => void;
    setCategories: (cats: Category[] | ((prev: Category[]) => Category[])) => void;
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
    const { allItems, categories, loading, error, refetch } = useWishlistData(user?.id || null);

    // Provide setter functions that might be used for optimistic updates or manual overrides
    // (though React Query's cache is preferred)
    const setAllItems = () => {
        console.warn("Manual setAllItems is discouraged with React Query. Use Mutations instead.");
    };
    const setCategories = () => {
        console.warn("Manual setCategories is discouraged with React Query. Use Mutations instead.");
    };

    const value = {
        allItems,
        categories,
        loading,
        error: error as Error | null,
        refresh: refetch,
        setAllItems,
        setCategories,
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}
