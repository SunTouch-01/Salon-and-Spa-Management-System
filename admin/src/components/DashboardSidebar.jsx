import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useSalon } from '../context/SalonContext';
import { getAccessibleTabs } from '../config/roleConfig';

function DashboardSidebar() {
  const [role, setRole] = useState('staff'); // Default to staff for safety
  const [accessibleTabs, setAccessibleTabs] = useState([]);
  const { salons, selectedSalon, setSelectedSalon } = useSalon();

  useEffect(() => {
    const storedRole = localStorage.getItem('role');
    const storedAccessToTabs = localStorage.getItem('accessToTabs');

    if (storedRole) {
      setRole(storedRole);
    }

    // Parse accessToTabs and get accessible tabs
    let accessToTabs = null;
    try {
      accessToTabs = storedAccessToTabs ? JSON.parse(storedAccessToTabs) : null;
    } catch (e) {
      console.error('Error parsing accessToTabs:', e);
    }

    const tabs = getAccessibleTabs(storedRole || 'staff', accessToTabs);
    setAccessibleTabs(tabs);
  }, []);

  const linkClasses = ({ isActive }) =>
    `flex items-center px-4 py-3 my-1 rounded-lg font-medium transition-all duration-300 ${isActive
      ? 'bg-primary text-white shadow-md'
      : 'text-gray-700 hover:bg-white hover:shadow-sm'
    }`;

  // Get icon for tab, fallback to a default if icon doesn't exist
  const getIcon = (tab) => {
    // Try to use the icon from tab config, fallback to a generic icon
    const iconPath = tab.icon || '/dashboard.svg';
    return <img src={iconPath} alt={tab.label} className="w-5 h-5 mr-3" />;
  };

  return (
    <>
      {/* Sidebar Container - Hidden on Mobile, Visible on Desktop */}
      <div
        className="hidden md:flex w-64 h-screen bg-bg-light border-r border-gray-200 p-5 flex-col fixed left-0 top-0 z-30 overflow-y-auto scrollbar-hide"
      >
        <div className="flex flex-col mb-6 pl-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {role === 'owner' ? 'Admin Panel' : role.charAt(0).toUpperCase() + role.slice(1) + ' Panel'}
            </h3>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto scrollbar-hide">
          {accessibleTabs
            .filter(tab => tab.id !== 'settings') // Settings goes at bottom
            .map(tab => (
              <NavLink
                key={tab.id}
                to={tab.path}
                end={tab.end}
                className={linkClasses}
              >
                {getIcon(tab)}
                {tab.label}
              </NavLink>
            ))}
        </nav>

        {/* Settings always at bottom if accessible */}
        {accessibleTabs.some(tab => tab.id === 'settings') && (
          <NavLink to="/dashboard/settings" className={linkClasses}>
            <img src='/settings.svg' alt="Settings" className="w-5 h-5 mr-3" />
            Settings
          </NavLink>
        )}
      </div>
    </>
  );
}

export default DashboardSidebar;