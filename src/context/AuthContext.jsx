import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('AuthProvider mounted');
        let mounted = true;

        // Failsafe: Force loading to false after 5 seconds
        const timeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth loading timed out, forcing false');
                setLoading(false);
            }
        }, 5000);

        // 1. Get initial session
        const getSession = async () => {
            try {
                console.log('Getting session...');
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) throw error;
                console.log('Session retrieved:', session ? 'Found user' : 'No session');

                if (session?.user) {
                    await fetchProfile(session.user);
                }
            } catch (error) {
                console.error('Error getting session:', error);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        getSession();

        // 2. Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state change:', event);
            if (session?.user) {
                await fetchProfile(session.user);
            } else {
                setUser(null);
            }
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(timeout);
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

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
