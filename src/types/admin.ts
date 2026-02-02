import { Profile, WishlistItem, Category, Claim } from "./index";

export interface Feedback {
    id: string;
    user_id: string | null;
    username: string;
    type: 'Bug' | 'Feature Request' | 'UX Issue';
    message: string;
    page_url: string;
    status: 'New' | 'In Progress' | 'Resolved' | 'Archived';
    created_at: string;
    internal_notes?: string;
    priority?: 'Low' | 'Medium' | 'High';
}

export interface AdminUser extends Profile {
    email: string; // Ensure email is present for admin
    is_admin: boolean;
    stats?: {
        wishlists_count: number;
        items_count: number;
        friends_count: number;
    };
}

export interface AdminWishlist extends Category {
    user?: Profile;
    items_count: number;
}

export interface AdminItem extends WishlistItem {
    wishlist_name: string;
    owner_name: string;
    claims_count: number;
}

export interface AdminClaim extends Claim {
    item_name: string;
    item_image?: string;
    claimer_name: string;
    owner_name: string;
}

export interface AdminActivityLog {
    id: string;
    admin_id: string;
    action_type: string;
    entity_type: string;
    entity_id?: string;
    details?: any;
    created_at: string;
    admin?: {
        full_name: string;
    };
}

