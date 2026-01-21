/**
 * React Query configuration and client setup
 * Provides centralized caching and data fetching configuration
 */
import { QueryClient } from '@tanstack/react-query';

// Create the QueryClient with optimized defaults
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Refetch on window focus for fresh data
            refetchOnWindowFocus: true,

            // Stale time - how long data is considered fresh
            // Categories and friends don't change often
            staleTime: 5 * 60 * 1000, // 5 minutes

            // Cache time - how long unused data stays in cache
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)

            // Retry configuration
            retry: 1, // Retry failed queries once
            retryDelay: 1000, // Wait 1 second before retry

            // Disable automatic background refetching by default
            // (can be overridden per query)
            refetchOnMount: true,
            refetchOnReconnect: true,
        },
        mutations: {
            // Retry failed mutations once
            retry: 1,
        },
    },
});

// Query key factory for consistent key management
export const queryKeys = {
    // Categories
    categories: (userId: string) => ['categories', userId] as const,

    // Wishlist items
    items: (userId: string) => ['items', userId] as const,
    itemsWithClaims: (userId: string) => ['items', userId, 'with-claims'] as const,

    // Friends and connections
    friends: (userId: string) => ['friends', userId] as const,
    followers: (userId: string) => ['followers', userId] as const,
    connections: (userId: string) => ['connections', userId] as const,

    // Notifications
    notifications: (userId: string) => ['notifications', userId] as const,
    unreadCount: (userId: string) => ['notifications', userId, 'unread-count'] as const,

    // User profiles
    profile: (userId: string) => ['profile', userId] as const,

    // Wishlist settings
    settings: (userId: string) => ['settings', userId] as const,
};
