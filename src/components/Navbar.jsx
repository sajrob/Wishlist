import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Wishlist
                </Link>
                <div className="navbar-menu">
                    <NavLink to="/" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
                        Home
                    </NavLink>
                    {user ? (
                        <>
                            <NavLink to="/wishlist" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
                                Dashboard
                            </NavLink>
                            <NavLink to="/profile" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
                                Profile
                            </NavLink>
                            <button onClick={handleLogout} className="navbar-btn logout">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={({ isActive }) => isActive ? "navbar-link active" : "navbar-link"}>
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
