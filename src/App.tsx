import React, { ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from "@/components/ui/sonner";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import './App.css';

const PrivateRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppContent = () => {
  const { pathname } = useLocation();
  const isLandingPage = pathname === "/";

  return (
    <SidebarProvider>
      {!isLandingPage && <AppSidebar />}
      <div className="flex flex-col min-h-screen w-full">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 lg:h-[60px] lg:px-6">
          {!isLandingPage && <SidebarTrigger />}
          <div className="flex-1">
            <Navbar />
          </div>
        </header>
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/update-password" element={<UpdatePassword />} />
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
              path="/friends-wishlists"
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;


