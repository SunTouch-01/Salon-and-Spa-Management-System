import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
    HiHome,
    HiCalendar,
    HiScissors,
    HiUser,
    HiMenu,
    HiX,
    HiCurrencyDollar,
    HiClipboardList,
    HiCog,
    HiUserGroup,
    HiUsers,
    HiShoppingCart,
    HiTag,
    HiStar,
    HiCash,
    HiCollection
} from 'react-icons/hi';
import { getAccessibleTabs } from '../config/roleConfig';

// Icon mapping for tabs
const TAB_ICONS = {
    'dashboard': HiHome,
    'profile': HiUser,
    'appointment': HiCalendar,
    'services': HiScissors,
    'earning': HiCurrencyDollar,
    'report': HiClipboardList,
    'revenue-and-report': HiClipboardList,
    'settings': HiCog,
    'staff': HiUserGroup,
    'receptionist': HiUsers,
    'walkin': HiUsers,
    'client': HiUsers,
    'inventory': HiCollection,
    'expenses': HiCash,
    'offers': HiTag,
    'reviews': HiStar,
};

const BottomNav = () => {
    const [isMoreOpen, setMoreOpen] = useState(false);
    const [role, setRole] = useState('staff');
    const [accessibleTabs, setAccessibleTabs] = useState([]);

    useEffect(() => {
        const storedRole = localStorage.getItem('role');
        const storedAccessToTabs = localStorage.getItem('accessToTabs');

        if (storedRole) {
            setRole(storedRole);
        }

        let accessToTabs = null;
        try {
            accessToTabs = storedAccessToTabs ? JSON.parse(storedAccessToTabs) : null;
        } catch (e) {
            console.error('Error parsing accessToTabs:', e);
        }

        const tabs = getAccessibleTabs(storedRole || 'staff', accessToTabs);
        setAccessibleTabs(tabs);
    }, []);

    // Primary nav items (first 4 tabs shown in bottom bar)
    const primaryTabs = accessibleTabs.slice(0, 4);
    // More items (remaining tabs shown in drawer)
    const moreTabs = accessibleTabs.slice(4);

    const getIcon = (tabId) => {
        const IconComponent = TAB_ICONS[tabId] || HiHome;
        return <IconComponent size={24} />;
    };

    return (
        <>
            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:hidden z-50">
                <div className="flex justify-around items-center h-16">
                    {primaryTabs.map((tab) => (
                        <NavLink
                            key={tab.id}
                            to={tab.path}
                            end={tab.end}
                            className={({ isActive }) =>
                                `flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`
                            }
                            onClick={() => setMoreOpen(false)}
                        >
                            {getIcon(tab.id)}
                            <span className="text-[10px] font-medium">{tab.label.split(' ')[0]}</span>
                        </NavLink>
                    ))}

                    {/* More Button - only show if there are more tabs */}
                    {moreTabs.length > 0 && (
                        <button
                            onClick={() => setMoreOpen(!isMoreOpen)}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isMoreOpen ? 'text-primary' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            {isMoreOpen ? <HiX size={24} /> : <HiMenu size={24} />}
                            <span className="text-[10px] font-medium">More</span>
                        </button>
                    )}
                </div>
            </div>

            {/* More Menu Drawer */}
            {isMoreOpen && moreTabs.length > 0 && (
                <div className="fixed bottom-16 left-0 right-0 bg-white border-t border-gray-100 shadow-xl rounded-t-2xl md:hidden z-30 p-4 animate-slide-up">
                    <div className="grid grid-cols-2 gap-3">
                        {moreTabs.map((tab) => (
                            <NavLink
                                key={tab.id}
                                to={tab.path}
                                className={({ isActive }) =>
                                    `p-3 rounded-xl text-center text-sm font-medium transition-colors ${isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                                onClick={() => setMoreOpen(false)}
                            >
                                {tab.label}
                            </NavLink>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default BottomNav;
