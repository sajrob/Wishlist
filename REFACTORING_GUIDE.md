# Wishlist App Refactoring Guide
## Preparing for TypeScript Conversion

This guide breaks down the refactoring process into clear, sequential steps. Each step builds on the previous one and prepares the codebase for an easy TypeScript conversion.

---

## 📋 Overview

**Goal:** Refactor the codebase to be cleaner, more maintainable, and ready for TypeScript conversion.

**Total Time Estimate:** 4-6 hours

**Approach:** Bottom-up refactoring (utilities → hooks → components)

---

## ✅ Step 1: Create Utility Functions
**Time:** 30 minutes  
**Files Created:** `src/utils/nameUtils.js`

### What This Does:
Extracts duplicated helper functions used across multiple components (possessive names, initials).

### Current Problem:
The same logic for generating possessive names appears in:
- `Home.jsx` (line 373)
- `FriendsWishlists.jsx` (line 111-114)
- `SharedWishlist.jsx` (line 110-112)

### Prompt:
```
Step 1: Create src/utils/nameUtils.js with helper functions for:
- getPossessiveName(name) - converts "Chris" to "Chris'" or "Bob" to "Bob's"
- getInitials(name) - gets initials from a full name
- getFirstName(profile) - safely extracts first name from profile object
```

### Success Criteria:
- ✅ New file created: `src/utils/nameUtils.js`
- ✅ Functions are pure (no side effects)
- ✅ All edge cases handled (null, undefined, empty strings)

### Connects To:
**Step 2** will use these utilities in the custom hooks we create.

---

## ✅ Step 2: Create Supabase Helper Functions
**Time:** 30 minutes  
**Files Created:** `src/utils/supabaseHelpers.js`

### What This Does:
Centralizes common Supabase query patterns to reduce duplication and prepare for type safety.

### Current Problem:
Similar query patterns repeated across pages:
- Fetching items with filters
- Fetching categories with user_id condition
- Error handling is inconsistent

### Prompt:
```
Step 2: Create src/utils/supabaseHelpers.js with reusable Supabase query functions:
- fetchUserItems(userId) - gets all items for a user
- fetchUserCategories(userId) - gets all categories for a user
- fetchProfile(userId) - gets a user profile
- updateItemCategory(itemId, categoryId) - updates item's category
Include consistent error handling for all functions.
```

### Success Criteria:
- ✅ New file created: `src/utils/supabaseHelpers.js`
- ✅ Consistent error handling pattern
- ✅ All functions return { data, error } structure

### Connects To:
**Step 3** will use these helpers in custom hooks, making the hooks cleaner and more focused.

---

## ✅ Step 3: Create useWishlistData Hook
**Time:** 45 minutes  
**Files Created:** `src/hooks/useWishlistData.js`

### What This Does:
Extracts all wishlist data fetching logic into a reusable hook that manages items, categories, and loading states.

### Current Problem:
`Home.jsx`, `SharedWishlist.jsx`, and `FriendsWishlists.jsx` all have similar data fetching logic (lines 28-53 in Home.jsx).

### Prompt:
```
Step 3: Create src/hooks/useWishlistData.js that:
- Takes userId as a parameter
- Fetches items and categories using the helpers from Step 2
- Manages loading state
- Returns { allItems, categories, loading, error, refetch }
Use the supabaseHelpers from Step 2.
```

### Success Criteria:
- ✅ New file created: `src/hooks/useWishlistData.js`
- ✅ Hook uses utilities from Step 2
- ✅ Manages all loading/error states
- ✅ Exposes refetch function for manual refresh

### Connects To:
**Step 4** will create additional hooks that complement this one, and **Step 5** will refactor pages to use all these hooks together.

---

## ✅ Step 4: Create Supporting Hooks
**Time:** 45 minutes  
**Files Created:** `src/hooks/useCategories.js`, `src/hooks/useWishlistSettings.js`

### What This Does:
Creates specialized hooks for category management and wishlist settings (public/private toggle).

### Current Problem:
Category CRUD operations and wishlist settings are mixed into component logic, making components large and hard to test.

### Prompt:
```
Step 4: Create two hooks:

1. src/hooks/useCategories.js that provides:
   - createCategory(categoryData)
   - updateCategory(categoryId, categoryData)
   - deleteCategory(categoryId)
   - toggleCategoryPrivacy(categoryId, currentIsPublic)

2. src/hooks/useWishlistSettings.js that provides:
   - isPublic state
   - togglePublic function
   - loading state
   
Use supabaseHelpers from Step 2 where applicable.
```

### Success Criteria:
- ✅ Both hook files created
- ✅ Hooks encapsulate all business logic
- ✅ Clear, focused API for each hook
- ✅ Use supabaseHelpers from Step 2

### Connects To:
**Step 5** will integrate all hooks (Steps 3 & 4) into the page components, dramatically simplifying them.

---

## ✅ Step 5: Refactor Home.jsx to Use Hooks
**Time:** 60 minutes  
**Files Modified:** `src/pages/Home.jsx`

### What This Does:
Replaces direct data fetching and state management with the custom hooks created in Steps 3-4.

### Current Problem:
`Home.jsx` is 508 lines with mixed concerns: data fetching, state management, UI rendering, and business logic.

### Prompt:
```
Step 5: Refactor src/pages/Home.jsx to use our new hooks:
- Replace fetchData with useWishlistData hook from Step 3
- Replace category operations with useCategories hook from Step 4
- Replace wishlist settings with useWishlistSettings hook from Step 4
- Use nameUtils from Step 1 for the title (line 369-375)
Keep all UI/JSX the same, only replace the logic layer.
```

### Success Criteria:
- ✅ `Home.jsx` reduced from ~508 to ~300 lines
- ✅ All hooks properly imported and used
- ✅ No broken functionality
- ✅ Component focuses on UI composition

### Connects To:
**Step 6** will apply the same patterns to other page components, creating consistency across the app.

---

## ✅ Step 6: Refactor SharedWishlist.jsx to Use Hooks
**Time:** 30 minutes  
**Files Modified:** `src/pages/SharedWishlist.jsx`

### What This Does:
Applies the same hook pattern to the shared wishlist view.

### Current Problem:
`SharedWishlist.jsx` has duplicate data fetching logic similar to `Home.jsx`.

### Prompt:
```
Step 6: Refactor src/pages/SharedWishlist.jsx to use:
- useWishlistData hook for fetching items/categories
- useWishlistSettings hook for public/private status
- nameUtils for the possessive name logic (line 110-112)
- supabaseHelpers for profile fetching
Keep the read-only viewing experience intact.
```

### Success Criteria:
- ✅ `SharedWishlist.jsx` uses shared hooks
- ✅ Reduced code duplication
- ✅ Uses nameUtils from Step 1
- ✅ Read-only functionality preserved

### Connects To:
**Step 7** will complete the page refactoring by updating the friends wishlists page.

---

## ✅ Step 7: Refactor FriendsWishlists.jsx to Use Hooks
**Time:** 30 minutes  
**Files Modified:** `src/pages/FriendsWishlists.jsx`

### What This Does:
Applies utility functions to the friends wishlists page for consistency.

### Current Problem:
Has duplicate helper functions that should use the shared utilities.

### Prompt:
```
Step 7: Refactor src/pages/FriendsWishlists.jsx to:
- Use nameUtils.getInitials() instead of local version (line 105-109)
- Use nameUtils.getPossessiveName() instead of local version (line 111-114)
- Consider creating a useFriendsWishlists hook if the fetch logic is complex
Keep the grid display and stats calculation the same.
```

### Success Criteria:
- ✅ Uses shared utilities from Step 1
- ✅ No duplicate helper functions
- ✅ More consistent with other pages
- ✅ Same UI/UX output

### Connects To:
**Step 8** will create JSDoc type definitions based on the patterns we've established.

---

## ✅ Step 8: Add JSDoc Type Definitions
**Time:** 45 minutes  
**Files Created:** `src/types/index.js`  
**Files Modified:** All hooks and utilities

### What This Does:
Documents data structures with JSDoc comments for better IDE support and easy TypeScript conversion.

### Current Problem:
No documentation of data shapes makes it hard to know what properties objects have.

### Prompt:
```
Step 8: Create src/types/index.js with JSDoc typedefs for:
- WishlistItem (id, user_id, category_id, name, price, description, image_url, buy_link, created_at)
- Category (id, user_id, name, is_public, created_at)
- Profile (id, full_name, first_name, last_name, email)
- WishlistSettings (id, is_public)

Then add JSDoc comments to all hooks and utilities documenting:
- Parameter types
- Return types
- Example usage
```

### Success Criteria:
- ✅ `src/types/index.js` created with all type definitions
- ✅ All hooks have JSDoc comments with @param and @returns
- ✅ VSCode shows autocomplete based on JSDoc types
- ✅ Type definitions match Supabase schema

### Connects To:
**Step 9** will extract reusable UI components from the pages.

---

## ✅ Step 9: Extract Shared Components
**Time:** 45 minutes  
**Files Created:** `src/components/CategoryNav.jsx`, `src/components/LoadingSpinner.jsx`, `src/components/EmptyState.jsx`

### What This Does:
Extracts repetitive UI patterns into reusable components.

### Current Problem:
Category navigation, loading states, and empty states are duplicated across pages.

### Prompt:
```
Step 9: Create reusable components:

1. src/components/CategoryNav.jsx - the category tabs navigation
   Used in: Home.jsx and SharedWishlist.jsx

2. src/components/LoadingSpinner.jsx - consistent loading UI
   Used in: All pages

3. src/components/EmptyState.jsx - empty state message component
   Used in: Home.jsx, SharedWishlist.jsx, FriendsWishlists.jsx

Each component should accept appropriate props and use JSDoc type definitions.
```

### Success Criteria:
- ✅ Three new component files created
- ✅ Components are reusable and prop-driven
- ✅ Have JSDoc prop type definitions
- ✅ Used consistently across pages

### Connects To:
**Step 10** will update pages to use these new shared components.

---

## ✅ Step 10: Update Pages to Use Shared Components
**Time:** 30 minutes  
**Files Modified:** `src/pages/Home.jsx`, `src/pages/SharedWishlist.jsx`, `src/pages/FriendsWishlists.jsx`

### What This Does:
Replaces inline JSX with the shared components from Step 9.

### Current Problem:
Duplicated JSX makes changes harder and creates inconsistency risks.

### Prompt:
```
Step 10: Update all page files to use shared components from Step 9:
- Replace category navigation JSX with <CategoryNav />
- Replace loading divs with <LoadingSpinner />
- Replace empty state divs with <EmptyState />
Ensure all props are passed correctly and styling remains consistent.
```

### Success Criteria:
- ✅ All pages use shared components
- ✅ No visual changes to the UI
- ✅ Reduced code in page files
- ✅ More consistent behavior across pages

### Connects To:
**Step 11** will add constants to eliminate magic strings.

---

## ✅ Step 11: Create Constants File
**Time:** 20 minutes  
**Files Created:** `src/constants/index.js`

### What This Does:
Centralizes magic strings and configuration values.

### Current Problem:
Table names, error messages, and other strings are hardcoded throughout the app.

### Prompt:
```
Step 11: Create src/constants/index.js with:
- SUPABASE_TABLES object (items, categories, wishlists, profiles, friends)
- ERROR_MESSAGES object (common error messages)
- SUCCESS_MESSAGES object (common success messages)  
- ROUTES object (app routes)

Update supabaseHelpers and hooks to use these constants instead of string literals.
```

### Success Criteria:
- ✅ `src/constants/index.js` created
- ✅ No magic strings in hooks/utilities
- ✅ Typo-proof table names
- ✅ Easy to update messages in one place

### Connects To:
**Step 12** will validate everything works and prepare for TypeScript.

---

## ✅ Step 12: Testing & Validation
**Time:** 30 minutes  
**Files Modified:** None (testing only)

### What This Does:
Validates that all refactoring maintains functionality and prepares for TypeScript conversion.

### Current Problem:
Need to ensure nothing broke during refactoring.

### Prompt:
```
Step 12: Test the refactored application:
1. Start the dev server and verify all pages load
2. Test creating/editing/deleting items
3. Test creating/editing/deleting categories
4. Test toggling public/private settings
5. Test viewing shared wishlists
6. Test friends wishlists page
7. Verify console has no errors
Once validated, create a summary of what was refactored and what's ready for TypeScript.
```

### Success Criteria:
- ✅ All features work as before
- ✅ No console errors
- ✅ No visual regressions
- ✅ Code is cleaner and more organized
- ✅ Ready for TypeScript conversion

### Connects To:
**TypeScript conversion** can now begin with a clean, well-structured codebase!

---

## 🎯 Quick Reference: Step Dependencies

```
Step 1 (nameUtils) ──┐
                     ├──▶ Step 3 (useWishlistData) ──┐
Step 2 (supabaseHelpers) ──┤                          ├──▶ Step 5 (Home.jsx)
                           ├──▶ Step 4 (hooks) ──────┤
                           │                          ├──▶ Step 6 (SharedWishlist.jsx)
                           │                          │
                           │                          ├──▶ Step 7 (FriendsWishlists.jsx)
                           │                               │
Step 8 (JSDoc types) ──────┴────────────────────────────┤
                                                         │
Step 9 (Shared components) ─────────────────────────────┤
                                                         │
Step 10 (Update pages) ─────────────────────────────────┤
                                                         │
Step 11 (Constants) ────────────────────────────────────┤
                                                         │
Step 12 (Testing) ◀─────────────────────────────────────┘
```

---

## 🚦 How to Use This Guide

### For Each Step:

1. **Read the "What This Does"** section to understand the goal
2. **Copy the exact prompt** and give it to me
3. **Review the changes** I make
4. **Verify the "Success Criteria"** are met
5. **Move to the next step**

### If Something Goes Wrong:

Just say: **"Let's pause on Step X and review what we have"**

I'll help you debug and get back on track before proceeding.

---

## 📊 Progress Tracker

As you complete steps, mark them here:

- [ ] Step 1: Create Utility Functions
- [ ] Step 2: Create Supabase Helper Functions
- [ ] Step 3: Create useWishlistData Hook
- [ ] Step 4: Create Supporting Hooks
- [ ] Step 5: Refactor Home.jsx
- [ ] Step 6: Refactor SharedWishlist.jsx
- [ ] Step 7: Refactor FriendsWishlists.jsx
- [ ] Step 8: Add JSDoc Type Definitions
- [ ] Step 9: Extract Shared Components
- [ ] Step 10: Update Pages to Use Shared Components
- [ ] Step 11: Create Constants File
- [ ] Step 12: Testing & Validation

---

## 🎉 After Completion

Once all 12 steps are complete, your codebase will be:
- ✅ 40-50% smaller in terms of duplicate code
- ✅ Much easier to maintain
- ✅ Well-documented with JSDoc
- ✅ Ready for TypeScript conversion (2-3 hours instead of 6-8)
- ✅ More testable
- ✅ More consistent

**Next Step:** TypeScript Conversion Guide (will be created after Step 12)
