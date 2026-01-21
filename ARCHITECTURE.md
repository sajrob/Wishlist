# Wishlist Application Architecture

This document describes the architecture of the Wishlist application following a comprehensive 3-stage refactoring process focused on UI/UX excellence, data integrity, and performant state management.

## 1. Overview
Wishlist is a social platform for creating, sharing, and discovering gift ideas. It uses a modern frontend stack with a Supabase backend.

## 2. Technology Stack
- **Frontend**: React (v19) with TypeScript
- **State Management**: `@tanstack/react-query` (React Query) for server state, Context API for lightweight global state (Auth).
- **Styling**: Tailwind CSS with `tailwindcss-animate` and CSS Variables.
- **UI Components**: Shadcn UI (Radix UI primitives).
- **Backend**: Supabase (Auth, PostgreSQL, Real-time).
- **Local API**: Express-based scraper for item metadata retrieval.

## 3. Directory Structure
```text
src/
├── api/            # Centralized API modules for Supabase/External calls
├── components/     # UI Components (atomic and specialized)
│   └── ui/         # Shadcn base components
├── context/        # React Contexts (Auth, Wishlist)
├── hooks/          # Custom Hooks (React Query wrappers for data)
├── lib/            # External library configurations (QueryClient)
├── pages/          # Top-level route components
├── types/          # TypeScript definitions
└── utils/          # Pure utility functions (Formatting, Helpers)
```

## 4. Key Architectural Patterns

### 4.1 Server State Management
The application migrated from manual `useEffect` fetching to **React Query**.
- **Data Fetching**: Hooks like `useItems`, `useProfile`, and `useFriends` handle fetching and caching.
- **Mutations**: Writing data uses `useMutation` with automatic cache invalidation to ensure UI consistency.
- **Query Keys**: Centralized in `src/lib/queryClient.ts` to prevent "magic strings" and ensure predictable invalidation.

### 4.2 Modular API Layer
Direct Supabase calls are abstracted into the `src/api/` directory. Each domain (items, categories, social) has its own module. This improves testability and makes it easier to migrate backends if needed in the future.

### 4.3 Standardized Utilities
Common logic for formatting is centralized in `src/utils/`:
- `dateUtils.ts`: Uniform date formatting for notifications and activity.
- `numberUtils.ts`: Currency and number formatting (with special support for SLE/SLL).
- `nameUtils.ts`: Handling user initials, first names, and possessive titles.

### 4.4 User Feedback
- **Toasts**: `sonner` is used for all success/error notifications.
- **Modals**: Standardized Shadcn `Dialog` for destructive actions and complex forms.
- **Skeletons**: Tailored loading states in `WishlistCardSkeleton` and `FriendCardSkeleton` ensure a "jumping-free" experience.

## 5. Metadata Scraping
Metadata scraping for items is handled by a local Express server (`local-api.js`) which uses specialized logic to extract titles, prices, and images from various shopping sites (Amazon, Shein, etc.).

## 6. Real-time Features
Real-time updates for notifications and state changes are handled via Supabase Postgres Changes subscriptions, primarily integrated into the React Query cache for seamless updates.
