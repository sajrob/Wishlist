import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { resetPassword } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setMessage('');
            setError('');
            setLoading(true);
            const { error } = await resetPassword(email);
            if (error) throw error;
            setMessage('Check your inbox for further instructions.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Reset Password</h2>
                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message" style={{
                    background: '#f0fdf4',
                    border: '1px solid #dcfce7',
                    color: '#166534',
                    padding: '0.75rem',
                    borderRadius: '0.5rem',
                    fontSize: '0.9rem',
                    marginBottom: '1rem'
                }}>{message}</div>}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="Enter your email"
                        />
                    </div>
                    <button disabled={loading} className="auth-button" type="submit">
                        {loading ? 'Sending...' : 'Reset Password'}
                    </button>
                </form>
                <div className="auth-link">
                    <Link to="/login">Back to Login</Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
