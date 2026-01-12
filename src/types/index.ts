/**
 * Type definitions for the Wishlist application
 * Converted from JSDoc to TypeScript for stronger type safety.
 */

import type { Dispatch, SetStateAction } from 'react';

// ==================== DATABASE MODELS ====================

export interface Claim {
    id: string;
    item_id: string;
    user_id: string;
    created_at: string;
    profiles?: Profile; // Joined data
}

export interface WishlistItem {
    id: string;
    user_id: string;
    category_id: string | null;
    name: string;
    price: number;
    description: string;
    image_url: string;
    buy_link: string;
    currency?: string;
    is_must_have: boolean;
    created_at: string;
    claims?: Claim[];
}

export interface Category {
    id: string;
    user_id: string;
    name: string;
    is_public: boolean;
    created_at: string;
}

export interface Profile {
    id: string;
    full_name: string;
    first_name: string;
    last_name: string;
    email: string;
    created_at: string;
    user_metadata?: {
        first_name?: string;
        last_name?: string;
        full_name?: string;
    };
}

export interface WishlistSettings {
    id: string;
    is_public: boolean;
}

export interface Friend {
    id: string;
    user_id: string;
    friend_id: string;
    created_at: string;
}

export interface Notification {
    id: string;
    user_id: string;
    actor_id: string; // The person who triggered the notification
    type: 'follow' | string;
    message: string;
    is_read: boolean;
    created_at: string;
}

export interface AuthUser {
    id: string;
    email: string;
    user_metadata: {
        first_name?: string;
        last_name?: string;
        full_name?: string;
        [key: string]: unknown;
    };
    created_at: string;
}

// ==================== API RESPONSES ====================

export type SupabaseResponse<T> = {
    data: T | null;
    error: Error | null;
};

export type ItemResponse = SupabaseResponse<WishlistItem>;
export type ItemsResponse = SupabaseResponse<WishlistItem[]>;
export type CategoryResponse = SupabaseResponse<Category>;
export type CategoriesResponse = SupabaseResponse<Category[]>;
export type ProfileResponse = SupabaseResponse<Profile>;
export type ProfilesResponse = SupabaseResponse<Profile[]>;

// ==================== FORM DATA ====================

export interface ItemFormData {
    name: string;
    price: number | string;
    description: string;
    image_url: string;
    buy_link: string;
    currency?: string;
    is_must_have?: boolean;
}

export interface CategoryFormData {
    id?: string;
    name: string;
    is_public: boolean;
    itemIds?: string[];
}

// ==================== COMPONENT PROPS ====================

export interface WishlistCardProps {
    item: WishlistItem;
    onEdit?: (item: WishlistItem) => void;
    onDelete?: (itemId: string) => void;
    onToggleMustHave?: (itemId: string, isMustHave: boolean) => void;
    readOnly?: boolean;
}

export interface WishlistFormProps {
    onSubmit: (formData: ItemFormData) => Promise<void> | void;
    onClose: () => void;
    editingItem?: WishlistItem;
}

export interface CreateCategoryModalProps {
    items: WishlistItem[];
    onClose: () => void;
    onCreateCategory: (form: CategoryFormData) => Promise<void> | void;
    onUpdateCategory: (form: CategoryFormData) => Promise<void> | void;
    editingCategory?: (Category & { itemIds?: string[] });
}

// ==================== HOOK RETURN TYPES ====================

export interface UseWishlistDataReturn {
    allItems: WishlistItem[];
    categories: Category[];
    loading: boolean;
    error: Error | null;
    refetch: () => Promise<void>;
    setAllItems: Dispatch<SetStateAction<WishlistItem[]>>;
    setCategories: Dispatch<SetStateAction<Category[]>>;
}

export interface UseWishlistSettingsReturn {
    isPublic: boolean;
    loading: boolean;
    error: Error | null;
    togglePublic: () => Promise<boolean>;
    setIsPublic: (isPublic: boolean) => Promise<boolean>;
    refetch: () => Promise<void>;
}

export interface UseCategoriesReturn {
    createCategory: (
        data: CategoryFormData,
    ) => Promise<SupabaseResponse<Category | null>>;
    updateCategory: (
        categoryId: string,
        updates: CategoryFormData,
    ) => Promise<SupabaseResponse<boolean>>;
    deleteCategory: (categoryId: string) => Promise<SupabaseResponse<boolean>>;
    toggleCategoryPrivacy: (
        categoryId: string,
        isPublic: boolean,
    ) => Promise<SupabaseResponse<{ is_public: boolean }>>;
}

// ==================== UTILITY TYPES ====================

export interface FriendWishlistSummary {
    id: string;
    name: string;
    firstName: string;
    publicCategories?: number;
    totalItems?: number;
}

export type CategoryStats = Record<string, number>;


