import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            try {
                console.log('Auth: Initializing...');
                // Get initial session
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;
                console.log('Auth: Initial session check complete. User:', session?.user?.email);

                if (mounted) {
                    if (session?.user) {
                        await fetchProfile(session.user);
                    } else {
                        setUser(null);
                    }
                }
            } catch (error) {
                console.error('Auth: Error initializing:', error);
                if (mounted) setUser(null);
            } finally {
                if (mounted) {
                    console.log('Auth: Setting loading to false (init)');
                    setLoading(false);
                }
            }
        };

        initializeAuth();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            console.log('Auth: State change event:', event);

            if (event === 'PASSWORD_RECOVERY') {
                console.log('Auth: Password recovery event detected');
                setLoading(false);
                return;
            }

            if (session?.user) {
                console.log('Auth: User authenticated:', session.user.email);
                // Only fetch profile if we don't have it or it's a different user
                if (!user || user.id !== session.user.id) {
                    await fetchProfile(session.user);
                }
            } else {
                console.log('Auth: User signed out');
                setUser(null);
            }
            console.log('Auth: Setting loading to false (change)');
            setLoading(false);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const fetchProfile = async (authUser) => {
        try {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (error && error.code !== 'PGRST116') {
                console.error('Error fetching profile:', error);
            }

            setUser({ ...authUser, ...(profile || {}) });
        } catch (error) {
            console.error('Profile fetch error:', error);
            // Even if profile fetch fails, we should still set the user so they can log in
            setUser(authUser);
        }
    };

    const login = async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Login detailed error:', error);
            throw error;
        }
    };

    const register = async (name, email, password) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                },
                emailRedirectTo: `${window.location.origin}/dashboard`,
            },
        });
        if (error) throw error;
        return data;
    };

    const logout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setUser(null);
    };

    const updateProfile = async (data) => {
        const updates = {
            updated_at: new Date(),
            full_name: data.name,
        };

        const { error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id);

        if (error) throw error;
        setUser({ ...user, ...updates });
    };

    const resetPassword = async (email) => {
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/update-password`,
        });
        if (error) throw error;
        return data;
    };

    const updatePassword = async (newPassword) => {
        const { data, error } = await supabase.auth.updateUser({
            password: newPassword
        });
        if (error) throw error;
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile, resetPassword, updatePassword, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
