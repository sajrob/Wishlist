import { supabase } from "@/supabaseClient";
import { Feedback, AdminUser, AdminWishlist, AdminItem, AdminClaim, AdminActivityLog } from "@/types/admin";
import { Category } from "@/types";

// ==================== ACTIVITY LOGS ====================

export const getAdminActivityLog = async () => {
    const { data, error } = await supabase
        .from("admin_activity_log")
        .select(`
            *,
            admin:profiles (full_name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) throw error;
    return data as AdminActivityLog[];
};

export const logAdminAction = async (action: Omit<AdminActivityLog, 'id' | 'created_at' | 'admin'>) => {
    const { error } = await supabase
        .from("admin_activity_log")
        .insert([action]);

    if (error) {
        console.error("Failed to log admin action:", error);
    }
};


// ==================== FEEDBACK ====================

export const getAdminFeedback = async () => {
    const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Feedback[];
};

export const updateFeedbackStatus = async (id: string, status: Feedback['status'], internal_notes?: string) => {
    const { error } = await supabase
        .from("feedback")
        .update({ status, internal_notes })
        .eq("id", id);

    if (error) throw error;
    return true;
};

export const deleteFeedback = async (id: string) => {
    const { error } = await supabase
        .from("feedback")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
};

// ==================== USERS ====================

export const getAdminUsers = async () => {
    // We'll fetch profiles and then manually handle stats if joins fails
    // Using !user_id to help PostgREST find the relationship
    const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
            *,
            wishlists_count:categories!user_id(count),
            items_count:items!user_id(count)
        `)
        .order("full_name", { ascending: true }); // Order by name instead

    if (profilesError) {
        console.error("Join error in getAdminUsers, falling back to simple fetch:", profilesError);
        // Fallback: fetch without joins if it fails
        const { data: rawProfiles, error: rawError } = await supabase
            .from("profiles")
            .select("*")
            .order("full_name", { ascending: true });

        if (rawError) throw rawError;

        return rawProfiles.map(p => ({
            ...p,
            stats: {
                wishlists_count: 0,
                items_count: 0,
                friends_count: 0
            }
        })) as AdminUser[];
    }

    return profiles.map(p => ({
        ...p,
        stats: {
            wishlists_count: p.wishlists_count?.[0]?.count || 0,
            items_count: p.items_count?.[0]?.count || 0,
            friends_count: 0
        }
    })) as AdminUser[];
};

export const toggleAdminStatus = async (userId: string, isAdmin: boolean) => {
    const { error } = await supabase
        .from("profiles")
        .update({ is_admin: isAdmin })
        .eq("id", userId);

    if (error) throw error;
    return true;
};

// ==================== WISHLISTS / CATEGORIES ====================

export const getAdminWishlists = async () => {
    const { data, error } = await supabase
        .from("categories")
        .select(`
            *,
            user:profiles!user_id (id, full_name, username, avatar_url),
            items_count:items!category_id (count)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Join error in getAdminWishlists, falling back:", error);
        const { data: raw, error: rawError } = await supabase
            .from("categories")
            .select("*")
            .order("created_at", { ascending: false });

        if (rawError) throw rawError;
        return raw.map(item => ({ ...item, items_count: 0 })) as AdminWishlist[];
    }

    return data.map(item => ({
        ...item,
        items_count: item.items_count?.[0]?.count || 0
    })) as AdminWishlist[];
};

// ==================== ITEMS ====================

export const getAdminItems = async () => {
    const { data, error } = await supabase
        .from("items")
        .select(`
            *,
            wishlist:categories!category_id (name),
            owner:profiles!user_id (full_name),
            claims_count:claims!item_id (count)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Join error in getAdminItems, falling back:", error);
        const { data: raw, error: rawError } = await supabase
            .from("items")
            .select("*")
            .order("created_at", { ascending: false });

        if (rawError) throw rawError;
        return raw.map(item => ({
            ...item,
            wishlist_name: 'Unknown',
            owner_name: 'Unknown',
            claims_count: 0
        })) as AdminItem[];
    }

    return data.map(item => ({
        ...item,
        wishlist_name: item.wishlist?.name || 'Unknown',
        owner_name: item.owner?.full_name || 'Unknown',
        claims_count: item.claims_count?.[0]?.count || 0
    })) as AdminItem[];
};

export const deleteAdminItem = async (id: string) => {
    const { error } = await supabase
        .from("items")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
};

// ==================== GLOBAL SEARCH ====================

export const searchAdmin = async (query: string) => {
    if (!query) return { users: [], feedback: [], wishlists: [] };

    const [usersRes, feedbackRes, wishlistsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, username").ilike("full_name", `%${query}%`).limit(5),
        supabase.from("feedback").select("id, username, message").ilike("message", `%${query}%`).limit(5),
        supabase.from("categories").select("id, name").ilike("name", `%${query}%`).limit(5),
    ]);

    return {
        users: usersRes.data || [],
        feedback: feedbackRes.data || [],
        wishlists: wishlistsRes.data || [],
    };
};

// ==================== CLAIMS ====================

export const getAdminClaims = async () => {
    const { data, error } = await supabase
        .from("claims")
        .select(`
            *,
            item:items!item_id (name, image_url, user_id),
            claimer:profiles!claims_user_id_fkey (full_name)
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Join error in getAdminClaims, falling back:", error);
        const { data: raw, error: rawError } = await supabase
            .from("claims")
            .select("*")
            .order("created_at", { ascending: false });

        if (rawError) throw rawError;
        return raw.map(c => ({
            ...c,
            item_name: 'Unknown',
            claimer_name: 'Unknown',
            owner_name: 'Unknown'
        })) as AdminClaim[];
    }

    // We need to fetch owner names separately or via another join if possible
    const claims = await Promise.all(data.map(async (claim: any) => {
        const { data: owner } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", claim.item?.user_id)
            .single();

        return {
            ...claim,
            item_name: claim.item?.name || 'Unknown',
            item_image: claim.item?.image_url,
            claimer_name: claim.claimer?.full_name || 'Unknown',
            owner_name: owner?.full_name || 'Unknown'
        };
    }));

    return claims as AdminClaim[];
};

export const deleteAdminClaim = async (id: string) => {
    const { error } = await supabase
        .from("claims")
        .delete()
        .eq("id", id);

    if (error) throw error;
    return true;
};

// ==================== CATEGORIES (All) ====================

export const getAdminCategories = async () => {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

    if (error) throw error;
    return data as Category[];
};


