/**
 * Custom hook for managing wishlist public/private settings
 * Handles fetching and updating wishlist visibility status
 */

import { useState, useEffect, useCallback } from 'react';
import { fetchWishlistSettings, updateWishlistSettings } from '../utils/supabaseHelpers';
import type { UseWishlistSettingsReturn, WishlistSettings } from '../types';

type Options = {
    autoFetch?: boolean;
};

export function useWishlistSettings(userId: string | null, options: Options = {}): UseWishlistSettingsReturn {
    const { autoFetch = true } = options;

    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchSettings = useCallback(async () => {
        if (!userId) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fetchError } = await fetchWishlistSettings(userId);

            if (fetchError) throw fetchError;

            if (data) {
                setIsPublic(data.is_public || false);
            }
        } catch (err) {
            console.error('Error fetching wishlist settings:', err);
            setError(err as Error);
            setIsPublic(false);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    const updatePublicStatus = useCallback(
        async (newIsPublic: boolean) => {
            if (!userId) return false;

            const previousValue = isPublic;
            setIsPublic(newIsPublic);
            setError(null);

            try {
                const { error: updateError } = await updateWishlistSettings(userId, newIsPublic);

                if (updateError) throw updateError;

                return true;
            } catch (err) {
                console.error('Error updating wishlist settings:', err);
                setError(err as Error);
                setIsPublic(previousValue);

                return false;
            }
        },
        [userId, isPublic],
    );

    const togglePublic = useCallback(async () => {
        return await updatePublicStatus(!isPublic);
    }, [isPublic, updatePublicStatus]);

    const setPublicStatus = useCallback(
        async (status: boolean) => {
            return await updatePublicStatus(status);
        },
        [updatePublicStatus],
    );

    useEffect(() => {
        if (autoFetch && userId) {
            void fetchSettings();
        }
    }, [userId, autoFetch, fetchSettings]);

    return {
        isPublic,
        loading,
        error,
        togglePublic,
        setIsPublic: setPublicStatus,
        refetch: fetchSettings,
    };
}

export function useWishlistSettingsReadOnly(userId: string | null): { isPublic: boolean; loading: boolean } {
    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const fetchSettings = async () => {
            setLoading(true);
            try {
                const { data } = await fetchWishlistSettings(userId);
                if (data) {
                    setIsPublic(data.is_public || false);
                }
            } catch (err) {
                console.error('Error fetching wishlist settings:', err);
                setIsPublic(false);
            } finally {
                setLoading(false);
            }
        };

        void fetchSettings();
    }, [userId]);

    return { isPublic, loading };
}


