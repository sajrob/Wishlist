import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Failed to logout', error);
        }
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    // Close menu when route changes
    React.useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to={user ? "/dashboard" : "/"} className="navbar-logo">
                    Wishlist
                </Link>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    {user ? (
                        <>
                            <Link to="/dashboard" className={`navbar-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                                Home
                            </Link>
                            <Link to="/profile" className={`navbar-item ${location.pathname === '/profile' ? 'active' : ''}`}>
                                Profile
                            </Link>
                            <button onClick={handleLogout} className="navbar-item logout-btn-nav">
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className={`navbar-item ${location.pathname === '/login' ? 'active' : ''}`}>
                                Sign In
                            </Link>
                            <Link to="/register" className="navbar-item-cta">
                                Get Started
                            </Link>
                        </>
                    )}
                </div>

                {user && (
                    <div className="navbar-user">
                        <Link to="/profile" className="navbar-user-link">
                            <img
                                src={user.avatar_url || user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.email)}&background=random`}
                                alt="User"
                                className="navbar-avatar"
                            />
                            <span className="navbar-username">{user.full_name || user.name || 'User'}</span>
                        </Link>
                        <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                            <span className="bar"></span>
                            <span className="bar"></span>
                            <span className="bar"></span>
                        </button>
                    </div>
                )}

                {!user && (
                    <button className="navbar-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
