import React, { useState, useEffect, useCallback } from 'react';
import { FaUserPlus, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useSalon } from '../../context/SalonContext';

export default function Walkin() {
    const { selectedSalon } = useSalon();
    const [showModal, setShowModal] = useState(false);
    const [walkins, setWalkins] = useState([]);
    const [staff, setStaff] = useState([]);
    const [services, setServices] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        serviceId: '',
        staffId: '',
        price: '',
        time: ''
    });
    const [timeError, setTimeError] = useState('');
    const [staffError, setStaffError] = useState('');
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [bookedSlots, setBookedSlots] = useState([]);

    // Set default time when modal opens
    useEffect(() => {
        if (showModal) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            setFormData(prev => ({ ...prev, time: `${hours}:${minutes}` }));
        }
    }, [showModal]);

    const fetchWalkins = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const salonId = selectedSalon?._id;
            const url = salonId
                ? `http://localhost:5050/walkins?salonId=${salonId}`
                : 'http://localhost:5050/walkins';

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setWalkins(data);
            }
        } catch (error) {
            console.error("Error fetching walk-ins:", error);
        }
    }, [selectedSalon]);

    const fetchStaff = useCallback(async () => {
        try {
            if (!selectedSalon) return;
            const token = localStorage.getItem('token');
            const url = `http://localhost:5050/staff?salonId=${selectedSalon._id}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                // Filter: Active, Not on leave, and role is NOT receptionist
                const stylists = data.filter(s => s.isActive && !s.onLeave && s.role !== 'receptionist');
                setStaff(stylists);
            }
        } catch (error) {
            console.error("Error fetching staff:", error);
        }
    }, [selectedSalon]);

    const fetchServices = useCallback(async () => {
        try {
            if (!selectedSalon) return;
            const token = localStorage.getItem('token');
            const url = `http://localhost:5050/services?salonId=${selectedSalon._id}`;
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }
        } catch (error) {
            console.error("Error fetching services:", error);
        }
    }, [selectedSalon]);

    // Check availability with appointments API

    useEffect(() => {
        fetchWalkins();
        fetchStaff();
        fetchServices();
    }, [fetchWalkins, fetchStaff, fetchServices]);

    // Helper function to check if a staff member is available (not in-service with another customer)
    const isStaffAvailable = (staffId) => {
        if (!staffId) return true;
        const staffWalkin = walkins.find(w => 
            w.staffId === staffId && 
            w.status === 'in-service'
        );
        return !staffWalkin;
    };

    // Helper function to check time conflicts with 30-minute gap
    const checkTimeConflict = (selectedTime) => {
        if (!selectedTime) return { hasConflict: false, message: '' };
        
        const [hours, minutes] = selectedTime.split(':').map(Number);
        const selectedDate = new Date();
        selectedDate.setHours(hours, minutes, 0, 0);
        
        // Check against all walkins in queue (waiting or in-service)
        for (const walkin of inQueue) {
            const walkinDate = new Date(walkin.date);
            const walkinHours = walkinDate.getHours();
            const walkinMinutes = walkinDate.getMinutes();
            
            // Calculate time difference in minutes
            const walkinTimeInMinutes = walkinHours * 60 + walkinMinutes;
            const selectedTimeInMinutes = hours * 60 + minutes;
            const diffInMinutes = Math.abs(selectedTimeInMinutes - walkinTimeInMinutes);
            
            // 30-minute gap required (if diff is less than 30 minutes, it's a conflict)
            if (diffInMinutes < 30) {
                const formattedTime = walkinDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return {
                    hasConflict: true,
                    message: `Time slot occupied! Someone already booked at ${formattedTime}. Please maintain a 30-minute gap.`
                };
            }
        }
        
        return { hasConflict: false, message: '' };
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'serviceId') {
            const selectedService = services.find(s => s._id === value);
            setFormData(prev => ({
                ...prev,
                serviceId: value,
                price: selectedService ? selectedService.price : ''
            }));
        } else if (name === 'time') {
            setFormData(prev => ({ ...prev, [name]: value }));
            const conflict = checkTimeConflict(value);
            setTimeError(conflict.hasConflict ? conflict.message : '');
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Check time conflict before submitting
        const conflict = checkTimeConflict(formData.time);
        if (conflict.hasConflict) {
            setTimeError(conflict.message);
            return;
        }
        
        try {
            if (!selectedSalon) {
                alert('Please select a salon first');
                return;
            }
            const token = localStorage.getItem('token');

            // Get current date and combine with selected time
            const now = new Date();
            let walkinDate = now;
            
            if (formData.time) {
                const [hours, minutes] = formData.time.split(':');
                walkinDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(hours), parseInt(minutes));
            }

            const walkinData = {
                salonId: selectedSalon._id,
                clientName: formData.name,
                clientMobile: formData.phone,
                serviceId: formData.serviceId,
                staffId: formData.staffId || null,
                price: Number(formData.price) || 0,
                date: walkinDate.toISOString(),
            };


            const response = await fetch('http://localhost:5050/walkins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(walkinData)
            });

            if (response.ok) {
                alert('Walk-in added successfully!');
                setShowModal(false);
                setFormData({ name: '', phone: '', serviceId: '', staffId: '', price: '', time: '' });
                fetchWalkins();

            } else {
                alert('Failed to add walk-in');
            }
        } catch (error) {
            console.error("Error adding walk-in:", error);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5050/walkins/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            if (response.ok) {
                fetchWalkins();
            }
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this walk-in?")) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5050/walkins/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                fetchWalkins();
            }
        } catch (error) {
            console.error("Error deleting walk-in:", error);
        }
    };

    const inQueue = walkins.filter(w => w.status === 'waiting' || w.status === 'in-service');
    const completedToday = walkins.filter(w => w.status === 'completed');

    return (
        <div className="min-h-screen bg-bg-light">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Walk-in Management</h1>
                        <p className="text-gray-500 mt-2">Manage walk-in customers and queues for {selectedSalon?.name || 'All Branches'}.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md"
                    >
                        <FaUserPlus />
                        Add Walk-in
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                                <FaClock className="text-yellow-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">In Queue</p>
                                <p className="text-2xl font-bold text-gray-900">{inQueue.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                <FaCheckCircle className="text-green-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Completed Today</p>
                                <p className="text-2xl font-bold text-gray-900">{completedToday.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <FaClock className="text-blue-600 text-xl" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Avg Wait Time</p>
                                <p className="text-2xl font-bold text-gray-900">15 min</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Current Queue */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Current Queue</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Staff</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {inQueue.length === 0 ? (
                                    <tr><td colSpan="8" className="p-8 text-center text-gray-500">No customers in queue</td></tr>
                                ) : (
                                    inQueue.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.clientName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{item.clientMobile}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {services.find(s => s._id === item.serviceId)?.name || item.serviceId}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {staff.find(s => s._id === item.staffId)?.name || 'Not Assigned'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{item.price}</td>
                                            <td className="px-6 py-4">

                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'waiting' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {item.status === 'waiting' ? 'Waiting' : 'In Service'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex justify-center gap-3">
                                                    {item.status === 'waiting' ? (
                                                        <button
                                                            onClick={() => handleStatusUpdate(item._id, 'in-service')}
                                                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                                                        >Start</button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleStatusUpdate(item._id, 'completed')}
                                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                                        >Complete</button>
                                                    )}
                                                    <button
                                                        onClick={() => handleStatusUpdate(item._id, 'cancelled')}
                                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                                    >Cancel</button>
                                                    <button
                                                        onClick={() => handleDelete(item._id)}
                                                        className="text-gray-400 hover:text-gray-600 text-sm font-medium"
                                                    >Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Walk-ins */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Recent Walk-ins</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Service</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Staff</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Time</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {walkins.filter(w => w.status === 'completed' || w.status === 'cancelled').length === 0 ? (
                                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">No recent entries</td></tr>
                                ) : (
                                    walkins.filter(w => w.status === 'completed' || w.status === 'cancelled').map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.clientName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {services.find(s => s._id === item.serviceId)?.name || item.serviceId}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {staff.find(s => s._id === item.staffId)?.name || 'Not Assigned'}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-gray-900">₹{item.price}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="px-6 py-4">

                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {item.status === 'completed' ? 'Completed' : 'Cancelled'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Walk-in Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900">Add Walk-in Customer</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FaTimesCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <div className="p-6 space-y-4 overflow-y-auto scrollbar-hide flex-1">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 transition-all"
                                        placeholder="Customer name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 transition-all"
                                        placeholder="Phone number"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                                        <select
                                            name="serviceId"
                                            value={formData.serviceId}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 transition-all appearance-none"
                                        >
                                            <option value="">Select Service</option>
                                            {services.map(s => (
                                                <option key={s._id} value={s._id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 transition-all"
                                            placeholder="Price"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Time <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input
                                                type="time"
                                                name="time"
                                                value={formData.time}
                                                onChange={handleInputChange}
                                                required
                                                step="60"
                                                className={`w-full px-4 py-3 pr-10 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-white transition-all cursor-pointer ${timeError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300'}`}
                                            />
                                            <FaClock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                        </div>
                                        {timeError && (
                                            <p className="mt-1 text-sm text-red-600">{timeError}</p>
                                        )}
                                    </div>






                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Stylist</label>
                                        <select
                                            name="staffId"
                                            value={formData.staffId}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none bg-gray-50 transition-all"
                                        >
                                            <option value="">Select Stylist</option>
                                            {staff.map(s => {
                                                const available = isStaffAvailable(s._id);
                                                return (
                                                    <option 
                                                        key={s._id} 
                                                        value={s._id}
                                                        disabled={!available}
                                                        className={!available ? 'text-gray-400' : ''}
                                                    >
                                                        {s.name}{!available ? ' (Unavailable - In Service)' : ''}
                                                    </option>
                                                );
                                            })}
                                        </select>
                                    </div>

                                </div>


                            </div>

                            <div className="p-6 border-t flex gap-3 sticky bottom-0 bg-white shadow-[0_-10px_20px_rgba(255,255,255,1)]">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={timeError !== ''}
                                    className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all shadow-md ${timeError ? 'bg-gray-400 text-gray-200 cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary shadow-primary/20 active:scale-95'}`}
                                >
                                    {timeError ? 'Change Time to Continue' : 'Add to Queue'}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
