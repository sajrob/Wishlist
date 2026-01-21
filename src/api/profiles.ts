import { supabase } from '../supabaseClient';
import type { Profile, SupabaseResponse } from '../types';

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

export async function searchProfiles(query: string, currentUserId: string): Promise<SupabaseResponse<Profile[]>> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .neq('id', currentUserId)
            .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
            .limit(20);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error searching profiles:', error);
        return { data: null, error: error as Error };
    }
}

export async function updateProfile(profileData: Partial<Profile> & { id: string }): Promise<SupabaseResponse<Profile>> {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...profileData, updated_at: new Date() })
            .eq('id', profileData.id)
            .select()
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { data: null, error: error as Error };
    }
}

export async function fetchUserStats(userId: string): Promise<SupabaseResponse<{ items: number, categories: number }>> {
    try {
        const [itemsCount, catsCount] = await Promise.all([
            supabase.from('items').select('*', { count: 'exact', head: true }).eq('user_id', userId),
            supabase.from('categories').select('*', { count: 'exact', head: true }).eq('user_id', userId)
        ]);

        if (itemsCount.error) throw itemsCount.error;
        if (catsCount.error) throw catsCount.error;

        return {
            data: {
                items: itemsCount.count || 0,
                categories: catsCount.count || 0
            },
            error: null
        };
    } catch (error) {
        console.error('Error fetching user stats:', error);
        return { data: null, error: error as Error };
    }
}
