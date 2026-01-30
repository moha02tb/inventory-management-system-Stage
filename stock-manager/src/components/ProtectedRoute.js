import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { isAuthenticated, role, isLoading } = useAuth();

    // ------------------------------------------------------------------
    // FIX 1: Prioritize the loading state. Stop all other logic when loading.
    // ------------------------------------------------------------------
    if (isLoading) {
        // Show a loading indicator while checking status
        return <div className="p-6 text-center">Loading authentication...</div>;
    }

    // ------------------------------------------------------------------
    // FIX 2: Check isAuthenticated ONLY after loading is complete.
    // ------------------------------------------------------------------
    if (!isAuthenticated) {
        // User is not logged in, redirect to login page
        return <Navigate to="/login" replace />;
    }

    // ------------------------------------------------------------------
    // 3. Authorization Check (Now that we know they are authenticated)
    // ------------------------------------------------------------------
    if (allowedRoles && !allowedRoles.includes(role)) {
        // User is logged in but does not have the required role
        return (
            <div className="p-6 text-red-600">
                <h1>Access Denied (403)</h1>
                <p>You do not have the required permissions (Role: {role}) to view this page.</p>
            </div>
        );
    }

    // User is authenticated and authorized, render the child component
    return children;
};

export default ProtectedRoute;
