import { supabase } from '../supabaseClient';
import type { WishlistSettings, SupabaseResponse } from '../types';

export async function fetchWishlistSettings(
    userId: string,
): Promise<SupabaseResponse<WishlistSettings>> {
    try {
        const { data, error } = await supabase
            .from('wishlists')
            .select('id, is_public')
            .eq('id', userId)
            .single();

        if (error) {
            if ((error as { code?: string }).code === 'PGRST116') {
                const result = await createWishlistSettings(userId, false);
                return result;
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
): Promise<SupabaseResponse<WishlistSettings>> {
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
