import React, { useState } from "react";
import { Mail, MapPin, Phone, Send, Clock } from "lucide-react";

const Contact: React.FC = () => {
    const [formData, setFormData] = useState({ name: "", email: "", message: "" });
    const [success, setSuccess] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Simulate form submission
        setSuccess(true);
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setSuccess(false), 5000);
    };

    return (
        <div className="pt-32 pb-20 bg-bg-light min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20 space-y-4">
                    <span className="text-primary font-bold tracking-widest uppercase text-sm">Get in Touch</span>
                    <h1 className="text-5xl font-bold text-gray-900 leading-tight">We'd Love to <span className="text-primary italic">Hear</span> From You.</h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-16">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div className="bg-white p-10 rounded-[3rem] shadow-xl shadow-gray-200/50 space-y-8">
                            <h3 className="text-2xl font-bold text-gray-900">Contact Information</h3>
                            <div className="space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Headquarters</p>
                                        <p className="text-gray-500">123 Luxury Blvd, Metropolis, NY 10012</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Phone</p>
                                        <p className="text-gray-500">+1 (555) 123-4567</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Email</p>
                                        <p className="text-gray-500">hello@glowbiz.luxury</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary shrink-0">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">Hours</p>
                                        <p className="text-gray-500">Mon-Sun: 9:00 AM - 9:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Map Placeholder */}
                        <div className="h-64 bg-gray-200 rounded-[3rem] overflow-hidden relative group">
                            <img
                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000"
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                alt="Map Location"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-transparent transition-colors">
                                <button className="bg-white px-6 py-3 rounded-full font-bold text-sm shadow-xl hover:scale-105 transition-transform">
                                    View on Google Maps
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-2xl shadow-gray-200/50">
                        <h3 className="text-3xl font-bold text-gray-900 mb-8">Send us a Message</h3>

                        {success ? (
                            <div className="bg-green-50 p-6 rounded-2xl text-green-700 text-center animate-in fade-in zoom-in">
                                <p className="font-bold text-lg mb-2">Message Sent!</p>
                                <p className="text-sm">Thank you for reaching out. We'll get back to you shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="John Doe"
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:bg-white outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="john@example.com"
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:bg-white outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase ml-1">Message</label>
                                    <textarea
                                        required
                                        rows={5}
                                        value={formData.message}
                                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="How can we help you?"
                                        className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 focus:border-primary focus:bg-white outline-none transition-colors resize-none"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-primary transition-all shadow-xl hover:shadow-primary/30 flex items-center justify-center gap-2"
                                >
                                    Send Message
                                    <Send size={18} />
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
