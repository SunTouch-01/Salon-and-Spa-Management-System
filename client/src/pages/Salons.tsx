import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Landmark, Search, MapPin, Phone, Star, ArrowRight } from "lucide-react";

interface Salon {
    _id: string;
    name: string;
    branchArea: string;
    address: string;
    contactNumber: string;
    imageUrl?: string;
    type?: string;
}

const Salons: React.FC<{ onOpenBooking: (salonId: string) => void; type?: string }> = ({ onOpenBooking, type }) => {

    const [salons, setSalons] = useState<Salon[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSalons = async () => {
            try {
                const res = await fetch("http://localhost:5050/salons");
                const data = await res.json();
                if (Array.isArray(data)) setSalons(data);
            } catch (err) {
                console.error("Error fetching salons:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSalons();
    }, []);

    const filteredSalons = salons
        .filter(s => !type || s.type?.toLowerCase() === type.toLowerCase())
        .filter(s =>
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.branchArea.toLowerCase().includes(search.toLowerCase())
        );


    return (
        <div className="pt-32 pb-20 bg-bg-light min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
                    <div className="space-y-4">
                        <span className="text-primary font-bold tracking-widest uppercase text-sm">Experience Everywhere</span>
                        <h1 className="text-5xl font-bold text-gray-900 leading-tight">Our <span className="text-primary italic">Luxury</span> {type ? type + 's' : 'Destinations'}.</h1>

                    </div>
                    <div className="relative w-full lg:w-96 group">
                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                            <Search size={22} />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by salon name or area..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 bg-white text-gray-900 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-medium"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-10">
                        {filteredSalons.map((salon) => (
                            <div key={salon._id} className="group bg-white rounded-[3rem] overflow-hidden shadow-2xl shadow-gray-200/50 flex flex-col sm:flex-row transition-transform hover:-translate-y-1 duration-500">
                                <div className="sm:w-1/2 h-72 sm:h-auto overflow-hidden">
                                    <img src={salon.imageUrl || "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&q=80&w=800"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                                </div>
                                <div className="sm:w-1/2 p-10 flex flex-col">
                                    <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-4">
                                        <Star size={14} fill="currentColor" />
                                        Top Rated Branch
                                    </div>
                                    <h3 className="text-3xl font-bold text-gray-900 mb-6">{salon.name}</h3>

                                    <div className="space-y-4 mb-10 flex-1">
                                        <div className="flex items-start gap-3 text-gray-500 text-sm font-medium">
                                            <MapPin size={18} className="text-primary mt-1 shrink-0" />
                                            {salon.address}, {salon.branchArea}
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-500 text-sm font-medium">
                                            <Phone size={18} className="text-primary shrink-0" />
                                            {salon.contactNumber}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate(`/salons/${salon._id}`)}
                                            className="flex-1 py-4 bg-gray-950 text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary transition-all flex items-center justify-center gap-2 group-hover:gap-4"
                                        >
                                            Explore
                                            <ArrowRight size={18} />
                                        </button>
                                        <button
                                            onClick={() => onOpenBooking(salon._id)}
                                            className="px-4 py-4 bg-primary text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-primary/90 transition-all flex items-center justify-center"
                                        >
                                            Book
                                        </button>
                                    </div>

                                </div>
                            </div>
                        ))}
                        {filteredSalons.length === 0 && <p className="text-center text-gray-400 py-20 col-span-full">No salons matching your search...</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Salons;
