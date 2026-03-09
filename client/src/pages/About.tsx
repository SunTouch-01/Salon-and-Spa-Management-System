import React from "react";
import { Users, Heart, Star, Sparkles, Award, Coffee } from "lucide-react";

const About: React.FC = () => {
    return (
        <div className="pt-20 pb-20 bg-white min-h-screen">
            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden mb-20 bg-gray-900 rounded-b-[4rem]">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80&w=2000"
                        alt="About GlowBiz"
                        className="w-full h-full object-cover opacity-40 animate-[ken-burns_30s_infinite_alternate]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
                </div>
                <div className="relative z-10 text-center max-w-4xl px-4 animate-in slide-in-from-bottom duration-1000">
                    <span className="inline-block px-4 py-1.5 bg-primary/20 backdrop-blur-md rounded-full text-primary font-bold text-sm tracking-widest uppercase mb-6 border border-primary/30">
                        Our Story
                    </span>
                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                        Where Luxury Meets <span className="text-primary italic">Well-being.</span>
                    </h1>
                    <p className="text-xl text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
                        GlowBiz was founded on a simple belief: that self-care is not a luxury, but a necessity. We curate the finest salon and spa experiences to help you reconnect with your best self.
                    </p>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
                {/* Mission & Vision */}
                <section className="grid lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-8">
                        <h2 className="text-4xl font-bold text-gray-900">Our Mission</h2>
                        <p className="text-gray-500 text-lg leading-relaxed">
                            To empower individuals to look and feel their absolute best by providing accessible, high-quality, and personalized beauty and wellness services. We strive to set a new standard in the industry, where every appointment is an escape into tranquility.
                        </p>
                        <div className="grid grid-cols-2 gap-8 pt-8">
                            <div className="space-y-2">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                                    <Sparkles size={24} />
                                </div>
                                <h4 className="font-bold text-gray-900 text-lg">Premium Quality</h4>
                                <p className="text-sm text-gray-500">Only the best products for your skin and hair.</p>
                            </div>
                            <div className="space-y-2">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                                    <Users size={24} />
                                </div>
                                <h4 className="font-bold text-gray-900 text-lg">Expert Staff</h4>
                                <p className="text-sm text-gray-500">Highly trained professionals at your service.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <img src="https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?auto=format&fit=crop&q=80&w=800" alt="Spa Treatment" className="rounded-[3rem] shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-700" />
                    </div>
                </section>

                {/* Stats */}
                <section className="bg-bg-light rounded-[3rem] p-16">
                    <div className="grid md:grid-cols-4 gap-12 text-center">
                        {[
                            { label: "Happy Clients", value: "50k+", icon: Heart },
                            { label: "Partner Salons", value: "100+", icon: Coffee },
                            { label: "Years of Service", value: "5+", icon: Award },
                            { label: "5-Star Reviews", value: "12k+", icon: Star },
                        ].map((stat, i) => (
                            <div key={i} className="space-y-4 group">
                                <stat.icon size={32} className="mx-auto text-primary group-hover:scale-125 transition-transform duration-300" />
                                <h3 className="text-5xl font-black text-gray-900">{stat.value}</h3>
                                <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
};

export default About;
