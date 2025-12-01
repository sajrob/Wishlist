import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    Wishlist
                </Link>
                <div className="navbar-menu">
                    <Link to="/" className="navbar-link">
                        Home
                    </Link>
                    <Link to="/wishlist" className="navbar-link">
                        Dashboard
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
