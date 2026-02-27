# Me List (Wishlist App)

A modern, social wishlist application designed to help you organize your gift ideas and share them with your friends and community. Built with offline-first capabilities and real-time social features.

## 🚀 Features

- **Personalized Wishlists**: Create, manage, and categorize the items you want or need.
- **Social Connectivity**: Follow friends, browse their public wishlists, and manage your followers.
- **Item Claiming**: Let friends "claim" items off your list to avoid duplicate gifts (with context-aware routing).
- **Progressive Web App (PWA)**: Installable on iOS and Android home screens for a native-like experience.
- **Offline & Flaky Network Support**: Fully robust Service Worker that caches data and handles a Background Sync Queue so you can add items even when offline.
- **Push Notifications**: Real-time push alerts for item claims and social interactions, powered by Supabase Edge Functions with context-aware deep linking.
- **Admin Dashboard**: Comprehensive management portal for users, wishlists, items, claims, and system logs.
- **Modern UI**: A sleek, responsive interface built with Tailwind CSS, Shadcn/UI, and Radix primitives.
- **Real-Time Data**: Instant UI updates powered by TanStack Query and Supabase Realtime.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **PWA Management**: `vite-plugin-pwa` with custom Service Worker strategies & notification queues.
- **State Management**: TanStack Query (React Query) with Persister for offline caching.
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend / Database**: Supabase (PostgreSQL, Auth, Storage)
- **Serverless**: Supabase Edge Functions (Deno) for heavy tasks like Web Push notifications.
- **Routing**: React Router v7

## 🚦 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Supabase account

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/sajrob/Wishlist.git
   cd Wishlist
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
   ```
   *(Note: You will also need VAPID keys set up in your Supabase Edge Function secrets for Push Notifications)*

4. **Database Setup**:
   Apply the migrations found in the `supabase/migrations/` directory to ensure your PostgreSQL database has the proper schema, tables (`items`, `claims`, `friends`, `push_notification_queue`), and Triggers.

5. **Run the local development server**:
   ```bash
   npm run dev
   ```

The application will be running at `http://localhost:5173`.

## 📂 Project Structure

- `src/components/`: Reusable UI components, layout elements, and Radix primitives.
- `src/pages/`: Main application views (Home, Profile, Friends, Admin Dashboard, etc.).
- `src/hooks/`: Custom React hooks for data fetching, notifications, and logic.
- `src/lib/`: Utility configurations (Supabase client, queries, Push Notifications).
- `src/context/`: React Context for global state (Auth, Wishlists, Conflicts).
- `supabase/functions/`: Deno Edge Functions (e.g., `send-push-notification`).
- `supabase/migrations/`: Database schema and complex SQL triggers.

## 📄 License

This project is licensed under the MIT License.
