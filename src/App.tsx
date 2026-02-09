/**
 * Main App component that defines the application's routing structure and global providers.
 * Manages public and private routes, authentication context, and global UI components like the Navbar and Toaster.
 */
import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import UpdatePassword from './pages/UpdatePassword';
import Profile from './pages/Profile';
import FindUsers from './pages/FindUsers';
import FriendsWishlists from './pages/FriendsWishlists';
import SharedWishlist from './pages/SharedWishlist';
import Notifications from './pages/Notifications';
import ContactUs from './pages/ContactUs';
import SharePage from './pages/SharePage';
import Faq from './pages/Faq';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WishlistProvider } from './context/WishlistContext';
import { Toaster } from "@/components/ui/sonner";
import { OfflineBanner } from './components/OfflineBanner';
import { SyncStatus } from './components/SyncStatus';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminFeedback from './pages/admin/Feedback';
import AdminUsers from './pages/admin/Users';
import AdminWishlists from './pages/admin/Wishlists';
import AdminItems from './pages/admin/Items';
import AdminClaims from './pages/admin/Claims';
import AdminActivityLog from './pages/admin/ActivityLog';
import { ProtectedAdminRoute } from './components/admin/ProtectedAdminRoute';
// ============================================================
// DARK MODE TOGGLE - Currently Disabled
// ============================================================
// To re-enable dark mode:
// 1. Change defaultTheme to "system" in the ThemeProvider below (line ~64)
// 2. Uncomment the ModeToggle in Navbar.tsx (line ~205)
// 3. Uncomment the ModeToggle in AdminLayout.tsx (line ~26)
// ============================================================
import { ThemeProvider } from './components/theme-provider';
import { ConflictProvider } from './context/ConflictContext';
import './App.css';


const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    // ============================================================
    // DARK MODE TOGGLE - Currently Disabled
    // To re-enable: Change defaultTheme to "system" below
    // and uncomment ModeToggle in Navbar.tsx and AdminLayout.tsx
    // ============================================================
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Router>
        <AuthProvider>
          <ConflictProvider>
            <WishlistProvider>
              <div className="flex flex-col min-h-screen">
                <OfflineBanner />
                <SyncStatus />
                <Navbar />
                <main className="flex-1 flex flex-col">
                  <Routes>
                    {/* Public Routes - Accessible to everyone */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/update-password" element={<UpdatePassword />} />
                    <Route path="/faq" element={<Faq />} />
                    <Route path="/share/:categoryId" element={<SharePage />} />
                    {/*incomplete <Route path="/contact" element={<ContactUs />} /> */}

                    {/* Private Routes - Require Authentication */}
                    <Route
                      path="/dashboard"
                      element={
                        <PrivateRoute>
                          <Home />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute>
                          <Profile />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/find-users"
                      element={
                        <PrivateRoute>
                          <FindUsers />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/friends"
                      element={
                        <PrivateRoute>
                          <FriendsWishlists />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/wishlist/:userId"
                      element={
                        <PrivateRoute>
                          <SharedWishlist />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/notifications"
                      element={
                        <PrivateRoute>
                          <Notifications />
                        </PrivateRoute>
                      }
                    />

                    {/* Admin Routes */}
                    <Route element={<ProtectedAdminRoute />}>
                      <Route path="/admin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route path="feedback" element={<AdminFeedback />} />
                        <Route path="users" element={<AdminUsers />} />
                        <Route path="wishlists" element={<AdminWishlists />} />
                        <Route path="items" element={<AdminItems />} />
                        <Route path="claims" element={<AdminClaims />} />
                        <Route path="activity" element={<AdminActivityLog />} />
                      </Route>
                    </Route>

                    {/* 404 Page */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </WishlistProvider>
          </ConflictProvider>
        </AuthProvider>
        <Toaster position="top-center" />
      </Router>
    </ThemeProvider>
  );
}

export default App;