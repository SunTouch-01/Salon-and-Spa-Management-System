import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Scissors, Star, Calendar, Users, Sparkles, Search } from 'lucide-react';


const isSalonOpen = (openTime: string, closeTime: string, workingDays: string[]): boolean => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    const isWorkingDay = workingDays.includes(currentDay);
    const isWithinHours = currentTime >= openMinutes && currentTime <= closeMinutes;
    
    return isWorkingDay && isWithinHours;
};

const formatTime = (time: string): string => {
    const [hour, minute] = time.split(':');
    const h = parseInt(hour);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minute} ${ampm}`;
};

interface Service {
    _id: string;
    name: string;
    duration?: string;
    description?: string;
    gender: 'unisex' | 'male' | 'female' | 'both';
    priceUnisex?: number;
    priceMale?: number;
    priceFemale?: number;
    categoryId?: string;
}


interface Category {
    _id: string;
    name: string;
    salonId: string;
}

interface SalonDetailProps {
    onOpenBooking?: (salonId: string, service?: Service) => void;
}

const SalonDetail: React.FC<SalonDetailProps> = ({ onOpenBooking }) => {
    const { id } = useParams<{ id: string }>();

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [categories, setCategories] = useState<Category[]>([]);
    
    interface Salon {

        _id: string;
        name: string;
        imageUrl?: string;
        branchArea?: string;
        address?: string;
        pincode?: string;
        contactNumber?: string;
        phoneNumber?: string;
        ownerId?: { email?: string };
        description?: string;
        staff?: Staff[];
        openTime?: string;
        closeTime?: string;
        workingDays?: string[];
    }

    interface Staff {
        _id: string;
        name: string;
        profession: string;
        mobile: string;
        workingHours?: {
            day: string;
            startTime: string;
            endTime: string;
            isWorking: boolean;
        }[];
    }

    const [salon, setSalon] = React.useState<Salon | null>(null);
    const [services, setServices] = React.useState<Service[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                const base = import.meta.env.VITE_API_URL || 'http://localhost:5050';
                const res = await fetch(`${base}/salons/${id}`);
                if (!res.ok) {
                    console.error('Failed to fetch salon', res.status);
                    if (mounted) setSalon(null);
                    return;
                }
                const data = await res.json();
                if (mounted) setSalon(data);

                // fetch services for this salon
                const svcRes = await fetch(`${base}/services?salonId=${id}`);
                if (svcRes.ok) {
                    const svcData = await svcRes.json();
                    if (mounted) setServices(svcData || []);
                } else {
                    console.warn('No services or failed to fetch services', svcRes.status);
                }

                // fetch categories for this salon
                const catRes = await fetch(`${base}/categories?salonId=${id}`);
                if (catRes.ok) {
                    const catData = await catRes.json();
                    if (mounted) setCategories(catData || []);
                }
            } catch (err) {
                console.error('Error loading salon detail', err);
                if (mounted) setSalon(null);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        return () => { mounted = false; };
    }, [id]);

    // Filter services based on search query and selected category
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                (service.description && service.description.toLowerCase().includes(searchQuery.toLowerCase()));
            const matchesCategory = selectedCategory === 'all' || service.categoryId === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [services, searchQuery, selectedCategory]);


    if (loading) return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center pt-20">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <p className="text-gray-600 font-medium">Loading salon details...</p>
            </div>
        </div>
    );
    
    if (!salon) return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 pt-20">
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">😕</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Salon Not Found</h2>
                <p className="text-gray-600 mb-6">We couldn't find the salon you're looking for. It may have been removed or the link might be incorrect.</p>
                <button 
                    onClick={() => window.history.back()}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                    Go Back
                </button>
            </div>
        </div>
    );

    const isOpen = isSalonOpen(
        salon.openTime || '09:00', 
        salon.closeTime || '20:00', 
        salon.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    );

    return (
        <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-purple-50 pt-20">
            {/* Hero Section */}
            <div className="bg-linear-to-r from-purple-600 to-pink-600 text-white">
                <div className="max-w-6xl mx-auto px-6 py-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Salon Image */}
                        <div className="relative group">
                            <div className="absolute -inset-1 bg-white/30 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                            <img 
                                src={salon.imageUrl || '/placeholder.png'} 
                                alt={salon.name} 
                                className="relative w-64 h-48 object-cover rounded-2xl shadow-2xl border-4 border-white/20"
                            />
                            <div className={`absolute -bottom-3 -right-3 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                                <span className={`w-2 h-2 bg-white rounded-full ${isOpen ? 'animate-pulse' : ''}`}></span>
                                {isOpen ? 'Open Now' : 'Closed'}
                            </div>
                        </div>
                        
                        {/* Salon Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Sparkles className="w-5 h-5 text-yellow-300" />
                                <span className="text-purple-100 text-sm font-medium">Premium Salon</span>
                            </div>
                            <h1 className="text-4xl font-bold mb-3">{salon.name}</h1>
                            
                            <div className="flex flex-wrap items-center gap-4 text-purple-100 mb-4">
                                <div className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{salon.branchArea || salon.address}</span>
                                </div>
                                <span className="hidden md:inline">•</span>
                                <span>{salon.pincode}</span>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-6 mb-6">
                                <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                    <Phone className="w-4 h-4" />
                                    <span className="font-medium">{salon.contactNumber || salon.phoneNumber}</span>
                                </div>
                                {salon.ownerId?.email && (
                                    <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                                        <Mail className="w-4 h-4" />
                                        <span className="font-medium">{salon.ownerId.email}</span>
                                    </div>
                                )}
                            </div>
                            
                            {salon.description && (
                                <p className="text-purple-100 leading-relaxed max-w-2xl">{salon.description}</p>
                            )}
                            
                            <button 
                                onClick={() => onOpenBooking && id && onOpenBooking(id)}
                                className="mt-6 bg-white text-purple-600 px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center gap-2"
                            >
                                <Calendar className="w-5 h-5" />
                                Book Appointment
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-6 py-12">
                {/* Working Hours Card */}
                <div className="mb-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-linear-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                                <Clock className="w-5 h-5 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Working Hours</h3>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Clock className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Opening Hours</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {formatTime(salon.openTime || '09:00')} - {formatTime(salon.closeTime || '20:00')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Working Days</p>
                                    <p className="text-lg font-bold text-gray-800">
                                        {salon.workingDays?.slice(0, 3).map(d => d.slice(0, 3)).join(', ')}
                                        {salon.workingDays && salon.workingDays.length > 3 && '...'}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {salon.workingDays?.join(', ')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Staff Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="bg-linear-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                                    <Users className="w-5 h-5 text-purple-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Our Team</h3>
                                <span className="ml-auto bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1 rounded-full">
                                    {salon.staff?.length || 0} members
                                </span>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            {salon.staff && salon.staff.length ? (
                                <ul className="space-y-4">
                                    {salon.staff.map((st: Staff) => (
                                        <li key={st._id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                            <div className="w-12 h-12 bg-linear-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md group-hover:scale-110 transition-transform">
                                                {st.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800">{st.name}</p>
                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                    <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-xs font-medium">
                                                        {st.profession}
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Phone className="w-3 h-3" />
                                                        {st.mobile}
                                                    </span>
                                                </div>
                                                {/* Staff Working Hours */}
                                                {st.workingHours && st.workingHours.some(wh => wh.isWorking) && (
                                                    <div className="mt-2 text-xs text-gray-400">
                                                        <Clock className="w-3 h-3 inline mr-1" />
                                                        {st.workingHours
                                                            .filter(wh => wh.isWorking)
                                                            .slice(0, 3)
                                                            .map(wh => `${wh.day.slice(0, 3)}: ${formatTime(wh.startTime)}-${formatTime(wh.endTime)}`)
                                                            .join(', ')}
                                                        {st.workingHours.filter(wh => wh.isWorking).length > 3 && '...'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="w-2 h-2 bg-green-500 rounded-full" title="Available"></div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Users className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">No staff information available.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Services Card */}
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
                        <div className="bg-linear-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <Scissors className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-800">Services</h3>
                                <span className="ml-auto bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1 rounded-full">
                                    {filteredServices?.length || 0} available
                                </span>
                            </div>
                        </div>
                        
                        {/* Search and Filter Section */}
                        <div className="p-4 border-b border-gray-100 space-y-3">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search services..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-sm"
                                />
                            </div>
                            
                            {/* Category Filters */}
                            {categories.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setSelectedCategory('all')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                                            selectedCategory === 'all'
                                                ? 'bg-blue-600 text-white shadow-blue-200'
                                                : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                        }`}
                                    >
                                        All Services
                                    </button>
                                    {categories.map((cat) => (
                                        <button
                                            key={cat._id}
                                            onClick={() => setSelectedCategory(cat._id)}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                                                selectedCategory === cat._id
                                                    ? 'bg-blue-600 text-white shadow-blue-200'
                                                    : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            )}

                        </div>
                        
                        <div className="p-6">
                            {filteredServices && filteredServices.length ? (
                                <ul className="space-y-3">
                                    {filteredServices.map(svc => (

                                        <li key={svc._id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 transition-colors group border border-transparent hover:border-blue-200">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                                    <Sparkles className="w-5 h-5 text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">{svc.name}</p>
                                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                                        <Clock className="w-3 h-3" />
                                                        <span>{svc.duration || '30 mins'}</span>
                                                        {svc.description && (
                                                            <>
                                                                <span>•</span>
                                                                <span className="truncate max-w-37.5">{svc.description}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-800">
                                                    {svc.gender === 'unisex' && svc.priceUnisex && `₹${svc.priceUnisex}`}
                                                    {svc.gender === 'male' && svc.priceMale && `₹${svc.priceMale}`}
                                                    {svc.gender === 'female' && svc.priceFemale && `₹${svc.priceFemale}`}
                                                    {svc.gender === 'both' && (
                                                        <div className="text-sm">
                                                            {svc.priceMale && <span className="text-blue-600">M: ₹{svc.priceMale}</span>}
                                                            {svc.priceMale && svc.priceFemale && <span className="mx-1">|</span>}
                                                            {svc.priceFemale && <span className="text-pink-600">F: ₹{svc.priceFemale}</span>}
                                                        </div>
                                                    )}
                                                    {!svc.priceUnisex && !svc.priceMale && !svc.priceFemale && '—'}
                                                </div>
                                                <button 
                                                    onClick={() => onOpenBooking && id && onOpenBooking(id, svc)}
                                                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded-full hover:bg-blue-700 transition-colors mt-1"
                                                >
                                                    Book
                                                </button>

                                            </div>

                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Scissors className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="text-gray-500">
                                        {searchQuery || selectedCategory !== 'all' 
                                            ? 'No services match your search criteria.' 
                                            : 'No services listed yet.'}
                                    </p>
                                    {(searchQuery || selectedCategory !== 'all') && (
                                        <button
                                            onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                                            className="mt-3 text-blue-600 text-sm font-medium hover:underline"
                                        >
                                            Clear filters
                                        </button>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
                
                {/* Additional Info Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Star className="w-6 h-6 text-yellow-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">4.8 Rating</h4>
                        <p className="text-sm text-gray-500">Based on 120+ reviews</p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Clock className="w-6 h-6 text-green-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">{isOpen ? 'Open Now' : 'Closed'}</h4>
                        <p className="text-sm text-gray-500">
                            {formatTime(salon.openTime || '09:00')} - {formatTime(salon.closeTime || '20:00')}
                        </p>
                    </div>
                    
                    <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100 text-center hover:shadow-lg transition-shadow">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Calendar className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="font-bold text-gray-800 mb-1">Easy Booking</h4>
                        <p className="text-sm text-gray-500">Instant confirmation</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SalonDetail;
