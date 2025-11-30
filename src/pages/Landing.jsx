import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // If already logged in, redirect to dashboard
    React.useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="landing-left">
                    <h1 className="landing-title">
                        Create Your <span className="highlight">Wishlist</span>
                    </h1>
                    <p className="landing-description">
                        Create, manage, and share your wishlist with friends and family.
                        Never forget what you want, and make gift-giving easier for everyone.
                    </p>
                    <div className="landing-buttons">
                        <Link to="/register" className="btn btn-primary">
                            Get Started
                        </Link>
                        <Link to="/login" className="btn btn-secondary">
                            Sign In
                        </Link>
                    </div>
                </div>

                <div className="landing-right">
                    <img
                        src="/hero-image.png"
                        alt="Wishlist illustration"
                        className="hero-image"
                    />
                </div>
            </div>
        </div>
    );
};

export default Landing;
