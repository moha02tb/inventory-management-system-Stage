import { useAuthContext } from '../context/AuthContext';

export const useAuth = () => {
    const context = useAuthContext();
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    // Destructure auth state
    const { isAuthenticated, role, name, isLoading } = context.auth;
    
    // Helper to check if user is admin
    const isAdmin = role === 'admin';
    
    return {
        isAuthenticated,
        role,
        name,
        isLoading,
        isAdmin,
        updateAuth: context.updateAuth,
        setAuth: context.setAuth
    };
};
