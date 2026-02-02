# Wishlist Admin Dashboard Guide

Welcome to the Wishlist Admin Dashboard. This panel allows you to manage users, moderate content, and triage feedback reports.

## Getting Started

### Granting Admin Access
To grant a user admin privileges:
1. Go to the **User Management** page.
2. Find the user by searching for their name or email.
3. Toggle the **Admin** switch next to their name.
4. *Note: Only a Super Admin (manual database entry) can grant the first admin role.*

## Core Features

### 1. Dashboard Overview
The home page provides a birds-eye view of your platform's health:
- **Total Users/Wishlists/Items**: Current system-wide counts.
- **Pending Feedback**: Real-time count of unresolved bug reports.
- **Audit Trail**: A live feed of recent actions (signups, claims, etc.).

### 2. Feedback Triage
This is your primary tool for managing beta testers.
- **Status Workflow**: New → In Progress → Resolved → Archived.
- **Filtering**: Filter by type (Bug, Feature Request, UX Issue).
- **Export**: Use the **Export CSV** button to download feedback for external tracking.

### 3. Content Moderation
- **Wishlists**: View all public and private wishlists.
- **Items**: Monitor what items are being added.
- **Claims**: Track gifts being claimed to ensure system integrity.
- **Deletion**: Deleting a wishlist or item will cascade and remove all related data (claims, notifications).

### 4. System Audit Log
Every critical admin action (deletions, status changes) is recorded here with:
- Who performed the action.
- What entity was affected.
- When it happened.

## Professional Tips
- **Search Everywhere**: Use the search bar in the header (or `Ctrl+K`) to jump directly to a user or wishlist from any page.
- **Mobile Friendly**: The dashboard is fully responsive. You can triage feedback from your phone using the optimized "Card View".
- **Safety First**: Always double-check before deleting a user, as this action cannot be undone.

## Troubleshooting
- **Data not loading?**: Check your internet connection. The dashboard uses React Query to auto-retry failed requests.
- **Relationship Errors**: If you see a "relationship error", please notify the development team to refresh the database schema cache.
