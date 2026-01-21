import { supabase } from '../supabaseClient';
import { fetchProfiles } from './profiles';
import type { Profile, SupabaseResponse, WishlistItem } from '../types';

export async function fetchFriends(
    userId: string,
): Promise<SupabaseResponse<any[]>> {
    try {
        const { data, error } = await supabase
            .from('friends')
            .select(`
                friend_id,
                profiles!friends_friend_id_fkey (
                    id,
                    full_name,
                    username,
                    avatar_url
                )
            `)
            .eq('user_id', userId);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching friends:', error);
        return { data: null, error: error as Error };
    }
}

export async function fetchFollowers(
    userId: string,
): Promise<SupabaseResponse<any[]>> {
    try {
        const { data, error } = await supabase
            .from('friends')
            .select(`
                user_id,
                profiles!friends_user_id_fkey (
                    id,
                    full_name,
                    username,
                    avatar_url
                )
            `)
            .eq('friend_id', userId);

        if (error) throw error;
        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching followers:', error);
        return { data: null, error: error as Error };
    }
}

export async function fetchMutualFriends(userId: string): Promise<SupabaseResponse<Profile[]>> {
    try {
        const { data: following, error: fError } = await fetchFriends(userId);
        if (fError) throw fError;

        const { data: followers, error: folError } = await fetchFollowers(userId);
        if (folError) throw folError;

        const followingIds = new Set((following || []).map(f => f.friend_id));
        const mutualIds = (followers || []).map(f => f.user_id).filter(id => followingIds.has(id));

        if (mutualIds.length === 0) return { data: [], error: null };

        return await fetchProfiles(mutualIds);
    } catch (error) {
        console.error('Error fetching mutual friends:', error);
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

export async function followUser(userId: string, friendId: string): Promise<SupabaseResponse<boolean>> {
    try {
        const { error } = await supabase
            .from('friends')
            .insert([{ user_id: userId, friend_id: friendId }]);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error following user:', error);
        return { data: null, error: error as Error };
    }
}

export async function unfollowUser(userId: string, friendId: string): Promise<SupabaseResponse<boolean>> {
    try {
        const { error } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', userId)
            .eq('friend_id', friendId);

        if (error) throw error;
        return { data: true, error: null };
    } catch (error) {
        console.error('Error unfollowing user:', error);
        return { data: null, error: error as Error };
    }
}
