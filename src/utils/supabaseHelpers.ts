/**
 * Supabase helper functions for common database operations.
 * Provides consistent error handling and reusable query patterns.
 */

import { supabase } from '../supabaseClient';
import type {
    Category,
    Profile,
    SupabaseResponse,
    WishlistItem,
    WishlistSettings,
} from '../types';

type ItemInsert = Pick<
    WishlistItem,
    'user_id' | 'category_id' | 'name' | 'price' | 'description' | 'image_url' | 'buy_link'
>;
type CategoryInsert = Pick<Category, 'user_id' | 'name' | 'is_public'>;
type WishlistSettingsRow = WishlistSettings;

// ==================== ITEMS ====================

export async function fetchUserItems(userId: string): Promise<SupabaseResponse<WishlistItem[]>> {
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
        return { data: null, error: error as Error };
    }
}

export async function createItem(itemData: ItemInsert): Promise<SupabaseResponse<WishlistItem>> {
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
        return { data: null, error: error as Error };
    }
}

export async function updateItem(
    itemId: string,
    updates: Partial<WishlistItem>,
): Promise<SupabaseResponse<WishlistItem>> {
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
        return { data: null, error: error as Error };
    }
}

export async function deleteItem(itemId: string): Promise<SupabaseResponse<boolean>> {
    try {
        const { error } = await supabase.from('items').delete().eq('id', itemId);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error deleting item:', error);
        return { data: null, error: error as Error };
    }
}

export async function updateItemsCategory(
    itemIds: string[],
    categoryId: string | null,
): Promise<SupabaseResponse<boolean>> {
    try {
        const { error } = await supabase
            .from('items')
            .update({ category_id: categoryId })
            .in('id', itemIds);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error updating items category:', error);
        return { data: null, error: error as Error };
    }
}

// ==================== CATEGORIES ====================

export async function fetchUserCategories(userId: string): Promise<SupabaseResponse<Category[]>> {
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
        return { data: null, error: error as Error };
    }
}

export async function createCategory(
    categoryData: CategoryInsert,
): Promise<SupabaseResponse<Category>> {
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
        return { data: null, error: error as Error };
    }
}

export async function updateCategory(
    categoryId: string,
    updates: Partial<Category>,
): Promise<SupabaseResponse<Category>> {
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
        return { data: null, error: error as Error };
    }
}

export async function deleteCategory(categoryId: string): Promise<SupabaseResponse<boolean>> {
    try {
        const { error } = await supabase.from('categories').delete().eq('id', categoryId);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error deleting category:', error);
        return { data: null, error: error as Error };
    }
}

export async function uncategorizeItems(categoryId: string): Promise<SupabaseResponse<boolean>> {
    try {
        const { error } = await supabase
            .from('items')
            .update({ category_id: null })
            .eq('category_id', categoryId);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error uncategorizing items:', error);
        return { data: null, error: error as Error };
    }
}

// ==================== PROFILES ====================

export async function fetchProfile(userId: string): Promise<SupabaseResponse<Profile>> {
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
        return { data: null, error: error as Error };
    }
}

export async function fetchProfiles(userIds: string[]): Promise<SupabaseResponse<Profile[]>> {
    try {
        const { data, error } = await supabase.from('profiles').select('*').in('id', userIds);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching profiles:', error);
        return { data: null, error: error as Error };
    }
}

// ==================== WISHLIST SETTINGS ====================

export async function fetchWishlistSettings(
    userId: string,
): Promise<SupabaseResponse<WishlistSettingsRow>> {
    try {
        const { data, error } = await supabase
            .from('wishlists')
            .select('is_public')
            .eq('id', userId)
            .single();

        if (error) {
            if ((error as { code?: string }).code === 'PGRST116') {
                return await createWishlistSettings(userId, false);
            }
            throw error;
        }

        return { data, error: null };
    } catch (error) {
        console.error('Error fetching wishlist settings:', error);
        return { data: null, error: error as Error };
    }
}

export async function createWishlistSettings(
    userId: string,
    isPublic = false,
): Promise<SupabaseResponse<WishlistSettingsRow>> {
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
        return { data: null, error: error as Error };
    }
}

export async function updateWishlistSettings(
    userId: string,
    isPublic: boolean,
): Promise<SupabaseResponse<{ is_public: boolean }>> {
    try {
        const { error } = await supabase.from('wishlists').update({ is_public: isPublic }).eq('id', userId);

        if (error) throw error;
        return { data: { is_public: isPublic }, error: null };
    } catch (error) {
        console.error('Error updating wishlist settings:', error);
        return { data: null, error: error as Error };
    }
}

// ==================== FRIENDS ====================

export async function fetchFriends(
    userId: string,
): Promise<SupabaseResponse<Array<{ friend_id: string }>>> {
    try {
        const { data, error } = await supabase
            .from('friends')
            .select('friend_id')
            .eq('user_id', userId);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching friends:', error);
        return { data: null, error: error as Error };
    }
}

export async function fetchPublicCategories(
    userIds: string[],
): Promise<SupabaseResponse<Array<Pick<Category, 'user_id' | 'id' | 'name' | 'is_public'>>>> {
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
        return { data: null, error: error as Error };
    }
}

export async function fetchItemsByCategories(
    categoryIds: string[],
): Promise<SupabaseResponse<Array<Pick<WishlistItem, 'user_id' | 'category_id' | 'id'>>>> {
    try {
        const { data, error } = await supabase
            .from('items')
            .select('user_id, category_id, id')
            .in('category_id', categoryIds);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching items by categories:', error);
        return { data: null, error: error as Error };
    }
}


