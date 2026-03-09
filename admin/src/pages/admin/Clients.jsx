import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaSearch, FaPhone, FaEnvelope, FaCalendarAlt, FaTimes, FaEdit, FaTrash } from 'react-icons/fa';
import { useSalon } from '../../context/SalonContext';

export default function Clients() {
    const { selectedSalon } = useSalon();
    const [clients, setClients] = useState([]);
    const [stats, setStats] = useState({ totalClients: 0, newThisMonth: 0, activeClients: 0, vipClients: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        email: '',
        isVip: false,
        notes: ''
    });

    const fetchClients = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const url = selectedSalon
                ? `http://localhost:5050/clients?salonId=${selectedSalon._id}`
                : 'http://localhost:5050/clients';
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setClients(data);
            }
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const url = selectedSalon
                ? `http://localhost:5050/clients/stats?salonId=${selectedSalon._id}`
                : 'http://localhost:5050/clients/stats';
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchStats();
    }, [selectedSalon]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const payload = {
                ...formData,
                salonId: selectedSalon?._id
            };

            const method = editingClient ? 'PUT' : 'POST';
            const url = editingClient
                ? `http://localhost:5050/clients/${editingClient._id}`
                : 'http://localhost:5050/clients';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                fetchClients();
                fetchStats();
                closeModal();
            } else {
                const error = await response.json();
                alert(error.message || 'Failed to save client');
            }
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Error saving client');
        }
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setFormData({
            name: client.name || '',
            mobile: client.mobile || '',
            email: client.email || '',
            isVip: client.isVip || false,
            notes: client.notes || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this client?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5050/clients/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchClients();
                fetchStats();
            }
        } catch (error) {
            console.error('Error deleting client:', error);
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingClient(null);
        setFormData({ name: '', mobile: '', email: '', isVip: false, notes: '' });
    };

    const filteredClients = clients.filter(client =>
        client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.mobile?.includes(searchTerm) ||
        client.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-bg-light">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Client Management</h1>
                        <p className="text-gray-500 mt-2">Manage your salon's client database.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                    >
                        <FaUserPlus />
                        Add Client
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Total Clients</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalClients.toLocaleString()}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">New This Month</p>
                        <p className="text-3xl font-bold text-green-600 mt-1">+{stats.newThisMonth}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">Active Clients</p>
                        <p className="text-3xl font-bold text-blue-600 mt-1">{stats.activeClients}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500">VIP Clients</p>
                        <p className="text-3xl font-bold text-purple-600 mt-1">{stats.vipClients}</p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, phone, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Clients Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Client</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Visits</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Last Visit</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Total Spent</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Loading...</td></tr>
                                ) : filteredClients.length === 0 ? (
                                    <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No clients found</td></tr>
                                ) : (
                                    filteredClients.map((client) => (
                                        <tr key={client._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 ${client.isVip ? 'bg-purple-100' : 'bg-primary/10'} rounded-full flex items-center justify-center`}>
                                                        <span className={`${client.isVip ? 'text-purple-600' : 'text-primary'} font-semibold`}>
                                                            {client.name?.charAt(0) || '?'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="font-medium text-gray-900">{client.name}</span>
                                                        {client.isVip && <span className="ml-2 px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">VIP</span>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm text-gray-700 flex items-center gap-2">
                                                        <FaPhone className="text-gray-400 text-xs" /> {client.mobile}
                                                    </span>
                                                    {client.email && (
                                                        <span className="text-sm text-gray-500 flex items-center gap-2">
                                                            <FaEnvelope className="text-gray-400 text-xs" /> {client.email}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                                    {client.visits || 0} visits
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {client.lastVisit ? (
                                                    <span className="flex items-center gap-2">
                                                        <FaCalendarAlt className="text-gray-400" />
                                                        {new Date(client.lastVisit).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </span>
                                                ) : '-'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                                ₹{(client.totalSpent || 0).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex gap-3">
                                                    <button onClick={() => handleEdit(client)} className="text-primary hover:text-secondary">
                                                        <FaEdit />
                                                    </button>
                                                    <button onClick={() => handleDelete(client._id)} className="text-red-500 hover:text-red-700">
                                                        <FaTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add/Edit Client Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={closeModal}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingClient ? 'Edit Client Profile' : 'Add New Client'}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {editingClient ? 'Update client details and preferences.' : 'Register a new client in your salon database.'}
                                </p>
                            </div>
                            <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <FaTimes size={20} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <form id="client-form" onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        placeholder="Enter client's full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        name="mobile"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        placeholder="e.g., +91 9876543210"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                        placeholder="client@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes</label>
                                    <textarea
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleInputChange}
                                        rows="3"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 resize-none"
                                        placeholder="Preferred services, allergies, or other notes..."
                                    />
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-100">
                                    <input
                                        type="checkbox"
                                        name="isVip"
                                        id="isVip"
                                        checked={formData.isVip}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-purple-600 rounded-lg border-gray-300 focus:ring-purple-200 cursor-pointer"
                                    />
                                    <label htmlFor="isVip" className="text-sm font-semibold text-purple-700 cursor-pointer">
                                        Mark as VIP Client
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
                                form="client-form"
                                type="submit"
                                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-secondary transition-all shadow-md shadow-primary/20 font-bold active:scale-95"
                            >
                                {editingClient ? 'Update Profile' : 'Add Client'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
