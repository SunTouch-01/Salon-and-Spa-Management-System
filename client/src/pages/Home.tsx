import React, { useState, useEffect } from "react";
import { Scissors, Star, ShieldCheck, ArrowRight, Heart, Users, MapPin, Mail, Instagram, Facebook, Twitter } from "lucide-react";

interface Service {
    _id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    salonId: { name: string };
}

const Home: React.FC<{ onOpenBooking: () => void }> = ({ onOpenBooking }) => {
    const [featuredServices, setFeaturedServices] = useState<Service[]>([]);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const res = await fetch("http://localhost:5050/services?limit=4");
                const data = await res.json();
                if (Array.isArray(data)) setFeaturedServices(data.slice(0, 4));
            } catch (err) {
                console.error("Error fetching featured services:", err);
            }
        };
        fetchFeatured();
    }, []);

    const steps = [
        { id: "01", title: "Discover & Select", desc: "Browse our curated list of luxury salons and premium spa services." },
        { id: "02", title: "Book Instant", desc: "Choose your favorite specialist and time slot with just a few clicks." },
        { id: "03", title: "Relax & Glow", desc: "Arrive at the salon and enjoy a world-class rejuvenation experience." },
    ];

    const testimonials = [
        { name: "Mario Luigi", role: "Germany", quote: "Light texture, absorbs quickly.", avatar: "https://i.pravatar.cc/150?u=mario" },
        { name: "John Wick", role: "USA", quote: "Best skincare product so far.", avatar: "https://i.pravatar.cc/150?u=john" },
        { name: "Tony Stark", role: "UK", quote: "Needs extra hydration for dry skin.", avatar: "https://i.pravatar.cc/150?u=tony" },
        { name: "Bruce Wayne", role: "USA", quote: "Premium feel and great results.", avatar: "https://i.pravatar.cc/150?u=bruce" },
        { name: "Peter Parker", role: "USA", quote: "Non-sticky and light.", avatar: "https://i.pravatar.cc/150?u=peter" },
        { name: "Clark Kent", role: "Canada", quote: "Highly recommend for daily use.", avatar: "https://i.pravatar.cc/150?u=clark" },
    ];

    // Duplicate testimonials for seamless infinite scroll
    const allTestimonials = [...testimonials, ...testimonials];

    return (
        <div className="pt-20">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=2000"
                        alt="Luxury Salon"
                        className="w-full h-full object-cover animate-[ken-burns_20s_infinite_alternate]"
                    />
                    <div className="absolute inset-0 bg-black/50" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-white text-center">
                    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-1000">
                        <span className="inline-block px-6 py-2 bg-white/10 backdrop-blur-md rounded-full text-white font-bold text-sm tracking-[0.2em] uppercase border border-white/20">
                            Redefining Luxury
                        </span>
                        <h1 className="text-6xl md:text-8xl font-bold leading-tight tracking-tight">
                            Renew, Relax, <br />
                            <span className="text-primary italic">Rejuvenate.</span>
                        </h1>
                        <p className="text-xl text-gray-200 font-medium max-w-2xl mx-auto leading-relaxed">
                            Unlock a world of premium salon and spa experiences tailored specifically to your needs.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center pt-8">
                            <button
                                onClick={onOpenBooking}
                                className="group relative px-10 py-5 bg-primary text-white rounded-full font-bold text-lg shadow-2xl shadow-primary/40 hover:bg-secondary transition-all active:scale-95 flex items-center justify-center gap-3"
                            >
                                Book Your Appointment Now
                                <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-gray-300 text-sm font-medium pt-4">
                            <ShieldCheck size={18} className="text-primary" />
                            Trusted by 50,000+ happy clients citywide
                        </div>
                    </div>
                </div>
            </section>

            {/* Services Grid */}
            <section className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 space-y-4">
                        <span className="text-primary font-bold tracking-widest uppercase text-sm">Our Signature Services</span>
                        <h2 className="text-5xl font-bold text-gray-900">Experience Excellence</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredServices.map((service) => (
                            <div
                                key={service._id}
                                className="group bg-bg-light rounded-[2.5rem] p-4 transition-all hover:bg-white hover:shadow-2xl hover:shadow-primary/10 border border-transparent hover:border-gray-100 overflow-hidden"
                            >
                                <div className="relative h-64 w-full rounded-[2rem] overflow-hidden mb-6">
                                    <img
                                        src={service.imageUrl || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800"}
                                        alt={service.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full p-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Heart size={20} />
                                    </div>
                                </div>
                                <div className="px-4 pb-4">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">{service.name}</h3>
                                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4">
                                        {service.description || "Indulge in our premium care designed for your ultimate satisfaction."}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                                            {service.salonId?.name || "Premium Spa"}
                                        </span>
                                        <button onClick={onOpenBooking} className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors">
                                            <ArrowRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-32 bg-bg-light rounded-[4rem] mx-4 sm:mx-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <div className="space-y-4">
                                <span className="text-primary font-bold tracking-widest uppercase text-sm">How it works</span>
                                <h2 className="text-5xl font-bold text-gray-900 leading-tight">Your Path to <span className="text-primary italic">Radiance</span> in 3 Simple Steps.</h2>
                            </div>
                            <div className="space-y-10">
                                {steps.map((step) => (
                                    <div key={step.id} className="flex gap-8 group">
                                        <div className="text-5xl font-black text-gray-200 group-hover:text-primary/20 transition-colors duration-500">{step.id}</div>
                                        <div>
                                            <h4 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h4>
                                            <p className="text-gray-500 max-w-sm font-medium leading-relaxed">{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <img src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1000" alt="Spa Experience" className="rounded-[3rem] shadow-2xl" />
                            <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-xl flex items-center gap-4 animate-bounce-slow max-w-xs">
                                <div className="w-16 h-16 bg-accent-peach rounded-2xl flex items-center justify-center font-bold text-3xl text-primary shrink-0">0%</div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 uppercase tracking-widest">Late Fee</p>
                                    <p className="text-gray-500 text-xs">Flexible cancellations for your peace of mind.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials - Auto Scrolling */}
            <section className="py-32 overflow-hidden bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20 space-y-4">
                        <span className="text-primary font-bold tracking-widest uppercase text-sm">Guest Testimonials</span>
                        <h2 className="text-5xl font-bold text-gray-900">Voices of Satisfaction</h2>
                    </div>

                    <div className="overflow-hidden">
                        <div className="flex animate-scroll-left gap-8">
                            {allTestimonials.map((t, i) => (
                                <div key={i} className="min-w-[380px] flex-shrink-0 bg-white border border-gray-100 p-10 rounded-[3rem] shadow-xl shadow-gray-200/50">
                                    <div className="flex gap-1 text-primary mb-6">
                                        {[...Array(5)].map((_, i) => <Star key={i} size={18} fill="currentColor" />)}
                                    </div>
                                    <p className="text-xl text-gray-700 font-medium mb-10 leading-relaxed italic">"{t.quote}"</p>
                                    <div className="flex items-center gap-4 border-t border-gray-50 pt-8 mt-auto">
                                        <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover" />
                                        <div>
                                            <p className="font-bold text-gray-900">{t.name}</p>
                                            <span className="bg-primary/5 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{t.role}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* City/Location CTA Strip */}
            <section className="mx-4 sm:mx-8 lg:mx-20 my-20 bg-primary rounded-[3rem] p-12 lg:p-20 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-20 opacity-10 blur-3xl rounded-full bg-white animate-pulse" />
                <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                    <div className="space-y-6 text-center lg:text-left">
                        <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">Find the Perfect <br /> Salon in Your City.</h2>
                        <div className="flex items-center gap-4 text-white/80 font-medium justify-center lg:justify-start">
                            <div className="flex -space-x-3">
                                {[1, 2, 3].map(i => <img key={i} src={`https://i.pravatar.cc/150?u=${i}`} className="w-10 h-10 rounded-full border-2 border-primary" />)}
                            </div>
                            Join 50,000+ active locations
                        </div>
                    </div>
                    <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-3 rounded-3xl flex items-center border border-white/20">
                        <div className="pl-4 text-white">
                            <Mail size={24} />
                        </div>
                        <input type="email" placeholder="Enter your email" className="bg-transparent border-none outline-none flex-1 px-4 text-white placeholder:text-white/50 font-medium" />
                        <button className="bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:bg-bg-light transition-all">Get Updates</button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-950 pt-32 pb-12 rounded-t-[4rem] text-center md:text-left">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 border-b border-gray-800 pb-20">
                        <div className="space-y-8">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                                    <Scissors size={24} />
                                </div>
                                <span className="text-2xl font-bold text-white tracking-widest">GLOW<span className="text-primary italic">BIZ</span></span>
                            </div>
                            <p className="text-gray-500 leading-relaxed font-medium">Elevating your grooming experience through curated luxury and expert care. Your beauty journey starts here.</p>
                            <div className="flex gap-4 justify-center md:justify-start">
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                                    <Instagram size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                                    <Facebook size={18} />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-colors">
                                    <Twitter size={18} />
                                </a>
                            </div>
                        </div>
                        <div>
                            <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-sm">Explore</h5>
                            <ul className="space-y-4 text-gray-500 font-medium">
                                {['Services', 'Salons', 'Offers', 'About', 'Contact'].map(l => (
                                    <li key={l}>
                                        <a href={`/${l.toLowerCase()}`} className="hover:text-primary cursor-pointer transition-colors block py-1">
                                            {l}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-sm">Connect</h5>
                            <ul className="space-y-4 text-gray-500 font-medium">
                                <li className="flex items-center gap-3 justify-center md:justify-start"><MapPin size={18} className="text-primary shrink-0" /> 123 Luxury Blvd, Metropolis</li>
                                <li className="flex items-center gap-3 justify-center md:justify-start"><Users size={18} className="text-primary shrink-0" /> +91 98765 43210</li>
                                <li className="flex items-center gap-3 justify-center md:justify-start"><Mail size={18} className="text-primary shrink-0" /> hello@glowbiz.luxury</li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="text-white font-bold mb-8 uppercase tracking-widest text-sm">Join Our Newsletter</h5>
                            <div className="space-y-6">
                                <div className="bg-gray-900/50 p-2 rounded-2xl flex border border-gray-800">
                                    <input type="text" placeholder="Your email" className="bg-transparent border-none outline-none flex-1 px-4 text-white text-sm" />
                                    <button className="bg-primary p-3 rounded-xl text-white hover:scale-105 transition-all"><ArrowRight size={20} /></button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-12 text-center text-gray-600 text-sm font-bold uppercase tracking-widest">
                        &copy; 2026 GLOWBIZ. All Rights Reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
