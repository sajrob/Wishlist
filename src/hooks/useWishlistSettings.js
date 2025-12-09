/**
 * Custom hook for managing wishlist public/private settings
 * Handles fetching and updating wishlist visibility status
 */

import { useState, useEffect, useCallback } from 'react';
import {
    fetchWishlistSettings,
    updateWishlistSettings
} from '../utils/supabaseHelpers';

/**
 * Hook for managing wishlist public/private settings
 * 
 * @param {string} userId - The user ID whose settings to manage
 * @param {Object} options - Configuration options
 * @param {boolean} options.autoFetch - Whether to automatically fetch on mount (default: true)
 * @returns {Object} Settings state and methods
 * @returns {boolean} returns.isPublic - Whether the wishlist is public
 * @returns {boolean} returns.loading - Whether settings are being loaded/updated
 * @returns {Error|null} returns.error - Any error that occurred
 * @returns {Function} returns.togglePublic - Function to toggle public/private status
 * @returns {Function} returns.setIsPublic - Function to set specific public status
 * @returns {Function} returns.refetch - Function to manually refetch settings
 * 
 * @example
 * const { isPublic, loading, togglePublic } = useWishlistSettings(user.id);
 * 
 * @example
 * // With manual control
 * const { isPublic, setIsPublic } = useWishlistSettings(user.id);
 * await setIsPublic(true);
 */
export function useWishlistSettings(userId, options = {}) {
    const { autoFetch = true } = options;

    const [isPublic, setIsPublic] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetches wishlist settings from the database
     */
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
            setError(err);
            // Default to private on error
            setIsPublic(false);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    /**
     * Updates the wishlist public/private status
     * 
     * @param {boolean} newIsPublic - New public status to set
     * @returns {Promise<boolean>} Whether update was successful
     */
    const updatePublicStatus = useCallback(async (newIsPublic) => {
        if (!userId) return false;

        // Optimistic UI update
        const previousValue = isPublic;
        setIsPublic(newIsPublic);
        setError(null);

        try {
            const { error: updateError } = await updateWishlistSettings(userId, newIsPublic);

            if (updateError) throw updateError;

            return true;
        } catch (err) {
            console.error('Error updating wishlist settings:', err);
            setError(err);

            // Revert to previous value on error
            setIsPublic(previousValue);

            return false;
        }
    }, [userId, isPublic]);

    /**
     * Toggles the public/private status
     * 
     * @returns {Promise<boolean>} Whether toggle was successful
     */
    const togglePublic = useCallback(async () => {
        return await updatePublicStatus(!isPublic);
    }, [isPublic, updatePublicStatus]);

    /**
     * Sets a specific public status
     * 
     * @param {boolean} status - The status to set
     * @returns {Promise<boolean>} Whether update was successful
     */
    const setPublicStatus = useCallback(async (status) => {
        return await updatePublicStatus(status);
    }, [updatePublicStatus]);

    // Auto-fetch on mount and when userId changes
    useEffect(() => {
        if (autoFetch && userId) {
            fetchSettings();
        }
    }, [userId, autoFetch, fetchSettings]);

    return {
        isPublic,
        loading,
        error,
        togglePublic,
        setIsPublic: setPublicStatus,
        refetch: fetchSettings
    };
}

/**
 * Simpler hook for read-only wishlist settings
 * Useful when viewing other users' wishlists
 * 
 * @param {string} userId - The user ID to check
 * @returns {Object} Read-only settings
 * @returns {boolean} returns.isPublic - Whether the wishlist is public
 * @returns {boolean} returns.loading - Whether settings are being loaded
 * 
 * @example
 * const { isPublic, loading } = useWishlistSettingsReadOnly(friendId);
 */
export function useWishlistSettingsReadOnly(userId) {
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

        fetchSettings();
    }, [userId]);

    return { isPublic, loading };
}
