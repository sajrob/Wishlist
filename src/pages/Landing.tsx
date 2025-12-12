import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
    return (
        <div className="landing-container">
            <div className="landing-content">
                <div className="landing-left">
                    <h1 className="landing-title">
                        The ultimate <span className="highlight">gift-giving</span> social app.
                    </h1>
                    <p className="landing-description">
                        Create your own wish list, browse your friends' and family's <span className="colored-strikethrough">wishlists</span> desires.
                        Give and receive the perfect gift, every time.
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


