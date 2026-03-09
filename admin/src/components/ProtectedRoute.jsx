import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { canAccessPath } from '../config/roleConfig';

/**
 * ProtectedRoute component that checks if user has access to a specific route
 * Redirects to dashboard if user doesn't have permission
 */
const ProtectedRoute = ({ children, tabId }) => {
    const location = useLocation();
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    // If not logged in, redirect to login
    if (!token) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // If owner, check if they have a subscription plan
    if (role === 'owner') {
        // Check subscription from localStorage or context
        // For now, we'll let the DashboardLayout handle the modal display
        // This check can be enhanced to redirect to plans page if needed
        return children;
    }


    // Get accessToTabs from localStorage
    let accessToTabs = null;
    try {
        const stored = localStorage.getItem('accessToTabs');
        accessToTabs = stored ? JSON.parse(stored) : null;
    } catch (e) {
        console.error('Error parsing accessToTabs:', e);
    }

    // Check if user can access this path
    const hasAccess = canAccessPath(role, accessToTabs, location.pathname);

    if (!hasAccess) {
        // Redirect to dashboard or first accessible page
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
