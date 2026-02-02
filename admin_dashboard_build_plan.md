# Wishlist Admin Dashboard - Staged Build Plan

## Overview
This builds a complete admin dashboard for the Wishlist app in logical stages, minimizing token usage while maintaining continuity. Each stage references previous work and sets up the next phase.

**Project Context**: Wishlist is a beta app with user profiles, wishlists, items, claims, categories, friend connections, and an existing feedback/bug report system.

---

## STAGE 1: Codebase Analysis & Planning
**Token Efficiency**: Uses targeted file viewing instead of full codebase dump

### Prompt for Stage 1:
```
Analyze the Wishlist project codebase to plan an admin dashboard.

PROJECT CONTEXT:
- Location: c:\Users\Solomon\Documents\app\Wishlist
- Tech Stack: React + TypeScript, Tailwind CSS, shadcn/ui, Supabase, React Query
- Existing Features: Users, wishlists, items, claims, categories, friends, feedback system
- Priority: Feedback/bug management (existing table), user management, content moderation

TASK:
1. Examine the project structure:
   - Root directory
   - src/ folder structure
   - Supabase schema (if available)
   - Existing components and pages
2. Identify key manageable entities:
   - feedback (PRIORITY - already has table)
   - users (profiles, stats, friends)
   - wishlists
   - items
   - claims
   - categories
   - notifications (optional)
3. List existing reusable components (shadcn/ui components, layouts)
4. Create a dashboard structure plan

OUTPUT FORMAT:
Create a file: `admin_dashboard_plan.json` with this structure:
{
  "entities": [
    {
      "name": "feedback",
      "priority": 1,
      "operations": ["read", "update", "delete"],
      "fields": [],
      "notes": "Existing beta feedback system - triage interface needed"
    },
    // ... other entities
  ],
  "pages": [
    {"name": "Dashboard Home", "route": "/admin", "manages": [], "features": []},
    {"name": "Feedback Management", "route": "/admin/feedback", "manages": ["feedback"], "features": []}
    // ... other pages
  ],
  "relationships": [
    {"from": "items", "to": "wishlists", "type": "many-to-one"},
    // ... other relationships
  ],
  "tech_stack": {
    "frontend": "React + TypeScript",
    "ui": "shadcn/ui + Tailwind CSS",
    "backend": "Supabase",
    "state": "React Query",
    "routing": ""
  },
  "reusable_components": [],
  "admin_access": {
    "method": "is_admin boolean on users table",
    "route_protection": "Protected route wrapper needed"
  }
}

Only view files as needed. Keep the plan concise.
```

**Expected Output**: A JSON plan file that serves as the blueprint for the Wishlist admin dashboard

---

## STAGE 2: Foundation & Navigation
**Token Efficiency**: References plan file, builds only shell structure

### Prompt for Stage 2:
```
Build the admin dashboard foundation using admin_dashboard_plan.json.

CONTEXT: Reference admin_dashboard_plan.json created in Stage 1

TASK:
1. Create dashboard layout shell:
   - Main admin layout component with sidebar
   - Navigation menu (from pages in plan)
   - Header with admin user info/logout
   - Responsive design (mobile drawer, desktop sidebar)
2. Set up routing for all planned pages (under /admin route)
3. Create placeholder page components
4. Add authentication guard (check is_admin from Supabase auth)

TECHNICAL REQUIREMENTS:
- Use shadcn/ui components (consistent with main app)
- Include dark mode support (leverage existing theme system)
- Mobile-responsive sidebar/drawer
- Match Wishlist app's premium UI aesthetic
- Use existing color scheme (primary: #4338ca)

DESIGN NOTES:
- Keep consistent with existing app navigation patterns
- Reuse existing shadcn/ui components where possible
-ABSOLUTELY NO GLASSMORPHISM or Liquidglass design!

OUTPUT:
- Admin layout file (src/pages/admin/AdminLayout.tsx or similar)
- Navigation component
- Route configuration
- Placeholder pages (empty shells referencing their entity from plan)
- Protected route wrapper component

Save summary to: `stage2_complete.md` listing all files created
```

**Expected Output**: Working admin navigation shell + file manifest

---

## STAGE 2.5: Admin Access Control
**Token Efficiency**: Quick checkpoint before building data layer

### Prompt for Stage 2.5:
```
Implement admin access control system.

CONTEXT:
- admin_dashboard_plan.json
- stage2_complete.md (admin routes created)

TASK:
1. Database changes:
   - Add is_admin boolean column to users/profiles table (default: false)
   - Create migration file if using Supabase migrations
2. Protected route wrapper:
   - Check user.is_admin from Supabase auth
   - Redirect non-admins to dashboard
   - Show loading state during check
3. Admin menu visibility:
   - Add "Admin Panel" link to main app sidebar (only visible to admins)
   - Use existing sidebar component pattern
4. Test access control:
   - Verify admin can access /admin routes
   - Verify non-admin gets redirected

OUTPUT:
- Database migration/schema update
- Protected route component
- Updated main navigation with admin link
- Update stage2_5_complete.md

VERIFICATION:
Manually set is_admin=true for your user in Supabase and test access
```

---

## STAGE 3: Data Layer & API Integration
**Token Efficiency**: Only implements API connections for entities in plan

### Prompt for Stage 3:
```
Implement data layer for admin dashboard.

CONTEXT:
- admin_dashboard_plan.json (entities and operations)
- stage2_5_complete.md (files already created)
- Existing pattern: React Query hooks in src/hooks/ or similar

TASK:
1. Create API service layer following existing patterns:
   - Feedback service (GET all feedback, UPDATE status, DELETE)
   - Users service (GET all users, GET user stats, UPDATE user, DELETE user)
   - Wishlists service (GET all wishlists, GET by user, DELETE)
   - Items service (GET all items, DELETE)
   - Claims service (GET all claims, DELETE)
   - Categories service (GET all, CREATE, UPDATE, DELETE)

2. Create React Query hooks for each entity:
   - useFeedback, useFeedbackMutations
   - useAdminUsers, useAdminUserMutations
   - useAdminWishlists, useAdminWishlistMutations
   - etc.
   - Follow existing React Query patterns in the app

3. Add TypeScript interfaces:
   - Extend existing types where possible
   - Add admin-specific types (FeedbackWithUser, UserWithStats, etc.)

REUSE:
- Existing Supabase client setup
- Existing React Query configuration
- Existing type definitions

OUTPUT:
- API service files (src/api/admin/ or similar)
- Custom hooks (src/hooks/admin/ or similar)
- Type definitions (src/types/admin.ts or extend existing)
- Update stage3_complete.md with new files
```

**Expected Output**: Complete data layer + updated manifest

---

## STAGE 4a: Entity Management - Priority Batch
**Token Efficiency**: Builds most urgent entities first (feedback + users)

### Prompt for Stage 4a:
```
Build management pages for FEEDBACK and USERS (priority entities).

CONTEXT:
- admin_dashboard_plan.json (entity definitions)
- stage3_complete.md (available API services and hooks)

TASK:

### 1. FEEDBACK MANAGEMENT (Priority)
Build a triage interface for the existing beta feedback system:

**List View:**
- Table with columns: Type, Status, User, Message (truncated), Created Date
- Filters: Type (bug/feature/general), Status (new/in-progress/resolved/archived)
- Sort by: Date, Type, Status
- Search: Message content
- Pagination
- Row click → opens detail modal

**Detail Modal:**
- Full message
- User info (name, email, link to user profile)
- Status dropdown (new/in-progress/resolved/archived)
- Priority selector (low/medium/high) - add to table if doesn't exist
- Internal notes textarea (admin-only, add to table if doesn't exist)
- Timestamps (created, updated)
- Delete button (with confirmation)

**Actions:**
- Bulk status update
- Bulk archive
- Export to CSV

### 2. USER MANAGEMENT
**List View:**
- Table: Username, Email, Friends Count, Wishlists Count, Items Count, Last Active, Admin Status
- Search: Username, email
- Filter: Is Admin, Has Wishlists
- Sort: Join date, last active, friends count
- Pagination

**Detail Page:**
- User profile info
- Quick stats (existing stats from main app)
- Wishlists list (quick view)
- Activity summary
- Admin actions:
  - Toggle admin status
  - View as user (link to their profile page)
  - Delete user (with cascade warning and confirmation)

DESIGN:
- Use shadcn/ui Table, Dialog, Select, Badge components
- Match existing app aesthetic
- Responsive tables (mobile cards on small screens)

OUTPUT:
- src/pages/admin/Feedback.tsx (or similar)
- src/pages/admin/Users.tsx
- src/pages/admin/UserDetail.tsx
- Shared components:
  - src/components/admin/AdminTable.tsx (reusable table wrapper)
  - src/components/admin/ConfirmDialog.tsx
  - src/components/admin/StatusBadge.tsx
- Update stage4a_complete.md

PRIORITY: Feedback management is most urgent for beta launch
```

**Expected Output**: Working feedback triage + user management

---

## STAGE 4b: Entity Management - Content Moderation
**Token Efficiency**: Builds content entities, reuses components from 4a

### Prompt for Stage 4b:
```
Build management pages for WISHLISTS, ITEMS, and CLAIMS.

CONTEXT:
- admin_dashboard_plan.json
- stage4a_complete.md (completed entities and reusable components like AdminTable)

TASK:

### 1. WISHLISTS MANAGEMENT
**List View:**
- Table: Title, Owner (link), Category, Items Count, Privacy, Created Date
- Search: Title, owner username
- Filter: Category, Privacy (public/private)
- Sort: Date, items count
- Actions: View, Delete (with cascade warning)

**Detail Modal:**
- Wishlist info
- Items list (quick preview)
- Link to view as user would see it
- Delete button

### 2. ITEMS MANAGEMENT
**List View:**
- Table: Name, Wishlist (link), Price, Currency, Claims Count, Added Date
- Search: Name, URL
- Filter: Has claims, Price range, Currency
- Sort: Date, price, claims
- Actions: View, Delete

**Detail Modal:**
- Item details (name, URL, image, price, notes)
- Parent wishlist link
- Claims list (who claimed it, when)
- Delete button

### 3. CLAIMS MANAGEMENT
**List View:**
- Table: Item (link), Claimer (link), Wishlist Owner (link), Claimed Date
- Search: Item name, claimer username
- Filter: Date range
- Sort: Date
- Actions: View, Remove claim

**Detail View:**
- Claim info
- Item details
- Claimer info
- Remove claim button (with confirmation)

REUSE:
- AdminTable component from stage4a
- ConfirmDialog component from stage4a
- Existing API hooks from stage3

OUTPUT:
- src/pages/admin/Wishlists.tsx
- src/pages/admin/Items.tsx
- src/pages/admin/Claims.tsx
- Update stage4b_complete.md
```

**Expected Output**: Content moderation interfaces

---

## STAGE 4c: Entity Management - Categories (Optional)
**Token Efficiency**: Simple CRUD, last priority

### Prompt for Stage 4c:
```
Build management page for CATEGORIES (optional, simple CRUD).

CONTEXT:
- admin_dashboard_plan.json
- stage4a_complete.md and stage4b_complete.md

TASK:

### CATEGORIES MANAGEMENT
**List View:**
- Table: Icon, Name, Usage Count (# wishlists using it), Created Date
- Inline editing (click to edit name/icon)
- Add new category button
- Delete (with usage warning if count > 0)

**Features:**
- Create new category
- Edit existing (name, icon)
- Delete (prevent if in use, or cascade warning)
- Reorder (drag and drop - optional enhancement)

KEEP IT SIMPLE: This is lower priority than feedback/users/content

OUTPUT:
- src/pages/admin/Categories.tsx
- Update stage4c_complete.md
```

---

## STAGE 5: Dashboard Home & Analytics
**Token Efficiency**: Builds only relevant metrics from existing entities

### Prompt for Stage 5:
```
Create admin dashboard home page with analytics.

CONTEXT:
- admin_dashboard_plan.json (all entities)
- stage4[x]_complete.md files (completed entity pages and available hooks)

TASK:

### Dashboard Home Page (/admin)

**Key Metrics Cards (Top Row):**
- Total Users (with growth % and trend icon)
- Total Wishlists
- Total Items
- Pending Feedback (new/in-progress count - highlighted if >0)

**Recent Activity Feed (Left Column):**
- Latest 10 activities across platform:
  - New user signups
  - Wishlists created
  - Items claimed
  - Feedback submitted
- Each with timestamp, user, action type
- Real-time or auto-refresh every 30s

**Quick Actions (Right Sidebar):**
- "View Pending Feedback" button (→ /admin/feedback?status=new)
- "Recent Users" button (→ /admin/users?sort=newest)
- "Export Data" menu (CSV exports)

**Charts (Bottom Section):**
- User signups over time (last 30 days - line chart)
- Top 5 categories by usage (bar chart)
- Feedback types breakdown (pie/donut chart)

**Technical:**
- Use existing React Query hooks from Stage 3
- Use shadcn/ui Card components
- Add chart library if needed (recharts, tremor, or similar lightweight option)
- Auto-refresh data every 60s (useQuery refetchInterval)

OUTPUT:
- src/pages/admin/Dashboard.tsx (home page)
- src/components/admin/MetricCard.tsx
- src/components/admin/ActivityFeed.tsx
- src/components/admin/QuickActions.tsx
- Chart components (if needed)
- Update stage5_complete.md
```

**Expected Output**: Analytics dashboard home

---

## STAGE 6: Advanced Features
**Token Efficiency**: Only implements features relevant to Wishlist app needs

### Prompt for Stage 6:
```
Add advanced dashboard features.

CONTEXT: All previous stage completion files

IMPLEMENT THESE PRIORITY FEATURES:

### 1. Global Search (Priority)
**Purpose:** Quickly find users when investigating bug reports

**Implementation:**
- Search bar in admin header (always accessible)
- Search across: Users (username, email), Wishlists (title), Feedback (message)
- Dropdown results (grouped by entity type)
- Click result → navigate to detail page
- Keyboard shortcut: Cmd/Ctrl + K

**Technical:**
- Use Supabase full-text search or simple ILIKE
- Debounced input (300ms)
- shadcn/ui Command component (search + shortcuts)

### 2. Activity Log
**Purpose:** Track admin actions for accountability

**Implementation:**
- New table: admin_activity_log
  - Columns: admin_id, action_type, entity_type, entity_id, details, timestamp
- Log these actions:
  - Feedback status changes
  - User deletions/admin toggles
  - Content deletions
  - Bulk operations
- Activity log page at /admin/activity
  - Filter by admin, action type, date range
  - Search details
  - Pagination

**Technical:**
- Create Supabase table/migration
- Wrapper function to log actions (logAdminAction helper)
- Call after each mutation

### 3. Export Functionality
**Purpose:** Export bug reports and data for external analysis

**Implementation:**
- Export buttons on list views:
  - Feedback → CSV with all fields
  - Users → CSV with stats
  - Wishlists/Items → CSV
- Client-side export (no server needed)
- Include filters in export (only export visible/filtered data)

**Technical:**
- Use papaparse or simple CSV generator
- Add download functionality to AdminTable component

### 4. Bulk Operations UI Enhancement
(Already started in Stage 4a, enhance here)

**Implementation:**
- Multi-select checkboxes on tables
- Bulk action bar appears when items selected
- Actions: Delete, Change status (feedback), Export selected
- Progress indicator for bulk operations
- Undo recent bulk action (optional, advanced)

SKIP FOR NOW:
- Import functionality (not needed for beta)
- Complex user role management (single is_admin flag is sufficient)
- Advanced reporting/BI (use simple dashboard from Stage 5)

OUTPUT:
- Global search component
- Activity log page and table
- Export utilities
- Enhanced bulk operations
- Database migration for activity log
- Update stage6_complete.md with implemented features
```

---

## STAGE 7: Polish & Integration
**Token Efficiency**: Final touches without rebuilding

### Prompt for Stage 7:
```
Final polish and integration for admin dashboard.

CONTEXT: All stage completion files

TASK:

### 1. Error Handling & States
- Error boundaries for all admin pages
- Loading skeletons (use shadcn/ui Skeleton)
- Empty states for all lists:
  - Custom messages per entity
  - Illustrations or icons
  - Call-to-action where relevant
- Toast notifications (success/error) using existing toast system
- Network error recovery (retry buttons)

### 2. Form Validation & UX
- All forms have proper validation
- Clear error messages
- Disabled states during submission
- Success feedback
- Prevent duplicate submissions

### 3. Accessibility
- ARIA labels on all interactive elements
- Focus management (modals, forms)
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader announcements for dynamic content
- Color contrast meets WCAG AA standards

### 4. Performance
- Pagination instead of infinite scroll for large lists
- Debounced search inputs
- Optimistic updates for mutations
- React Query cache optimization
- Lazy load non-critical components

### 5. Responsive Design
- Mobile-friendly tables (card view on small screens)
- Drawer navigation on mobile (instead of sidebar)
- Touch-friendly buttons and spacing
- Test on mobile viewport

### 6. Premium UI Polish
- Smooth transitions and animations
- Hover states on all interactive elements
- Loading indicators match app aesthetic
- Consistent spacing and typography
- Dark mode fully supported

### 7. Documentation
Create `ADMIN_DASHBOARD.md` with:
- Setup instructions (how to grant admin access)
- Feature overview (what each page does)
- Common tasks workflows:
  - "How to triage feedback"
  - "How to manage users"
  - "How to export data"
- Troubleshooting section

### 8. Testing Checklist
Test all CRUD operations per entity:
- [x] Feedback: View, filter, update status, add notes, delete
- [x] Users: View, search, toggle admin, delete
- [x] Wishlists: View, search, delete
- [x] Items: View, search, delete
- [x] Claims: View, remove
- [x] Categories: View, create, edit, delete
- [x] Global search works across entities
- [x] Activity log records actions
- [x] Exports generate correct CSV
- [x] Access control blocks non-admins
- [x] Mobile responsive on all pages
- [x] Dark mode works throughout

OUTPUT:
- Polished components with all states
- ADMIN_DASHBOARD.md documentation
- stage7_complete.md with:
  - All files created across stages
  - Setup instructions
  - Known limitations/future improvements
  - Testing checklist results

FINAL DELIVERABLE: Production-ready admin dashboard
```

---

## TOKEN OPTIMIZATION STRATEGIES

1. **Incremental References**: Each stage references small manifest files, not entire codebases
2. **Batched Entity Building**: Builds 2-3 entities at a time (4a: feedback+users, 4b: content, 4c: categories)
3. **Component Reuse**: Explicitly reuses shadcn/ui and custom components between stages
4. **JSON Plan**: Single source of truth prevents re-explaining structure
5. **Targeted File Viewing**: Only views necessary files on demand during Stage 1
6. **Completion Manifests**: Small markdown files track progress without repeating code
7. **Context Carryover**: Each stage knows what was built before via manifest files

---

## EXECUTION ORDER

1. **Stage 1** → Analyze codebase, create plan
2. **Stage 2** → Build navigation shell
3. **Stage 2.5** → Admin access control (checkpoint)
4. **Stage 3** → Data layer and API hooks
5. **Stage 4a** → Feedback + Users (PRIORITY)
6. **Stage 4b** → Wishlists + Items + Claims
7. **Stage 4c** → Categories (optional, can defer)
8. **Stage 5** → Dashboard home with analytics
9. **Stage 6** → Global search, activity log, exports
10. **Stage 7** → Polish, accessibility, documentation

---

## INTEGRATION WITH EXISTING APP

**Reuse These Existing Patterns:**
- Authentication flow (Supabase auth)
- Routing structure
- shadcn/ui components (Table, Dialog, Badge, Card, Select, etc.)
- Tailwind CSS styling and color scheme (#4338ca primary)
- React Query for data fetching
- Dark mode implementation
- Toast notification system

**New Additions:**
- `/admin` route tree
- `is_admin` database column
- Admin-specific API hooks
- Admin activity logging (optional but recommended)

---

## FUTURE ENHANCEMENTS (Post-Stage 7)

After completing all stages, consider these additions:
- **Real-time notifications**: Alert admins when new feedback arrives (Supabase Realtime)
- **Admin roles**: Differentiate between super admin and moderator
- **Batch email**: Email users from admin panel
- **Advanced analytics**: Integration with analytics service (Plausible, PostHog, etc.)
- **User impersonation**: "View as user" feature for debugging
- **Automated moderation**: Flag suspicious content for review
- **API rate limiting**: Monitor and manage API usage per user

---

## NOTES

- **Priority**: Feedback management is most critical for beta launch
- **Timeline**: Stages 1-4a should be completed first for immediate value
- **Flexibility**: Can pause after any stage and resume later
- **Iteration**: Each stage produces working features, allowing for user feedback between stages
- **Scalability**: Architecture supports adding more entities later without refactoring

## Quick Reference

**Most Urgent Path**: Stages 1 → 2 → 2.5 → 3 → 4a = Working feedback triage system

**Full Implementation**: All stages 1-7 = Complete admin dashboard

**Estimated Effort**: 
- Stages 1-4a: ~60% of work, ~80% of immediate value
- Stages 4b-7: ~40% of work, ~20% of immediate value (nice-to-have polish)
