import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
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
                        <Link to="/wishlist" className="btn btn-primary">
                            Get Started
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
