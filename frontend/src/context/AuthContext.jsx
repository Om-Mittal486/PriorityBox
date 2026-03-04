import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch user profile if token exists
    const fetchUser = useCallback(async () => {
        const token = localStorage.getItem('mailwatch_token');
        if (!token) {
            setLoading(false);
            return;
        }
        try {
            const { data } = await api.get('/auth/me');
            setUser(data.user);
            setError(null);
        } catch (err) {
            localStorage.removeItem('mailwatch_token');
            setUser(null);
            setError('Session expired. Please log in again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    // Save token after Google OAuth callback
    const loginWithToken = useCallback(async (token) => {
        localStorage.setItem('mailwatch_token', token);
        setLoading(true);
        await fetchUser();
    }, [fetchUser]);

    // Start Google OAuth redirect
    const loginWithGoogle = useCallback(async () => {
        try {
            const { data } = await api.get('/auth/google');
            window.location.href = data.url;
        } catch (err) {
            setError('Failed to initiate login. Please try again.');
        }
    }, []);

    // Logout
    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } catch (err) {
            // Ignore logout API errors
        }
        localStorage.removeItem('mailwatch_token');
        setUser(null);
    }, []);

    const value = {
        user,
        loading,
        error,
        loginWithGoogle,
        loginWithToken,
        logout,
        setError,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
