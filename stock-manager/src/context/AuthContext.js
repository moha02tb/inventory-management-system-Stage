import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkAuthStatus } from '../api/authApi'; // Import the check function

// 1. Create the Context object
export const AuthContext = createContext(null);

// 2. Custom hook to use the Auth context easily
export const useAuthContext = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    // Initialize state: IMPORTANTLY, set isLoading to true
    const [auth, setAuth] = useState({ 
        isAuthenticated: false, 
        role: null, 
        name: null,
        isLoading: true 
    });

    // Run once on initial component mount to check localStorage for the token
    useEffect(() => {
        const status = checkAuthStatus(); // Get status from localStorage
        
        // Update state with the status read from storage
        setAuth({
            isAuthenticated: status.isAuthenticated,
            role: status.role,
            name: status.name,
            isLoading: false // CRITICAL: Set loading to false ONLY after the check is complete
        });
    }, []);
    
    // Function to update the context after a successful login (called by Login.jsx via useAuth if needed)
    // Note: Since loginUser already updates localStorage, this might be optional 
    // but is good for immediate UI updates without a full page reload.
    const updateAuth = (isAuthenticated, role, name) => {
        setAuth({
            isAuthenticated,
            role,
            name,
            isLoading: false
        });
    };
    
    // The value provided to all consuming components
    const contextValue = {
        auth,
        setAuth,
        updateAuth // You can use this function in Login.jsx if needed
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};
