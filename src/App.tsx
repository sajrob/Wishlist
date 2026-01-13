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
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from "@/components/ui/sonner";
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
    <Router>
      <AuthProvider>
        <Navbar />
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
          <Route path="/contact" element={<ContactUs />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;


