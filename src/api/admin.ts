import { supabase } from "@/supabaseClient";
import { Feedback, AdminUser, AdminWishlist, AdminItem, AdminClaim, AdminActivityLog } from "@/types/admin";
import { Category } from "@/types";

// ==================== ACTIVITY LOGS ====================

export const getAdminActivityLog = async () => {
    try {
        const { data: logs, error: logsError } = await supabase
            .from("admin_activity_log")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(100);

        if (logsError) throw logsError;

        const adminIds = [...new Set(logs.map(l => l.admin_id))];
        const { data: profiles } = await supabase
            .from("profiles")
            .select("id, full_name")
            .in("id", adminIds);

        const profileMap = Object.fromEntries(profiles?.map(p => [p.id, p]) || []);

        return logs.map(log => ({
            ...log,
            admin: profileMap[log.admin_id]
        })) as AdminActivityLog[];
    } catch (error) {
        console.error("Error in getAdminActivityLog:", error);
        throw error;
    }
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
    try {
        // Fetch data in parallel for efficiency
        const [profilesRes, categoriesRes, itemsRes] = await Promise.all([
            supabase.from("profiles").select("*").order("full_name", { ascending: true }),
            supabase.from("categories").select("user_id"),
            supabase.from("items").select("user_id")
        ]);

        if (profilesRes.error) throw profilesRes.error;

        const profiles = profilesRes.data || [];
        const allCategories = categoriesRes.data || [];
        const allItems = itemsRes.data || [];

        // Map counts in-memory
        return profiles.map(p => {
            const userWishlists = allCategories.filter(c => c.user_id === p.id);
            const userItems = allItems.filter(i => i.user_id === p.id);

            return {
                ...p,
                stats: {
                    wishlists_count: userWishlists.length,
                    items_count: userItems.length,
                    friends_count: 0
                }
            };
        }) as AdminUser[];
    } catch (error) {
        console.error("Error in getAdminUsers:", error);
        throw error;
    }
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
    try {
        const [categoriesRes, profilesRes, itemsRes] = await Promise.all([
            supabase.from("categories").select("*").order("created_at", { ascending: false }),
            supabase.from("profiles").select("id, full_name, username, avatar_url"),
            supabase.from("items").select("category_id")
        ]);

        if (categoriesRes.error) throw categoriesRes.error;

        const categories = categoriesRes.data || [];
        const profiles = profilesRes.data || [];
        const allItems = itemsRes.data || [];

        const profileMap = Object.fromEntries(profiles.map(p => [p.id, p]));

        return categories.map(cat => ({
            ...cat,
            user: profileMap[cat.user_id] || { id: cat.user_id, full_name: 'Unknown' },
            items_count: allItems.filter(i => i.category_id === cat.id).length
        })) as AdminWishlist[];
    } catch (error) {
        console.error("Error in getAdminWishlists:", error);
        throw error;
    }
};

export const deleteAdminWishlist = async (id: string) => {
    try {
        console.log(`Attempting to delete wishlist: ${id}`);

        // 1. Try to uncategorize items
        // We catch errors here so we can still try to delete the category if this fails
        // (e.g. if we don't have UPDATE permissions but do have DELETE permissions)
        const { error: updateError } = await supabase
            .from("items")
            .update({ category_id: null })
            .eq("category_id", id);

        if (updateError) {
            console.warn("Warning: Failed to uncategorize items (might be lack of permissions). Proceeding with delete...", updateError);
        }

        // 2. Delete the category and check if it actually happened
        const { error, count } = await supabase
            .from("categories")
            .delete({ count: 'exact' })
            .eq("id", id);

        if (error) throw error;

        // If count is 0, it means nothing was deleted (likely RLS or ID not found)
        if (count === 0) {
            throw new Error("Deletion failed. No records were deleted (Permission denied or record missing).");
        }

        return true;
    } catch (error) {
        console.error("Error in deleteAdminWishlist:", error);
        throw error;
    }
};

// ==================== ITEMS ====================

export const getAdminItems = async () => {
    try {
        const [itemsRes, categoriesRes, profilesRes, claimsRes] = await Promise.all([
            supabase.from("items").select("*").order("created_at", { ascending: false }),
            supabase.from("categories").select("id, name"),
            supabase.from("profiles").select("id, full_name"),
            supabase.from("claims").select("item_id")
        ]);

        if (itemsRes.error) throw itemsRes.error;

        const items = itemsRes.data || [];
        const categories = categoriesRes.data || [];
        const profiles = profilesRes.data || [];
        const claims = claimsRes.data || [];

        const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));
        const profileMap = Object.fromEntries(profiles.map(p => [p.id, p.full_name]));

        return items.map(item => ({
            ...item,
            wishlist_name: categoryMap[item.category_id || ""] || 'Uncategorized',
            owner_name: profileMap[item.user_id] || 'Unknown',
            claims_count: claims.filter(c => c.item_id === item.id).length
        })) as AdminItem[];
    } catch (error) {
        console.error("Error in getAdminItems:", error);
        throw error;
    }
};

export const deleteAdminItem = async (id: string) => {
    try {
        // Delete claims associated with this item first
        await supabase
            .from("claims")
            .delete()
            .eq("item_id", id);

        // Now delete the item
        const { error } = await supabase
            .from("items")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return true;
    } catch (error) {
        console.error("Error in deleteAdminItem:", error);
        throw error;
    }
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
    try {
        const [claimsRes, itemsRes, profilesRes] = await Promise.all([
            supabase.from("claims").select("*").order("created_at", { ascending: false }),
            supabase.from("items").select("id, name, image_url, user_id"),
            supabase.from("profiles").select("id, full_name")
        ]);

        if (claimsRes.error) throw claimsRes.error;

        const claims = claimsRes.data || [];
        const items = itemsRes.data || [];
        const profiles = profilesRes.data || [];

        const itemMap = Object.fromEntries(items.map(i => [i.id, i]));
        const profileMap = Object.fromEntries(profiles.map(p => [p.id, p.full_name]));

        return claims.map(claim => {
            const item = itemMap[claim.item_id];
            return {
                ...claim,
                item_name: item?.name || 'Unknown',
                item_image: item?.image_url,
                claimer_name: profileMap[claim.user_id] || 'Unknown',
                owner_name: profileMap[item?.user_id || ""] || 'Unknown'
            };
        }) as AdminClaim[];
    } catch (error) {
        console.error("Error in getAdminClaims:", error);
        throw error;
    }
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


