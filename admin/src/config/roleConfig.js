/**
 * Role-based tab configuration for dashboard navigation
 * This file centralizes all tab definitions and access control
 */

// All possible tabs in the dashboard
export const ALL_TABS = [
    { id: 'profile', path: '/dashboard/profile', label: 'Profile', icon: '/account_circle.svg' },
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: '/dashboard.svg', end: true },
    { id: 'appointment', path: '/dashboard/appointments', label: 'Appointments', icon: '/appointment.svg' },
    { id: 'earning', path: '/dashboard/earning', label: 'Earning', icon: '/earning.svg' },
    // { id: 'report', path: '/dashboard/reports', label: 'Report', icon: '/rar.svg' },
    { id: 'revenue-and-report', path: '/dashboard/revenue-and-report', label: 'Revenue & Report', icon: '/rar.svg' },
    { id: 'services', path: '/dashboard/services', label: 'Services', icon: '/services.svg' },
    { id: 'settings', path: '/dashboard/settings', label: 'Settings', icon: '/settings.svg' },
    { id: 'staff', path: '/dashboard/staff', label: 'Staff', icon: '/staff.svg' },
    { id: 'receptionist', path: '/dashboard/receptionist', label: 'Receptionist', icon: '/receptionist.svg' },
    { id: 'walkin', path: '/dashboard/walkin', label: 'Walk-in', icon: '/walkin.svg' },
    { id: 'client', path: '/dashboard/clients', label: 'Clients', icon: '/client.svg' },
    { id: 'inventory', path: '/dashboard/inventory', label: 'Inventory', icon: '/inventory.svg' },
    { id: 'expenses', path: '/dashboard/expenses', label: 'Expenses', icon: '/expenses.svg' },
    { id: 'offers', path: '/dashboard/offers', label: 'Offers', icon: '/offers.svg' },
    { id: 'reviews', path: '/dashboard/reviews', label: 'Reviews', icon: '/reviews.svg' },
    { id: 'attendance', path: '/dashboard/attendance', label: 'Attendance', icon: '/appointment.svg' },
];

// Default tabs for each role (used when creating new staff)
export const DEFAULT_TABS = {
    staff: ['profile', 'appointment', 'earning', 'report', 'services', 'settings'],
    receptionist: [
        'profile', 'dashboard', 'appointment', 'revenue-and-report', 'services',
        'settings', 'staff', 'walkin', 'client', 'inventory', 'expenses', 'offers'
    ],
    admin: [
        'profile', 'dashboard', 'appointment', 'revenue-and-report', 'services',
        'settings', 'staff', 'receptionist', 'walkin', 'client', 'inventory', 'expenses', 'offers', 'reviews'
    ],
    owner: null, // null means all tabs for owners
};

/**
 * Get tabs accessible to the user based on role and accessToTabs array
 * @param {string} role - User role (owner, admin, staff, receptionist)
 * @param {string[]|null} accessToTabs - Array of tab IDs user can access, null for full access
 * @returns {Array} Array of tab objects the user can access
 */
export const getAccessibleTabs = (role, accessToTabs) => {
    // Owners get all tabs
    if (role === 'owner' || accessToTabs === null) {
        return ALL_TABS;
    }

    // Filter tabs based on accessToTabs array
    if (!accessToTabs || accessToTabs.length === 0) {
        return [];
    }

    return ALL_TABS.filter(tab => accessToTabs.includes(tab.id));
};

/**
 * Check if user can access a specific path
 * @param {string} role - User role
 * @param {string[]|null} accessToTabs - Array of tab IDs user can access
 * @param {string} path - Path to check
 * @returns {boolean} Whether user can access the path
 */
export const canAccessPath = (role, accessToTabs, path) => {
    if (role === 'owner' || accessToTabs === null) {
        return true;
    }

    const tab = ALL_TABS.find(t => t.path === path);
    if (!tab) return true; // If path not in tabs, allow (might be a sub-route)

    return accessToTabs && accessToTabs.includes(tab.id);
};

/**
 * Get all tab IDs for checkbox display in staff form
 * @returns {Array} Array of {id, label} for all tabs
 */
export const getAllTabOptions = () => {
    return ALL_TABS.map(tab => ({ id: tab.id, label: tab.label }));
};
