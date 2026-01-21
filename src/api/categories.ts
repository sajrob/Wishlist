import { supabase } from '../supabaseClient';
import type { Category, SupabaseResponse, CategoryInsert } from '../types';

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
