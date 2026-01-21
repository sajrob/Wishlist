# Wishlist

A modern, social wishlist application designed to help you organize your gift ideas and share them with friends.

## 🚀 Features

- **Personalized Wishlists**: Create and manage items across different categories.
- **Privacy Controls**: Set wishlists or specific categories as public or private.
- **Social Connectivity**: Follow friends, see their public wishlists, and manage your followers.
- **Real-time Sync**: Powered by Supabase for instant updates across devices.
- **Modern UI**: A sleek, responsive interface built with Tailwind CSS and Radix UI components.
- **Auth & Profiles**: Secure email/password login and customizable user profiles.

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS, Shadcn/UI
- **Backend**: Supabase (Auth, Database, Storage)
- **Routing**: React Router v7
- **Deployment**: Vercel

#### Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url>
   cd Wishlist
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**:
   Initialize your Supabase project using the provided `supabase_schema.sql` (if available) or by manually creating the `items`, `categories`, and `follows` tables.

5. **Run the app**:
   ```bash
   npm run dev
   ```

The application will be running at `http://localhost:5173`.

## 📂 Project Structure

- `src/components`: Reusable UI components and Radix primitives.
- `src/pages`: Main application views (Home, Friends, Profile, etc.).
- `src/context`: React Context for global state (Auth).
- `src/hooks`: Custom React hooks for data fetching and logic.
- `src/lib`: Utility configurations (Supabase client, utils).

## 📄 License

This project is licensed under the MIT License.
