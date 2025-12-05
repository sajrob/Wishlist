import React, { useContext, useState, useEffect, createContext } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = (email, password, metadata) => {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata,
            },
        });
    };

    const signIn = (email, password) => {
        return supabase.auth.signInWithPassword({
            email,
            password,
        });
    };

    const signInWithGoogle = () => {
        return supabase.auth.signInWithOAuth({
            provider: 'google',
        });
    };

    const signOut = () => {
        return supabase.auth.signOut();
    };

    const value = {
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        user,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
