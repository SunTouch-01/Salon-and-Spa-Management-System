import React, { useState, useEffect } from 'react';
import logo from '../assets/learnyticslogopng.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { HiMenu, HiX } from 'react-icons/hi';
import { useSalon } from '../context/SalonContext'; // Import Context
import AddSalonModal from './modals/AddSalonModal';
import PlanLimitModal from './modals/PlanLimitModal';

function Navbar() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBranchDropdownOpen, setBranchDropdownOpen] = useState(false);
  const [isLimitModalOpen, setLimitModalOpen] = useState(false);

  // Use Context instead of local fetch
  const { salons, selectedSalon, setSelectedSalon, fetchSalons, branchLimit } = useSalon();
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [isAddSalonModalOpen, setAddSalonModalOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('userId'));
  const [avatarUrl, setAvatarUrl] = useState('');
  const [userSubscription, setUserSubscription] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();


  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleBranchDropdown = () => {
    setBranchDropdownOpen(!isBranchDropdownOpen);
  };

  const selectBranch = (salon) => {
    setSelectedSalon(salon);
    setBranchDropdownOpen(false);
  };

  const fetchUserProfile = async () => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (userId && role) {
      try {
        const response = await fetch(`http://localhost:5050/auth/me?userId=${userId}&role=${role}`);
        if (response.ok) {
          const userData = await response.json();
          setAvatarUrl(userData.avatarUrl || '');
          setUserSubscription(userData.subscription || null);
        }
      } catch (err) {
        console.error("Error fetching avatar:", err);
      }
    }
  };


  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsLoggedIn(false);
    setRole(null);
    setAvatarUrl(''); // Clear avatar on logout
    setDropdownOpen(false);
    navigate('/');
  };

  // Update auth state on location change
  useEffect(() => {
    const loggedIn = !!localStorage.getItem('userId');
    setIsLoggedIn(loggedIn);
    setRole(localStorage.getItem('role'));
    setMobileMenuOpen(false);
    setDropdownOpen(false);

    if (loggedIn) {
      fetchUserProfile();
    }
  }, [location]);

  const handleAddSalon = async (salonData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5050/salons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(salonData)
      });

      if (response.ok) {
        await fetchSalons();
        setAddSalonModalOpen(false);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to add salon");
      }
    } catch (err) {
      console.error("Error adding salon:", err);
      alert("An error occurred while adding salon");
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-gray-100 shadow-sm transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">

            {/* Logo & Mobile Menu Button */}
            <div className="flex items-center">
              <button
                className="md:hidden mr-2 text-gray-600 focus:outline-none"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
              </button>
              <div className="shrink-0 flex items-center cursor-pointer" onClick={() => window.location.href = '/'}>
                <img src={logo} alt="Company Logo" className="h-10 w-auto" />
                <span className="ml-3 text-xl font-bold bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent hidden sm:block">Luxe Salon</span>
              </div>
            </div>

            {/* Desktop Menu */}
            <ul className="hidden md:flex space-x-8 items-center">
              <Link to="/" className="text-gray-600 hover:text-primary font-medium transition-colors"><li>Home</li></Link>
              <Link to="/status" className="text-gray-600 hover:text-primary font-medium transition-colors"><li>Status</li></Link>
              <Link to="/about" className="text-gray-600 hover:text-primary font-medium transition-colors"><li>About</li></Link>
              <Link to="/plans-and-pricing" className="text-gray-600 hover:text-primary font-medium transition-colors"><li>Plans</li></Link>
              <Link to="/contact" className="text-gray-600 hover:text-primary font-medium transition-colors"><li>Contact</li></Link>
              {!location.pathname.startsWith('/dashboard') && (
                <Link to="/book-appointment" className="bg-primary/10 text-primary px-4 py-2 rounded-full hover:bg-primary hover:text-white transition-all font-semibold border border-primary/20">
                  <li>Book Appointment</li>
                </Link>
              )}
            </ul>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <ul className="flex items-center space-x-4">
                {!isLoggedIn && (
                  <>
                    <Link to="/login"><li className="hidden sm:block text-gray-600 hover:text-primary font-medium transition-colors cursor-pointer">Login</li></Link>
                    <Link to="/signup"><li className="hidden sm:block bg-primary text-white px-5 py-2 rounded-full hover:bg-secondary transition-colors shadow-md hover:shadow-lg cursor-pointer font-medium">Sign Up</li></Link>
                  </>
                )}
                {/* Conditional Dashboard Link: Show if NOT logged in (maybe as a prompt?), Logic kept per original but seems redundant if Login exists. 
                  Actually user asked to remove login/signup when logged in. 
                  If logged in, we might want to show a 'Dashboard' link leading to /dashboard/appointments or similar?
                  For now, hiding it if logged in as per original logic line 100 which was !isLoggedIn.
               */}
                {isLoggedIn && <Link to="/dashboard"><li className="hidden lg:block text-gray-600 hover:text-primary font-medium transition-colors cursor-pointer">Dashboard</li></Link>}

                {/* Branch Switcher */}
                {isLoggedIn && (salons.length > 0 || role === 'owner') && (
                  <div className="relative mr-4">
                    <button
                      onClick={() => toggleBranchDropdown()}
                      className="flex items-center space-x-2 bg-primary text-white px-3 py-2 rounded-lg hover:bg-secondary transition-colors font-medium text-sm"
                    >
                      <span>🏢 {selectedSalon ? selectedSalon.name : (role === 'owner' && salons.length === 0 ? 'Add Branch' : 'Select Branch')}</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {isBranchDropdownOpen && (
                      <ul className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-100 ring-1 ring-black ring-opacity-5 z-50">
                        {salons.map((salon) => (
                          <li
                            key={salon._id}
                            className={`block px-4 py-2 text-sm cursor-pointer transition-colors ${selectedSalon?._id === salon._id
                              ? 'bg-primary text-white'
                              : 'text-gray-700 hover:bg-gray-50 hover:text-primary'
                              }`}
                            onClick={() => selectBranch(salon)}
                          >
                            🏢 {salon.name}
                          </li>
                        ))}
                        {role === 'owner' && (
                          <li
                            className={`block px-4 py-2 text-sm font-bold border-t border-gray-100 mt-1 ${
                              !userSubscription || !userSubscription.planName
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-primary hover:bg-gray-50 cursor-pointer'
                            }`}
                            onClick={() => {
                              if (!userSubscription || !userSubscription.planName) {
                                return; // Do nothing if no subscription
                              }
                              if (salons.length >= branchLimit) {
                                setLimitModalOpen(true);
                              } else {
                                setAddSalonModalOpen(true);
                              }
                              setBranchDropdownOpen(false);
                            }}
                          >
                            + Add New Branch
                            {(!userSubscription || !userSubscription.planName) && (
                              <span className="block text-xs text-red-500 font-normal mt-1">Subscribe to add branches</span>
                            )}
                          </li>
                        )}

                      </ul>
                    )}
                  </div>
                )}

                {isLoggedIn && (
                  <div className="relative ml-4">
                    <img
                      src={avatarUrl || 'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719858/Wavy_Buddies_-_Avatar_5_gdbuhf.webp'}
                      alt="Profile"
                      className="h-10 w-10 rounded-full cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all object-cover"
                      onClick={toggleDropdown}
                    />
                    {isDropdownOpen && (
                      <ul className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 border border-gray-100 ring-1 ring-black ring-opacity-5 animate-fade-in-down z-50">
                        <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"><li>My Activity</li></Link>
                        <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"><li>History</li></Link>
                        <Link to="/dashboard/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors"><li>View Profile</li></Link>
                        <li className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors cursor-pointer" onClick={handleLogout}>Logout</li>
                      </ul>
                    )}
                  </div>
                )}
              </ul>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <ul className="px-4 pt-2 pb-4 space-y-1">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"><li>Home</li></Link>
              <Link to="/status" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"><li>Status</li></Link>
              <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"><li>About</li></Link>
              <Link to="/plans-and-pricing" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"><li>Plans</li></Link>
              <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"><li>Contact</li></Link>
              {!location.pathname.startsWith('/dashboard') && (
                <Link to="/book-appointment" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-bold text-primary hover:bg-primary/10 transition-colors">
                  <li>Book Appointment</li>
                </Link>
              )}
              {!isLoggedIn && (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"><li>Login</li></Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"><li>Sign Up</li></Link>
                </>
              )}
              {isLoggedIn && <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"><li>Dashboard</li></Link>}
            </ul>
          </div>
        )}
      </nav>
      <AddSalonModal
        isOpen={isAddSalonModalOpen}
        onClose={() => setAddSalonModalOpen(false)}
        onSubmit={handleAddSalon}
      />
      <PlanLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setLimitModalOpen(false)}
        currentLimit={branchLimit}
      />
    </>
  );
}

export default Navbar;
