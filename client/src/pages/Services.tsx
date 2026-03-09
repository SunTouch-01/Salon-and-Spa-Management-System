import React, { useState, useEffect } from "react";
import { Scissors, Search, Clock, Check } from "lucide-react";

interface Service {
    _id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    duration: number;
    priceUnisex?: number;
    priceMale?: number;
    priceFemale?: number;
    price?: number;
    gender: string;
    salonId: { _id: string; name: string };
}

const Services: React.FC<{ onOpenBooking: (service: Service) => void }> = ({ onOpenBooking }) => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const res = await fetch("http://localhost:5050/services");
                const data = await res.json();
                if (Array.isArray(data)) setServices(data);
            } catch (err) {
                console.error("Error fetching services:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchServices();
    }, []);

    return (
        <div className="pt-32 pb-20 bg-bg-light min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm">Our Full Menu</span>
                    <h1 className="text-5xl font-bold text-gray-900 leading-tight">Bespoke Beauty <span className="text-primary italic">&</span> Grooming.</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {services.map((service) => (
                            <div key={service._id} className="group bg-white rounded-[2.5rem] p-6 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all border border-gray-100 flex flex-col">
                                <div className="relative h-48 rounded-[1.5rem] overflow-hidden mb-6">
                                    <img src={service.imageUrl || "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                                        {service.salonId?.name || "Premium Care"}
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">{service.name}</h3>
                                    <p className="text-primary text-sm font-semibold mb-3 tracking-wide">
                                        at {service.salonId?.name || "Premium Spa"}
                                    </p>
                                    <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 italic">"{service.description || "Indulge in a curated experience designed to reveal your inner radiance and confidence."}"</p>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-3 text-gray-600 text-sm font-medium">
                                            <Clock size={16} className="text-primary" />
                                            {service.duration} Minutes Session
                                        </div>
                                        <div className="flex items-center gap-3 text-gray-600 text-sm font-medium">
                                            <Check size={16} className="text-primary" />
                                            Premium Products Only
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                                    <div className="text-2xl font-black text-primary">
                                        ₹{service.price || service.priceUnisex || service.priceMale || service.priceFemale}
                                    </div>
                                    <button onClick={() => onOpenBooking(service)} className="px-6 py-3 bg-gray-950 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-primary transition-all">Book Service</button>
                                </div>
                            </div>
                        ))}
                        {services.length === 0 && <p className="text-center text-gray-400 py-20 col-span-full">No services found...</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Services;
