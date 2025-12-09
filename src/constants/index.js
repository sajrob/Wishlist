/**
 * Application constants
 * Centralized location for all magic strings, route paths, and configuration values
 */

// ==================== SUPABASE TABLES ====================

/**
 * Database table names
 * Using constants prevents typos and makes refactoring easier
 */
export const SUPABASE_TABLES = {
    ITEMS: 'items',
    CATEGORIES: 'categories',
    WISHLISTS: 'wishlists',
    PROFILES: 'profiles',
    FRIENDS: 'friends',
};

// ==================== ROUTES ====================

/**
 * Application route paths
 */
export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    SIGNUP: '/signup',
    WISHLIST: '/wishlist',
    PROFILE: '/profile',
    FIND_USERS: '/find-users',
    FRIENDS_WISHLISTS: '/friends-wishlists',
    SHARED_WISHLIST: (userId) => `/wishlist/${userId}`,
};

// ==================== ERROR MESSAGES ====================

/**
 * Standard error messages used throughout the app
 */
export const ERROR_MESSAGES = {
    // Item errors
    ITEM_ADD_FAILED: 'Error adding item',
    ITEM_UPDATE_FAILED: 'Error updating item',
    ITEM_DELETE_FAILED: 'Error deleting item',
    ITEM_FETCH_FAILED: 'Error fetching items',

    // Category errors
    CATEGORY_CREATE_FAILED: 'Error creating category',
    CATEGORY_UPDATE_FAILED: 'Error updating category',
    CATEGORY_DELETE_FAILED: 'Error deleting category',
    CATEGORY_PRIVACY_FAILED: 'Failed to update category privacy',

    // Wishlist errors
    WISHLIST_SETTINGS_FAILED: 'Failed to update visibility settings',
    WISHLIST_LOAD_FAILED: 'Could not load wishlist. You might not be friends with this user.',

    // Profile errors
    PROFILE_FETCH_FAILED: 'Error fetching profile',

    // Friends errors
    FRIENDS_FETCH_FAILED: 'Error fetching friends wishlists',

    // Generic errors
    GENERIC_ERROR: 'An error occurred. Please try again.',
    PERMISSION_DENIED: 'You do not have permission to perform this action',
};

// ==================== SUCCESS MESSAGES ====================

/**
 * Standard success messages
 */
export const SUCCESS_MESSAGES = {
    ITEM_ADDED: 'Item added successfully',
    ITEM_UPDATED: 'Item updated successfully',
    ITEM_DELETED: 'Item deleted successfully',

    CATEGORY_CREATED: 'Category created successfully',
    CATEGORY_UPDATED: 'Category updated successfully',
    CATEGORY_DELETED: 'Category deleted successfully',
    CATEGORY_NOW_PUBLIC: 'Category is now public',
    CATEGORY_NOW_PRIVATE: 'Category is now private',

    WISHLIST_UPDATED: 'Wishlist settings updated',
};

// ==================== CONFIRM MESSAGES ====================

/**
 * Confirmation dialog messages
 */
export const CONFIRM_MESSAGES = {
    DELETE_ITEM: 'Delete this item?',
    DELETE_CATEGORY: 'Delete this category? Items will be uncategorized.',
};

// ==================== EMPTY STATE MESSAGES ====================

/**
 * Messages for empty states
 */
export const EMPTY_STATE_MESSAGES = {
    NO_ITEMS_ALL: 'No items in your wishlist. Add some items!',
    NO_ITEMS_CATEGORY: 'No items in this category.',
    NO_ITEMS_SHARED: 'No items in this wishlist.',
    WISHLIST_PRIVATE: 'This wishlist is private.',
    NO_FRIENDS_WISHLISTS: "None of your friends have made their wishlists public yet, or you haven't followed anyone.",
};

// ==================== LOADING MESSAGES ====================

/**
 * Loading state messages
 */
export const LOADING_MESSAGES = {
    LOADING: 'Loading...',
    LOADING_FRIENDS: "Loading friends' wishlists...",
    LOADING_WISHLIST: 'Loading wishlist...',
    LOADING_PROFILE: 'Loading profile...',
};

// ==================== UI TEXT ====================

/**
 * Standard UI text elements
 */
export const UI_TEXT = {
    // Buttons
    ADD_ITEM: 'Add New Wishlist Item',
    CREATE_CATEGORY: 'Create Wishlist Category',
    FIND_FRIENDS: 'Find Friends',
    VIEW_WISHLIST: 'View Wishlist',

    // Tabs
    ALL_ITEMS: 'All Items',

    // Tooltips
    MAKE_PUBLIC: 'Make Public',
    MAKE_PRIVATE: 'Make Private',
    EDIT_CATEGORY: 'Edit category',
    DELETE_CATEGORY: 'Delete category',
    PUBLIC_CATEGORY: 'Public Category',
    PRIVATE_CATEGORY: 'Private Category',
};

// ==================== DEFAULTS ====================

/**
 * Default values
 */
export const DEFAULTS = {
    DEFAULT_NAME: 'User',
    DEFAULT_FRIEND_NAME: 'Friend',
    DEFAULT_INITIALS: 'U',
    DEFAULT_PRICE: 0,
};

// ==================== SUPABASE ERROR CODES ====================

/**
 * Common Supabase error codes
 */
export const SUPABASE_ERROR_CODES = {
    NOT_FOUND: 'PGRST116', // No rows returned
    DUPLICATE_KEY: '23505', // Unique violation
    FOREIGN_KEY_VIOLATION: '23503', // Foreign key constraint violation
};
