# Wishlist App

A modern web application for creating and managing personal wishlists. Users can create accounts, add items they want, organize them into categories, and keep track of their gift wishes.

## Features

- User authentication (email/password and Google OAuth)
- Create, edit, and delete wishlist items
- Organize items into custom categories
- User profile management
- Responsive design for mobile and desktop
- Real-time data synchronization

## Tech Stack

- **Frontend:** React, React Router, Vite
- **Backend:** Supabase (PostgreSQL, Authentication)
- **Styling:** CSS
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- A Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Wishlist
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the database migrations using the `supabase_schema.sql` file in your Supabase project

5. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/          # Page components
├── context/        # React context providers
├── App.jsx         # Main application component
└── main.jsx        # Application entry point
```

## License

This project is open source and available under the MIT License.
