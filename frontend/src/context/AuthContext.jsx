
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'

    const navigate = useNavigate();

    useEffect(() => {
        // Check active session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                // Close modal and redirect to dashboard on successful auth
                setIsAuthModalOpen(false);
                navigate('/dashboard');
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [navigate]);

    const openAuthModal = (mode = 'login') => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
        if (error) throw error;
    };

    const loginWithMagicLink = async (email) => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
                shouldCreateUser: false, // Disallow creating new user on login
            },
        });
        if (error) throw error;
    };

    const signupWithMagicLink = async (email) => {
        // For signup, we just usage standard OTP. 
        // Supabase doesn't have a specific "fail if exists" for OTP via client easily without admin,
        // but normal flow is fine. If they exist, they just get a link.
        // However, for strictness, we might rely on UI messaging or handle specific error codes if available.
        // For now, standard flow allows signup.
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin,
            },
        });
        if (error) throw error;
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        navigate('/');
    };

    const value = {
        user,
        signInWithGoogle,
        loginWithMagicLink,
        signupWithMagicLink,
        signOut,
        loading,
        isAuthModalOpen,
        authMode,
        setAuthMode,
        openAuthModal,
        closeAuthModal
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
