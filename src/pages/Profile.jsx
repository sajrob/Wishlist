import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import './Profile.css';

const Profile = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [stats, setStats] = useState({ items: 0, categories: 0 });
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        full_name: '',
        email: ''
    });

    useEffect(() => {
        if (user) {
            // Logic to handle existing users who only have full_name
            const meta = user.user_metadata || {};
            let firstName = meta.first_name || '';
            let lastName = meta.last_name || '';

            if (!firstName && meta.full_name) {
                const names = meta.full_name.trim().split(' ');
                firstName = names[0];
                lastName = names.slice(1).join(' ');
            }

            setFormData({
                first_name: firstName,
                last_name: lastName,
                full_name: meta.full_name || '',
                email: user.email || ''
            });
            fetchStats();
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            const { count: itemsCount } = await supabase
                .from('items')
                .select('*', { count: 'exact', head: true });

            const { count: catsCount } = await supabase
                .from('categories')
                .select('*', { count: 'exact', head: true });

            setStats({
                items: itemsCount || 0,
                categories: catsCount || 0
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const fullName = `${formData.first_name} ${formData.last_name}`.trim();
            const { error } = await supabase.auth.updateUser({
                data: {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    full_name: fullName
                }
            });

            if (error) throw error;

            // Also update the public profiles table to ensure discoverability
            const { error: profileError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    email: user.email,
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    full_name: fullName,
                    updated_at: new Date()
                });

            if (profileError) {
                console.error('Error updating public profile:', profileError);
                // We don't necessarily want to fail everything if this fails, but it's important.
                // For now, let's treat it as non-fatal but log it, or append to message.
            }
            // Update local state to reflect the simplified full name
            setFormData(prev => ({ ...prev, full_name: fullName }));
            setMessage('Profile updated successfully!');
        } catch (error) {
            setMessage('Error updating profile: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name) => {
        return name
            ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
            : 'U';
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-avatar">
                    {getInitials(formData.full_name)}
                </div>
                <div className="profile-info">
                    <h1>{formData.full_name || 'User'}</h1>
                    <p>{formData.email}</p>
                </div>
            </div>

            <div className="profile-section">
                <h2>Overview</h2>
                <div className="profile-stats">
                    <div className="stat-card">
                        <span className="stat-number">{stats.items}</span>
                        <span className="stat-label">Wishlist Items</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">{stats.categories}</span>
                        <span className="stat-label">Categories</span>
                    </div>
                </div>
            </div>

            <div className="profile-section">
                <h2>Settings</h2>
                {message && (
                    <div className={message.includes('Error') ? 'error-message' : 'success-message'}
                        style={{
                            padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem',
                            backgroundColor: message.includes('Error') ? '#fef2f2' : '#f0fdf4',
                            color: message.includes('Error') ? '#dc2626' : '#16a34a',
                            border: `1px solid ${message.includes('Error') ? '#fee2e2' : '#bbf7d0'}`
                        }}>
                        {message}
                    </div>
                )}
                <form onSubmit={handleUpdateProfile} className="profile-form">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label>First Name</label>
                            <input
                                type="text"
                                value={formData.first_name}
                                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                placeholder="First Name"
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name</label>
                            <input
                                type="text"
                                value={formData.last_name}
                                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                placeholder="Last Name"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            disabled
                            style={{ opacity: 0.7, cursor: 'not-allowed' }}
                        />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="save-btn" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
