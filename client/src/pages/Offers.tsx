import React, { useState, useEffect } from "react";
import { Gift, Zap, Copy, Check, Info } from "lucide-react";

interface Offer {
    _id: string;
    name: string;
    code: string;
    discount: number;
    discountType: string;
    validTo: string;
    description?: string;
    imageUrl?: string;
    salonId: { _id: string; name: string };
}

const Offers: React.FC<{ onOpenBooking: (salonId?: string, offer?: Offer) => void }> = ({ onOpenBooking }) => {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [copied, setCopied] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOffers = async () => {
            try {
                const res = await fetch("http://localhost:5050/offers");
                const data = await res.json();
                if (Array.isArray(data)) setOffers(data);
            } catch (err) {
                console.error("Error fetching offers:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOffers();
    }, []);

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopied(code);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <div className="pt-32 pb-20 bg-bg-light min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 space-y-4">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm">Exclusive Deals</span>
                    <h1 className="text-5xl font-bold text-gray-900 leading-tight">Curated <span className="text-primary italic">Offers</span> for You.</h1>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {offers.map((offer) => (
                            <div key={offer._id} className="relative group bg-white rounded-[3rem] p-8 shadow-2xl shadow-gray-200/50 flex flex-col overflow-hidden border border-gray-100">
                                {/* Background Decor */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent-peach/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />

                                <div className="relative flex justify-between items-start mb-8">
                                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                        <Gift size={32} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Expires</p>
                                        <p className="text-sm font-bold text-gray-900">{new Date(offer.validTo).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div className="relative space-y-4 flex-1">
                                    <span className="text-primary font-bold text-xs uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">
                                        {offer.salonId?.name || "Global Offer"}
                                    </span>
                                    <h3 className="text-3xl font-black text-gray-900">{offer.name}</h3>
                                    <p className="text-gray-500 leading-relaxed font-medium line-clamp-2 italic">
                                        {offer.description || "Enjoy premium savings on your next visit. Valid on select services across all participating branches."}
                                    </p>
                                </div>

                                <div className="relative mt-8 space-y-5">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-5xl font-black text-primary">
                                            {offer.discountType === 'Percentage' ? `${offer.discount}%` : `₹${offer.discount}`}
                                        </span>
                                        <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">OFF</span>
                                    </div>

                                    <button
                                        onClick={() => copyToClipboard(offer.code)}
                                        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 border-dashed transition-all ${copied === offer.code ? 'border-green-500 bg-green-50 text-green-700' : 'border-primary/30 bg-primary/5 text-primary hover:border-primary'
                                            }`}
                                    >
                                        <span className="font-mono font-bold text-lg">{offer.code}</span>
                                        {copied === offer.code ? <Check size={20} /> : <Copy size={20} />}
                                    </button>

                                    <button
                                        onClick={() => onOpenBooking(offer.salonId?._id, offer)}
                                        className="w-full py-3 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-primary transition-all"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        ))}
                        {offers.length === 0 && <p className="text-center text-gray-400 py-20 col-span-full">No active offers at the moment...</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Offers;
