/**
 * Type definitions for the Wishlist application
 * These JSDoc typedefs provide type information for better IDE support
 * and will make TypeScript conversion straightforward
 */

// ==================== DATABASE MODELS ====================

/**
 * Wishlist item from the database
 * @typedef {Object} WishlistItem
 * @property {string} id - Unique identifier for the item
 * @property {string} user_id - ID of the user who owns this item
 * @property {string|null} category_id - ID of the category this item belongs to (null if uncategorized)
 * @property {string} name - Name of the item
 * @property {number} price - Price of the item in dollars
 * @property {string} description - Description of the item
 * @property {string} image_url - URL to the item's image
 * @property {string} buy_link - URL where the item can be purchased
 * @property {string} created_at - ISO timestamp of when the item was created
 */

/**
 * Category for organizing wishlist items
 * @typedef {Object} Category
 * @property {string} id - Unique identifier for the category
 * @property {string} user_id - ID of the user who owns this category
 * @property {string} name - Name of the category
 * @property {boolean} is_public - Whether this category is visible to other users
 * @property {string} created_at - ISO timestamp of when the category was created
 */

/**
 * User profile information
 * @typedef {Object} Profile
 * @property {string} id - Unique identifier for the user (matches auth user id)
 * @property {string} full_name - User's full name
 * @property {string} first_name - User's first name
 * @property {string} last_name - User's last name
 * @property {string} email - User's email address
 * @property {string} created_at - ISO timestamp of when the profile was created
 */

/**
 * Wishlist visibility settings
 * @typedef {Object} WishlistSettings
 * @property {string} id - User ID (matches user's auth id)
 * @property {boolean} is_public - Whether the wishlist is publicly visible
 */

/**
 * Friend relationship (following)
 * @typedef {Object} Friend
 * @property {string} id - Unique identifier for the relationship
 * @property {string} user_id - ID of the user doing the following
 * @property {string} friend_id - ID of the user being followed
 * @property {string} created_at - ISO timestamp of when the friendship was created
 */

/**
 * Supabase authentication user object
 * @typedef {Object} AuthUser
 * @property {string} id - Unique identifier for the user
 * @property {string} email - User's email address
 * @property {Object} user_metadata - Additional user metadata
 * @property {string} [user_metadata.first_name] - User's first name
 * @property {string} [user_metadata.last_name] - User's last name
 * @property {string} [user_metadata.full_name] - User's full name
 * @property {string} created_at - ISO timestamp of when the user was created
 */

// ==================== API RESPONSES ====================

/**
 * Standard Supabase response format
 * @template T
 * @typedef {Object} SupabaseResponse
 * @property {T|null} data - The data returned from the query (null if error)
 * @property {Error|null} error - Any error that occurred (null if successful)
 */

/**
 * Response from item queries
 * @typedef {SupabaseResponse<WishlistItem>} ItemResponse
 */

/**
 * Response from queries returning multiple items
 * @typedef {SupabaseResponse<WishlistItem[]>} ItemsResponse
 */

/**
 * Response from category queries
 * @typedef {SupabaseResponse<Category>} CategoryResponse
 */

/**
 * Response from queries returning multiple categories
 * @typedef {SupabaseResponse<Category[]>} CategoriesResponse
 */

/**
 * Response from profile queries
 * @typedef {SupabaseResponse<Profile>} ProfileResponse
 */

/**
 * Response from queries returning multiple profiles
 * @typedef {SupabaseResponse<Profile[]>} ProfilesResponse
 */

// ==================== FORM DATA ====================

/**
 * Data for creating or updating a wishlist item
 * @typedef {Object} ItemFormData
 * @property {string} name - Item name
 * @property {number|string} price - Item price (can be string from form input)
 * @property {string} description - Item description
 * @property {string} image_url - URL to item image
 * @property {string} buy_link - URL where item can be purchased
 */

/**
 * Data for creating or updating a category
 * @typedef {Object} CategoryFormData
 * @property {string} [id] - Category ID (only for updates)
 * @property {string} name - Category name
 * @property {boolean} is_public - Whether category is public
 * @property {string[]} [itemIds] - Array of item IDs to include in this category
 */

// ==================== COMPONENT PROPS ====================

/**
 * Props for the WishlistCard component
 * @typedef {Object} WishlistCardProps
 * @property {WishlistItem} item - The item to display
 * @property {Function} [onEdit] - Callback when edit button is clicked
 * @property {Function} [onDelete] - Callback when delete button is clicked
 * @property {boolean} [readOnly] - Whether the card is read-only (no edit/delete buttons)
 */

/**
 * Props for the WishlistForm component
 * @typedef {Object} WishlistFormProps
 * @property {Function} onSubmit - Callback when form is submitted
 * @property {Function} onClose - Callback when form is closed
 * @property {WishlistItem} [editingItem] - Item being edited (undefined for new item)
 */

/**
 * Props for the CreateCategoryModal component
 * @typedef {Object} CreateCategoryModalProps
 * @property {WishlistItem[]} items - All available items
 * @property {Function} onClose - Callback when modal is closed
 * @property {Function} onCreateCategory - Callback when creating a new category
 * @property {Function} onUpdateCategory - Callback when updating a category
 * @property {Category & {itemIds?: string[]}} [editingCategory] - Category being edited
 */

/**
 * Props for the Navbar component
 * @typedef {Object} NavbarProps
 * (No props currently)
 */

// ==================== HOOK RETURN TYPES ====================

/**
 * Return type for useWishlistData hook
 * @typedef {Object} UseWishlistDataReturn
 * @property {WishlistItem[]} allItems - All items for the user
 * @property {Category[]} categories - All categories for the user
 * @property {boolean} loading - Whether data is currently being fetched
 * @property {Error|null} error - Any error that occurred during fetching
 * @property {Function} refetch - Function to manually refetch data
 * @property {Function} setAllItems - Function to manually update items state
 * @property {Function} setCategories - Function to manually update categories state
 */

/**
 * Return type for useWishlistSettings hook
 * @typedef {Object} UseWishlistSettingsReturn
 * @property {boolean} isPublic - Whether the wishlist is public
 * @property {boolean} loading - Whether settings are being loaded/updated
 * @property {Error|null} error - Any error that occurred
 * @property {Function} togglePublic - Function to toggle public/private status
 * @property {Function} setIsPublic - Function to set specific public status
 * @property {Function} refetch - Function to manually refetch settings
 */

/**
 * Return type for useCategories hook
 * @typedef {Object} UseCategoriesReturn
 * @property {Function} createCategory - Function to create a new category
 * @property {Function} updateCategory - Function to update a category
 * @property {Function} deleteCategory - Function to delete a category
 * @property {Function} toggleCategoryPrivacy - Function to toggle category privacy
 */

// ==================== UTILITY TYPES ====================

/**
 * Friend wishlist summary for the friends list view
 * @typedef {Object} FriendWishlistSummary
 * @property {string} id - Friend's user ID
 * @property {string} name - Friend's full name
 * @property {string} firstName - Friend's first name
 * @property {number} publicCategories - Number of public categories
 * @property {number} totalItems - Total number of items in public categories
 */

/**
 * Category statistics
 * @typedef {Object.<string, number>} CategoryStats
 * Maps category ID to number of items in that category
 */

// Export all types for use in other files
export { };
