import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const handleLogout = async () => {
        setIsMenuOpen(false);
        await signOut();
        navigate('/');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    Wishlist
                </Link>

                <div className={`navbar-toggle ${isMenuOpen ? 'active' : ''}`} onClick={toggleMenu}>
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </div>

                <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
                    <NavLink
                        to="/"
                        className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                        onClick={closeMenu}
                    >
                        Home
                    </NavLink>
                    {user ? (
                        <>
                            <NavLink
                                to="/wishlist"
                                className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                                onClick={closeMenu}
                            >
                                Dashboard
                            </NavLink>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                                onClick={closeMenu}
                            >
                                Profile
                            </NavLink>
                            <NavLink
                                to="/find-users"
                                className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                                onClick={closeMenu}
                            >
                                Find Friends
                            </NavLink>
                            <NavLink
                                to="/friends-wishlists"
                                className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                                onClick={closeMenu}
                            >
                                Friends' Wishlists
                            </NavLink>
                            <button onClick={handleLogout} className="navbar-btn logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/login"
                                className={({ isActive }) => (isActive ? 'navbar-link active' : 'navbar-link')}
                                onClick={closeMenu}
                            >
                                Login
                            </NavLink>
                            <Link to="/signup" className="navbar-btn signup" onClick={closeMenu}>
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


