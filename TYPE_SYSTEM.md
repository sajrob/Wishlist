# Type Definitions Documentation

This document explains the type system used in the Wishlist application and how to use it effectively.

## Overview

The application uses **JSDoc type definitions** to provide type safety and better IDE support without requiring TypeScript. All type definitions are centralized in `src/types/index.js`.

## Why JSDoc?

- ✅ **No build step changes** - Works with existing JavaScript
- ✅ **IDE autocomplete** - VSCode and other IDEs provide IntelliSense
- ✅ **Type checking** - Can enable type checking with `// @ts-check`
- ✅ **Easy migration** - Direct path to TypeScript conversion later
- ✅ **Documentation** - Types serve as inline documentation

## Type Categories

### 1. Database Models

Core data structures that match the Supabase database schema:

- **`WishlistItem`** - Individual items in wishlists
- **`Category`** - Categories for organizing items
- **`Profile`** - User profile information
- **`WishlistSettings`** - Public/private visibility settings
- **`Friend`** - Friend relationships (following)
- **`AuthUser`** - Supabase authentication user object

### 2. API Responses

Standard response format for Supabase queries:

- **`SupabaseResponse<T>`** - Generic response wrapper
- **`ItemResponse`**, **`ItemsResponse`** - Item query responses
- **`CategoryResponse`**, **`CategoriesResponse`** - Category query responses
- **`ProfileResponse`**, **`ProfilesResponse`** - Profile query responses

### 3. Form Data

Data structures for forms and user input:

- **`ItemFormData`** - Creating/updating wishlist items
- **`CategoryFormData`** - Creating/updating categories

### 4. Component Props

Props definitions for React components:

- **`WishlistCardProps`** - WishlistCard component
- **`WishlistFormProps`** - WishlistForm component
- **`CreateCategoryModalProps`** - CreateCategoryModal component

### 5. Hook Returns

Return types for custom hooks:

- **`UseWishlistDataReturn`** - useWishlistData hook
- **`UseWishlistSettingsReturn`** - useWishlistSettings hook
- **`UseCategoriesReturn`** - useCategories hook

## Using Types in Your Code

### Basic Usage

```javascript
/**
 * Processes a wishlist item
 * @param {import('../types').WishlistItem} item - The item to process
 * @returns {string} Formatted item description
 */
function formatItem(item) {
    return `${item.name} - $${item.price}`;
}
```

### With Function Parameters

```javascript
/**
 * @param {string} userId - User ID
 * @param {import('../types').CategoryFormData} categoryData - Category data
 * @returns {Promise<import('../types').CategoryResponse>}
 */
async function createCategory(userId, categoryData) {
    // Implementation
}
```

### With State

```javascript
import { useState } from 'react';

function MyComponent() {
    /** @type {[import('../types').WishlistItem[], Function]} */
    const [items, setItems] = useState([]);
    
    /** @type {import('../types').Category | null} */
    const [activeCategory, setActiveCategory] = useState(null);
}
```

### With React Components

```javascript
/**
 * Displays a wishlist card
 * @param {import('../types').WishlistCardProps} props
 */
function WishlistCard({ item, onEdit, onDelete, readOnly }) {
    return (
        // Component JSX
    );
}
```

## Enabling Type Checking

To enable TypeScript-style type checking in JavaScript files, add this comment at the top:

```javascript
// @ts-check
```

VSCode will then show type errors inline as you code!

## Benefits We Get

### 1. Autocomplete

When you type `item.`, your IDE will suggest:
- `id`
- `user_id`
- `category_id`
- `name`
- `price`
- `description`
- `image_url`
- `buy_link`
- `created_at`

### 2. Error Detection

Your IDE will warn you if you:
- Misspell property names
- Pass wrong types to functions
- Forget required properties
- Use null when not allowed

### 3. Documentation

Hover over any typed variable or function to see its full documentation.

### 4. Refactoring Safety

When renaming or changing types, your IDE can update all references automatically.

## Converting to TypeScript

When ready to convert to TypeScript:

1. Rename `src/types/index.js` → `src/types/index.ts`
2. Replace `@typedef` with `interface` or `type`
3. Remove JSDoc comments from functions
4. Add type annotations directly

Example conversion:

**Before (JSDoc):**
```javascript
/**
 * @typedef {Object} WishlistItem
 * @property {string} id
 * @property {string} name
 * @property {number} price
 */

/** @type {WishlistItem[]} */
const items = [];
```

**After (TypeScript):**
```typescript
interface WishlistItem {
    id: string;
    name: string;
    price: number;
}

const items: WishlistItem[] = [];
```

## Where Types Are Used

### Already Typed

✅ `src/utils/nameUtils.js` - Full JSDoc coverage  
✅ `src/utils/supabaseHelpers.js` - Full JSDoc coverage  
✅ `src/hooks/useWishlistData.js` - Full JSDoc coverage  
✅ `src/hooks/useCategories.js` - Full JSDoc coverage  
✅ `src/hooks/useWishlistSettings.js` - Full JSDoc coverage  

### Components

All components can be typed by adding JSDoc to their props:

```javascript
/**
 * @param {import('../types').WishlistCardProps} props
 */
export default function WishlistCard(props) {
    // ...
}
```

## Best Practices

1. **Import types**, don't duplicate them
2. **Document functions** with @param and @returns
3. **Use specific types**, not `any` or `Object`
4. **Keep types updated** when changing data structures
5. **Add types incrementally** - start with most-used code

## Reference

For complete type definitions, see: `src/types/index.js`

For examples of proper usage, see:
- `src/utils/nameUtils.js`
- `src/hooks/useWishlistData.js`
- `src/utils/supabaseHelpers.js`
