import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const mapUser = (supabaseUser) => {
        if (!supabaseUser) return null;
        return {
            id: supabaseUser.id,
            email: supabaseUser.email,
            username: supabaseUser.user_metadata?.username || supabaseUser.email.split('@')[0],
            role: supabaseUser.user_metadata?.role || 'farmer',
            preferred_language: supabaseUser.user_metadata?.preferred_language || 'en'
        };
    };

    useEffect(() => {
        // 1. Check existing session
        const initAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    localStorage.setItem('token', session.access_token);
                    setUser(mapUser(session.user));
                }
            } catch (err) {
                console.error("Supabase getSession error:", err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // 2. Listen to auth changes (sign in, sign out, token refresh)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                localStorage.setItem('token', session.access_token);
                setUser(mapUser(session.user));
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Register user with email, password, and metadata
    const register = async (username, email, password, role = 'farmer') => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    role,
                }
            }
        });
        if (error) throw error;
        return data;
    };

    // Verify 8-digit OTP token for signup confirmation
    const verifyOtp = async (email, token) => {
        const { data, error } = await supabase.auth.verifyOtp({
            email: email.trim(),
            token: token.trim(),
            type: 'signup' // Confirms signup using the 8-digit OTP
        });
        if (error) throw error;
        if (data?.session) {
            localStorage.setItem('token', data.session.access_token);
            setUser(mapUser(data.user));
        }
        return data;
    };

    // Resend 8-digit OTP to user's email
    const resendOtp = async (email) => {
        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email.trim()
        });
        if (error) throw error;
    };

    // Login with email and password
    const login = async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password
        });
        if (error) throw error;
        if (data?.session) {
            localStorage.setItem('token', data.session.access_token);
            setUser(mapUser(data.user));
        }
        return data.user;
    };

    // Logout
    const logout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error("Sign out error:", err);
        } finally {
            localStorage.removeItem('token');
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        login,
        register,
        verifyOtp,
        resendOtp,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
