import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signIn, signInWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setError('');
            setLoading(true);
            const { error } = await signIn(email, password);
            if (error) throw error;
            navigate('/wishlist');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Welcome Back</h2>
                {error && <div className="error-message">{error}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Enter your password"
                        />
                    </div>
                    <button disabled={loading} className="auth-button" type="submit">
                        {loading ? 'Logging in...' : 'Log In'}
                    </button>
                </form>
                <div className="auth-divider">or</div>
                <button onClick={handleGoogleSignIn} className="auth-button google-button">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M23.52 12.29C23.52 11.43 23.47 10.51 23.15 9.77H12.2V14.16H18.71C18.42 15.68 17.65 17 16.2 17.97V21.13H20.08C22.37 19.01 23.52 15.92 23.52 12.29Z" fill="#4285F4" />
                        <path d="M12.2 23.49C15.34 23.49 18.02 22.47 19.95 20.73L16.2 17.59C15.15 18.28 13.77 18.73 12.2 18.73C9.17 18.73 6.64 16.73 5.71 13.98H1.67V17.06C3.65 20.95 7.69 23.49 12.2 23.49Z" fill="#34A853" />
                        <path d="M5.71 13.98C5.46 13.25 5.33 12.49 5.33 11.75C5.33 10.99 5.46 10.23 5.71 9.51V6.42H1.67C0.84 8.04 0.33 9.85 0.33 11.75C0.33 13.65 0.84 15.45 1.67 17.06L5.71 13.98Z" fill="#FBBC05" />
                        <path d="M12.2 4.77C13.93 4.77 15.51 5.36 16.74 6.51L20.21 3.09C18.06 1.05 15.37 0 12.2 0C7.69 0 3.65 2.54 1.67 6.42L5.71 9.51C6.64 6.78 9.17 4.77 12.2 4.77Z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>
                <div className="auth-link">
                    Need an account? <Link to="/signup">Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
