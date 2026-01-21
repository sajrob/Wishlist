import { supabase } from '../supabaseClient';
import type { SupabaseResponse, WishlistItem, Claim, ItemInsert } from '../types';

export async function fetchUserItems(
    userId: string,
    includeClaims = false
): Promise<SupabaseResponse<WishlistItem[]>> {
    try {
        let query = supabase
            .from('items')
            .select(includeClaims ? '*, claims(*, profiles(*))' : '*')
            .eq('user_id', userId)
            .order('is_must_have', { ascending: false })
            .order('created_at', { ascending: false });

        const { data, error } = await (query as any);

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

export async function toggleClaim(
    itemId: string,
    userId: string,
    isClaimed: boolean
): Promise<SupabaseResponse<boolean>> {
    try {
        if (isClaimed) {
            const { error } = await supabase
                .from('claims')
                .delete()
                .eq('item_id', itemId)
                .eq('user_id', userId);
            if (error) throw error;
        } else {
            const { error } = await supabase
                .from('claims')
                .insert([{ item_id: itemId, user_id: userId }]);
            if (error) throw error;
        }
        return { data: true, error: null };
    } catch (error) {
        console.error('Error toggling claim:', error);
        return { data: null, error: error as Error };
    }
}

export async function fetchItemClaims(itemId: string): Promise<SupabaseResponse<Claim[]>> {
    try {
        const { data, error } = await supabase
            .from('claims')
            .select('*, profiles(*)')
            .eq('item_id', itemId);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching item claims:', error);
        return { data: null, error: error as Error };
    }
}
