import React, { useState, useEffect } from 'react';
import { FaPlus, FaTag, FaPercent, FaCalendarAlt, FaToggleOn, FaToggleOff, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { useSalon } from '../../context/SalonContext';

export default function Offers() {
    const { selectedSalon } = useSalon();
    const [offers, setOffers] = useState([]);
    const [services, setServices] = useState([]);
    const [filter, setFilter] = useState('all'); // all, active, inactive
    const [showModal, setShowModal] = useState(false);
    const [editingOffer, setEditingOffer] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        discountType: 'Percentage',
        discount: 0,
        validFrom: new Date().toISOString().split('T')[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        services: [],
        minPurchase: 0,
        isActive: true,
        imageUrl: ''
    });

    const fetchOffers = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const url = selectedSalon
                ? `http://localhost:5050/offers?salonId=${selectedSalon._id}`
                : 'http://localhost:5050/offers';
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOffers(data);
            }
        } catch (error) {
            console.error('Error fetching offers:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchServices = async () => {
        try {
            if (!selectedSalon?._id) return;
            const res = await fetch(`http://localhost:5050/services?salonId=${selectedSalon._id}`);
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (err) {
            console.error("Error fetching services:", err);
        }
    };

    useEffect(() => {
        fetchOffers();
    }, [selectedSalon]);

    useEffect(() => {
        if (showModal) {
            fetchServices();
        }
    }, [showModal, selectedSalon]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) || 0 : value
        }));
    };

    const handleServiceToggle = (serviceId) => {
        setFormData(prev => {
            const currentServices = prev.services || [];
            if (currentServices.includes(serviceId)) {
                return {
                    ...prev,
                    services: currentServices.filter(id => id !== serviceId)
                };
            } else {
                return {
                    ...prev,
                    services: [...currentServices, serviceId]
                };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                salonId: selectedSalon?._id,
                services: formData.services
            };

            const method = editingOffer ? 'PUT' : 'POST';
            const url = editingOffer
                ? `http://localhost:5050/offers/${editingOffer._id}`
                : 'http://localhost:5050/offers';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchOffers();
                closeModal();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to save offer');
            }
        } catch (error) {
            console.error('Error saving offer:', error);
            alert('Error saving offer');
        }
    };

    const handleEdit = (offer) => {
        setEditingOffer(offer);
        setFormData({
            name: offer.name || '',
            code: offer.code || '',
            discountType: offer.discountType || 'Percentage',
            discount: offer.discount || 0,
            validFrom: offer.validFrom ? new Date(offer.validFrom).toISOString().split('T')[0] : '',
            validTo: offer.validTo ? new Date(offer.validTo).toISOString().split('T')[0] : '',
            services: Array.isArray(offer.services) ? offer.services : [],
            minPurchase: offer.minPurchase || 0,
            isActive: offer.isActive ?? true,
            imageUrl: offer.imageUrl || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this offer?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5050/offers/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchOffers();
            }
        } catch (error) {
            console.error('Error deleting offer:', error);
        }
    };

    const toggleOfferStatus = async (offer) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5050/offers/${offer._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ isActive: !offer.isActive })
            });
            if (response.ok) {
                fetchOffers();
            }
        } catch (error) {
            console.error('Error toggling offer:', error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingOffer(null);
        setFormData({
            name: '',
            code: '',
            discountType: 'Percentage',
            discount: 0,
            validFrom: new Date().toISOString().split('T')[0],
            validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            services: [],
            minPurchase: 0,
            isActive: true,
            imageUrl: ''
        });
    };

    const filteredOffers = offers.filter(offer => {
        if (filter === 'active') return offer.isActive;
        if (filter === 'inactive') return !offer.isActive;
        return true;
    });

    const stats = {
        total: offers.length,
        active: offers.filter(o => o.isActive).length,
        totalUsage: offers.reduce((sum, o) => sum + (o.usageCount || 0), 0)
    };

    return (
        <div className="min-h-screen bg-bg-light">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Offers & Promotions</h1>
                        <p className="text-gray-500 mt-2">Create and manage promotional offers for your salon.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                    >
                        <FaPlus />
                        Create Offer
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FaTag className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Offers</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <FaToggleOn className="text-green-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Active Offers</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <FaPercent className="text-purple-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Total Usage</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalUsage}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                <FaToggleOff className="text-orange-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Inactive</p>
                                <p className="text-2xl font-bold text-orange-600">{stats.total - stats.active}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                <div className="flex gap-2 mb-6">
                    {['all', 'active', 'inactive'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === f
                                ? 'bg-primary text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>

                {/* Offers Grid */}
                {loading ? (
                    <div className="text-center py-12 text-gray-500">Loading...</div>
                ) : filteredOffers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">No offers found</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredOffers.map((offer) => (
                            <div key={offer._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                {/* Offer Header */}
                                <div className={`p-4 ${offer.isActive ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-gray-400'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{offer.name}</h3>
                                            <p className="text-white/80 text-sm mt-1">Code: {offer.code}</p>
                                        </div>
                                        <div className="bg-white rounded-lg px-3 py-1">
                                            <span className="text-primary font-bold">
                                                {offer.discountType === 'Percentage' ? `${offer.discount}%` : `₹${offer.discount}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Offer Details */}
                                <div className="p-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <FaCalendarAlt className="text-gray-400" />
                                            <span>
                                                {new Date(offer.validFrom).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - {new Date(offer.validTo).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                <div className="flex flex-wrap gap-1">
                                            {(offer.services || []).slice(0, 3).map((serviceId, idx) => {
                                                const service = services.find(s => s._id === serviceId);
                                                return (
                                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                        {service?.name || serviceId}
                                                    </span>
                                                );
                                            })}
                                            {(offer.services || []).length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">+{offer.services.length - 3} more</span>
                                            )}
                                        </div>
                                        {offer.minPurchase > 0 && (
                                            <p className="text-xs text-gray-500">Min. purchase: ₹{offer.minPurchase}</p>
                                        )}
                                    </div>

                                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                                        <span className="text-sm text-gray-500">{offer.usageCount || 0} uses</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleEdit(offer)} className="text-primary hover:text-secondary text-sm font-medium">
                                                <FaEdit />
                                            </button>
                                            <button
                                                onClick={() => toggleOfferStatus(offer)}
                                                className={`text-sm font-medium ${offer.isActive ? 'text-red-600' : 'text-green-600'}`}
                                            >
                                                {offer.isActive ? <FaToggleOff /> : <FaToggleOn />}
                                            </button>
                                            <button onClick={() => handleDelete(offer._id)} className="text-red-500 hover:text-red-700">
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add/Edit Offer Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingOffer ? 'Edit Promotion Offer' : 'Create New Offer'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {editingOffer ? 'Update existing promotion details and validity.' : 'Set up a new promotional offer for your salon.'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <form id="offer-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Offer Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        placeholder="e.g., Valentine's Day Special"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Promo Code *</label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all uppercase placeholder:text-gray-400 font-mono"
                                        placeholder="e.g., SAVE20"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount Type</label>
                                        <select
                                            name="discountType"
                                            value={formData.discountType}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none cursor-pointer bg-white"
                                        >
                                            <option value="Percentage">Percentage (%)</option>
                                            <option value="Fixed">Fixed Amount (₹)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Discount Value</label>
                                        <input
                                            type="number"
                                            name="discount"
                                            value={formData.discount}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valid From</label>
                                        <input
                                            type="date"
                                            name="validFrom"
                                            value={formData.validFrom}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Valid Until</label>
                                        <input
                                            type="date"
                                            name="validTo"
                                            value={formData.validTo}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Applicable Services</label>
                                    <div className="border border-gray-200 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2">
                                        {services.length > 0 ? (
                                            services.map(service => (
                                                <label key={service._id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.services?.includes(service._id)}
                                                        onChange={() => handleServiceToggle(service._id)}
                                                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                                    />
                                                    <span className="text-sm text-gray-700">{service.name}</span>
                                                    <span className="text-xs text-gray-400">₹{service.price || service.priceUnisex || service.priceMale || service.priceFemale}</span>
                                                </label>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-400 italic">No services available for this salon</p>
                                        )}
                                    </div>
                                    {formData.services && formData.services.length > 0 && (
                                        <p className="text-xs text-gray-500 mt-1">{formData.services.length} service(s) selected</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minimum Purchase (₹)</label>
                                        <input
                                            type="number"
                                            name="minPurchase"
                                            value={formData.minPurchase}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                            placeholder="0 for no minimum"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image URL <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="text"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        placeholder="https://example.com/offer-image.jpg"
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/10">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        id="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-primary rounded-lg border-gray-300 focus:ring-primary/20 cursor-pointer"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                                        Activate this offer immediately
                                    </label>
                                </div>
                            </form>
                        </div>

                        {/* Modal Footer - Pinned */}
                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                form="offer-form"
                                type="submit"
                                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-secondary transition-all shadow-md shadow-primary/20 font-bold active:scale-95"
                            >
                                {editingOffer ? 'Update Offer' : 'Create Offer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
