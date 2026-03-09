import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Scissors, Gift, Search, MapPin, Calendar, Info, Phone, User as UserIcon, LogOut } from 'lucide-react';
import CustomerAuthModal from './CustomerAuthModal';

const Navbar: React.FC<{ onOpenBooking: () => void }> = ({ onOpenBooking }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);
    const [authMode, setAuthMode] = React.useState<'login' | 'signup'>('login');
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = React.useState(false);
    const [user, setUser] = React.useState<any>(null);
    const location = useLocation();

    React.useEffect(() => {
        const storedUser = localStorage.getItem('customerData');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        setUser(null);
        setIsProfileDropdownOpen(false);
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Services', path: '/services', icon: Scissors },
        { name: 'Salon', path: '/salon', icon: MapPin },
        { name: 'Spa', path: '/spa', icon: MapPin },
        { name: 'Offers', path: '/offers', icon: Gift },
        { name: 'About', path: '/about', icon: Info },
        { name: 'Contact', path: '/contact', icon: Phone },
    ];

    const isActive = (path: string) => location.pathname === path;

    

    return (
        <>
            <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-110 group-hover:rotate-3">
                                <Scissors size={20} />
                            </div>
                            <span className="text-2xl font-bold text-gray-900 tracking-tight">Glow<span className="text-primary italic">Biz</span></span>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    className={`text-sm font-medium transition-colors hover:text-primary relative group py-2 ${isActive(link.path) ? 'text-primary font-bold' : 'text-gray-600'
                                        }`}
                                >
                                    {link.name}
                                    <span className={`absolute bottom-0 left-0 w-full h-0.5 bg-primary transform origin-left transition-transform duration-300 ${isActive(link.path) ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                                </Link>
                            ))}

                            <button
                                onClick={onOpenBooking}
                                className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm tracking-wide hover:bg-primary transition-all shadow-xl hover:shadow-primary/20 active:scale-95"
                            >
                                <Calendar size={16} />
                                Book Now
                            </button>

                            {/* Auth / Profile Area */}
                            {!user ? (
                                <div className="flex items-center gap-4 border-l border-gray-200 pl-6 ml-2">
                                    <button
                                        onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); }}
                                        className="text-sm font-bold text-gray-700 hover:text-primary transition-colors"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => { setAuthMode('signup'); setIsAuthModalOpen(true); }}
                                        className="text-sm font-bold bg-primary/10 text-primary px-5 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            ) : (
                                <div className="relative border-l border-gray-200 pl-6 ml-2">
                                    <button
                                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                                        className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all"
                                    >
                                        <UserIcon size={20} />
                                    </button>

                                    {isProfileDropdownOpen && (
                                        <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-50 mb-2">
                                                <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                                            </div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden">
                            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-900 p-2">
                                {isOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 absolute w-full h-screen">
                        <div className="px-4 pt-4 pb-20 space-y-2 h-full flex flex-col">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-lg font-medium transition-colors ${isActive(link.path) ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {link.icon && <link.icon size={20} />}
                                    {link.name}
                                </Link>
                            ))}
                            <button
                                onClick={() => { onOpenBooking(); setIsOpen(false); }}
                                className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-white px-6 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-primary/30"
                            >
                                <Calendar size={20} />
                                Book Appointment
                            </button>

                            {/* Mobile Auth/Profile Area */}
                            {!user ? (
                                <div className="mt-8 flex flex-col gap-3">
                                    <button
                                        onClick={() => { setAuthMode('login'); setIsAuthModalOpen(true); setIsOpen(false); }}
                                        className="w-full py-4 text-center font-bold text-gray-600 bg-gray-50 rounded-xl"
                                    >
                                        Log In
                                    </button>
                                    <button
                                        onClick={() => { setAuthMode('signup'); setIsAuthModalOpen(true); setIsOpen(false); }}
                                        className="w-full py-4 text-center font-bold text-primary bg-primary/10 rounded-xl"
                                    >
                                        Sign Up
                                    </button>
                                </div>
                            ) : (
                                <div className="mt-8">
                                    <button
                                        onClick={() => { handleLogout(); setIsOpen(false); }}
                                        className="w-full py-4 text-center font-bold text-red-600 bg-red-50 rounded-xl flex items-center justify-center gap-2"
                                    >
                                        <LogOut size={20} />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </nav>

            <CustomerAuthModal
                isOpen={isAuthModalOpen}
                initialMode={authMode}
                onClose={() => setIsAuthModalOpen(false)}
                onSuccess={(userData) => {
                    setUser(userData);
                    setIsAuthModalOpen(false);
                }}
            />
        </>
    );
};

export default Navbar;
