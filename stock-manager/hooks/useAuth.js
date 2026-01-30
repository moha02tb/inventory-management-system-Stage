// File: src/hooks/useAuth.js

import { useState, useEffect } from 'react';
import { checkAuthStatus } from '../api/authApi'; 

// This hook uses React state to manage authentication status globally in components
export const useAuth = () => {
    const [auth, setAuth] = useState(checkAuthStatus());

    useEffect(() => {
        // Function to refresh authentication status
        const updateAuthStatus = () => {
            setAuth(checkAuthStatus());
        };

        // You might listen to storage changes or simply export this function
        // to call it manually after login/logout.
        window.addEventListener('storage', updateAuthStatus);

        return () => {
            window.removeEventListener('storage', updateAuthStatus);
        };
    }, []);

    // A utility function to force a state update after login/logout events
    const refreshAuth = () => {
        setAuth(checkAuthStatus());
    };

    return {
        ...auth, // Includes isAuthenticated and role
        isAdmin: auth.role === 'admin',
        refreshAuth
    };
};