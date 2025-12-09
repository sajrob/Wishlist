/**
 * Supabase helper functions for common database operations.
 * Provides consistent error handling and reusable query patterns.
 * 
 * @see {import('../types').WishlistItem}
 * @see {import('../types').Category}
 * @see {import('../types').Profile}
 */

import { supabase } from '../supabaseClient';

/**
 * Standard response format for all helper functions
 * @typedef {Object} SupabaseResponse
 * @property {any} data - The data returned from the query
 * @property {Error|null} error - Any error that occurred
 */

/**
 * @typedef {Object} WishlistItem
 * @property {string} id
 * @property {string} user_id
 * @property {string|null} category_id
 * @property {string} name
 * @property {number} price
 * @property {string} description
 * @property {string} image_url
 * @property {string} buy_link
 * @property {string} created_at
 */

/**
 * @typedef {Object} Category
 * @property {string} id
 * @property {string} user_id
 * @property {string} name
 * @property {boolean} is_public
 * @property {string} created_at
 */

/**
 * @typedef {Object} Profile
 * @property {string} id
 * @property {string} full_name
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} email
 * @property {string} created_at
 */

/**
 * @typedef {Object} WishlistSettings
 * @property {string} id
 * @property {boolean} is_public
 */

// ==================== ITEMS ====================

/**
 * Fetches all items for a specific user, ordered by creation date (newest first)
 * 
 * @param {string} userId - The user ID to fetch items for
 * @returns {Promise<SupabaseResponse>} Items array and any error
 * 
 * @example
 * const { data: items, error } = await fetchUserItems(user.id);
 */
export async function fetchUserItems(userId) {
    try {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching user items:', error);
        return { data: null, error };
    }
}

/**
 * Creates a new wishlist item
 * 
 * @param {Object} itemData - The item data to create
 * @param {string} itemData.user_id - The owner's user ID
 * @param {string|null} itemData.category_id - Optional category ID
 * @param {string} itemData.name - Item name
 * @param {number} itemData.price - Item price
 * @param {string} itemData.description - Item description
 * @param {string} itemData.image_url - Item image URL
 * @param {string} itemData.buy_link - Purchase link
 * @returns {Promise<SupabaseResponse>} Created item and any error
 */
export async function createItem(itemData) {
    try {
        const { data, error } = await supabase
            .from('items')
            .insert([itemData])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error creating item:', error);
        return { data: null, error };
    }
}

/**
 * Updates an existing wishlist item
 * 
 * @param {string} itemId - The item ID to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<SupabaseResponse>} Updated item and any error
 */
export async function updateItem(itemId, updates) {
    try {
        const { data, error } = await supabase
            .from('items')
            .update(updates)
            .eq('id', itemId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating item:', error);
        return { data: null, error };
    }
}

/**
 * Deletes a wishlist item
 * 
 * @param {string} itemId - The item ID to delete
 * @returns {Promise<SupabaseResponse>} Success status and any error
 */
export async function deleteItem(itemId) {
    try {
        const { error } = await supabase
            .from('items')
            .delete()
            .eq('id', itemId);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error deleting item:', error);
        return { data: null, error };
    }
}

/**
 * Updates the category for one or more items
 * 
 * @param {string[]} itemIds - Array of item IDs to update
 * @param {string|null} categoryId - New category ID (null to uncategorize)
 * @returns {Promise<SupabaseResponse>} Success status and any error
 */
export async function updateItemsCategory(itemIds, categoryId) {
    try {
        const { error } = await supabase
            .from('items')
            .update({ category_id: categoryId })
            .in('id', itemIds);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error updating items category:', error);
        return { data: null, error };
    }
}

// ==================== CATEGORIES ====================

/**
 * Fetches all categories for a specific user, ordered by creation date
 * 
 * @param {string} userId - The user ID to fetch categories for
 * @returns {Promise<SupabaseResponse>} Categories array and any error
 */
export async function fetchUserCategories(userId) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching user categories:', error);
        return { data: null, error };
    }
}

/**
 * Creates a new category
 * 
 * @param {Object} categoryData - The category data
 * @param {string} categoryData.user_id - The owner's user ID
 * @param {string} categoryData.name - Category name
 * @param {boolean} categoryData.is_public - Whether category is public
 * @returns {Promise<SupabaseResponse>} Created category and any error
 */
export async function createCategory(categoryData) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .insert([categoryData])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error creating category:', error);
        return { data: null, error };
    }
}

/**
 * Updates an existing category
 * 
 * @param {string} categoryId - The category ID to update
 * @param {Object} updates - The fields to update
 * @returns {Promise<SupabaseResponse>} Updated category and any error
 */
export async function updateCategory(categoryId, updates) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .update(updates)
            .eq('id', categoryId)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating category:', error);
        return { data: null, error };
    }
}

/**
 * Deletes a category
 * 
 * @param {string} categoryId - The category ID to delete
 * @returns {Promise<SupabaseResponse>} Success status and any error
 */
export async function deleteCategory(categoryId) {
    try {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', categoryId);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { data: null, error };
    }
}

/**
 * Uncategorizes all items in a category (sets category_id to null)
 * 
 * @param {string} categoryId - The category ID
 * @returns {Promise<SupabaseResponse>} Success status and any error
 */
export async function uncategorizeItems(categoryId) {
    try {
        const { error } = await supabase
            .from('items')
            .update({ category_id: null })
            .eq('category_id', categoryId);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error uncategorizing items:', error);
        return { data: null, error };
    }
}

// ==================== PROFILES ====================

/**
 * Fetches a user profile by ID
 * 
 * @param {string} userId - The user ID to fetch
 * @returns {Promise<SupabaseResponse>} Profile object and any error
 */
export async function fetchProfile(userId) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching profile:', error);
        return { data: null, error };
    }
}

/**
 * Fetches multiple profiles by IDs
 * 
 * @param {string[]} userIds - Array of user IDs to fetch
 * @returns {Promise<SupabaseResponse>} Profiles array and any error
 */
export async function fetchProfiles(userIds) {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .in('id', userIds);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching profiles:', error);
        return { data: null, error };
    }
}

// ==================== WISHLIST SETTINGS ====================

/**
 * Fetches wishlist settings (public/private status)
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<SupabaseResponse>} Wishlist settings and any error
 */
export async function fetchWishlistSettings(userId) {
    try {
        const { data, error } = await supabase
            .from('wishlists')
            .select('is_public')
            .eq('id', userId)
            .single();

        if (error) {
            // If no record exists (PGRST116), create one with default false
            if (error.code === 'PGRST116') {
                return await createWishlistSettings(userId, false);
            }
            throw error;
        }

        return { data, error: null };
    } catch (error) {
        console.error('Error fetching wishlist settings:', error);
        return { data: null, error };
    }
}

/**
 * Creates wishlist settings for a user
 * 
 * @param {string} userId - The user ID
 * @param {boolean} isPublic - Whether wishlist is public
 * @returns {Promise<SupabaseResponse>} Created settings and any error
 */
export async function createWishlistSettings(userId, isPublic = false) {
    try {
        const { data, error } = await supabase
            .from('wishlists')
            .insert([{ id: userId, is_public: isPublic }])
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error creating wishlist settings:', error);
        return { data: null, error };
    }
}

/**
 * Updates wishlist public/private status
 * 
 * @param {string} userId - The user ID
 * @param {boolean} isPublic - New public status
 * @returns {Promise<SupabaseResponse>} Success status and any error
 */
export async function updateWishlistSettings(userId, isPublic) {
    try {
        const { error } = await supabase
            .from('wishlists')
            .update({ is_public: isPublic })
            .eq('id', userId);

        if (error) throw error;
        return { data: { is_public: isPublic }, error: null };
    } catch (error) {
        console.error('Error updating wishlist settings:', error);
        return { data: null, error };
    }
}

// ==================== FRIENDS ====================

/**
 * Fetches the list of friends (users being followed) for a user
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<SupabaseResponse>} Array of friend IDs and any error
 */
export async function fetchFriends(userId) {
    try {
        const { data, error } = await supabase
            .from('friends')
            .select('friend_id')
            .eq('user_id', userId);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching friends:', error);
        return { data: null, error };
    }
}

/**
 * Fetches public categories for specific users
 * 
 * @param {string[]} userIds - Array of user IDs
 * @returns {Promise<SupabaseResponse>} Public categories and any error
 */
export async function fetchPublicCategories(userIds) {
    try {
        const { data, error } = await supabase
            .from('categories')
            .select('user_id, id, name, is_public')
            .in('user_id', userIds)
            .eq('is_public', true);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching public categories:', error);
        return { data: null, error };
    }
}

/**
 * Fetches items in specific categories
 * 
 * @param {string[]} categoryIds - Array of category IDs
 * @returns {Promise<SupabaseResponse>} Items in those categories and any error
 */
export async function fetchItemsByCategories(categoryIds) {
    try {
        const { data, error } = await supabase
            .from('items')
            .select('user_id, category_id, id')
            .in('category_id', categoryIds);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching items by categories:', error);
        return { data: null, error };
    }
}
