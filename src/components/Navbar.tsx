import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        if (user) {
            void fetchUnreadCount();

            const subscription = supabase
                .channel('notifications_count')
                .on(
                    'postgres_changes',
                    {
                        event: 'INSERT',
                        schema: 'public',
                        table: 'notifications',
                        filter: `user_id=eq.${user.id}`,
                    },
                    () => {
                        void fetchUnreadCount();
                    }
                )
                .subscribe();

            return () => {
                void subscription.unsubscribe();
            };
        }
    }, [user]);

    const fetchUnreadCount = async () => {
        if (!user) return;
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);

        if (!error) {
            setUnreadCount(count || 0);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Minimal logo section */}
                <Link to={user ? "/dashboard" : "/"} className="navbar-logo">
                    Wishlist
                </Link>

                <div className="navbar-menu">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {/* Notification Bell */}
                            <Link to="/notifications" className="navbar-link notification-link" title="Notifications">
                                🔔
                                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                            </Link>

                            {/* User Info - Hidden on very small screens */}
                            <div className="hidden sm:block text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full italic">
                                {user.email}
                            </div>
                        </div>
                    ) : (
                        <>
                            <NavLink
                                to="/"
                                className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                            >
                                Home
                            </NavLink>
                            <NavLink
                                to="/login"
                                className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                            >
                                Login
                            </NavLink>
                            <Link to="/signup" className="navbar-btn signup">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
