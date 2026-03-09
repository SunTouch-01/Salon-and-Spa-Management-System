import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function BookAppointment() {
    const [salons, setSalons] = useState([]);
    const [staffMembers, setStaffMembers] = useState([]);
    const [services, setServices] = useState([]);

    const [selectedSalon, setSelectedSalon] = useState("");
    const [selectedStaff, setSelectedStaff] = useState("");
    const [selectedService, setSelectedService] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [clientName, setClientName] = useState("");
    const [clientMobile, setClientMobile] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // Fetch salons on mount
    useEffect(() => {
        const fetchSalons = async () => {
            try {
                const res = await fetch("http://localhost:5050/salons");
                if (!res.ok) {
                    console.error("Error fetching salons:", res.status, res.statusText);
                    return;
                }
                const data = await res.json();
                // Ensure data is an array before setting
                if (Array.isArray(data)) {
                    setSalons(data);
                } else {
                    console.error("Invalid response format:", data);
                }
            } catch (err) {
                console.error("Error fetching salons:", err);
            }
        };
        fetchSalons();
    }, []);

    const defaultServices = [
        { _id: "1", name: "Hair Styling & Cutting", duration: "45", price: "500" },
        { _id: "2", name: "Express Facial", duration: "30", price: "800" },
        { _id: "3", name: "Spa & Massage", duration: "60", price: "1200" },
        { _id: "4", name: "Skin Consultation", duration: "20", price: "300" },
        { _id: "5", name: "Coloring & Highlights", duration: "120", price: "2500" },
        { _id: "6", name: "Beauty Products", duration: "15", price: "1000" },
        { _id: "7", name: "Manicure & Pedicure", duration: "60", price: "700" },
        { _id: "8", name: "Bridal Packages", duration: "180", price: "5000" },
    ];

    // Fetch staff and services when salon is selected
    useEffect(() => {
        if (selectedSalon) {
            const fetchData = async () => {
                try {
                    // Fetch staff
                    const staffRes = await fetch(`http://localhost:5050/staff?salonId=${selectedSalon}`);
                    const staffData = await staffRes.json();
                    setStaffMembers(staffData);

                    // Fetch services
                    const servicesRes = await fetch(`http://localhost:5050/services?salonId=${selectedSalon}`);
                    const servicesData = await servicesRes.json();

                    // If backend returns services, use them. Otherwise, use defaults.
                    if (servicesData && servicesData.length > 0) {
                        setServices(servicesData);
                    } else {
                        setServices(defaultServices);
                    }
                } catch (err) {
                    console.error("Error fetching salon data:", err);
                    setServices(defaultServices); // Fallback on error
                }
            };
            fetchData();
        } else {
            setStaffMembers([]);
            setServices([]);
            setSelectedStaff("");
            setSelectedService(null);
        }
    }, [selectedSalon]);

    const openBooking = (service) => {
        setSelectedService(service);
        setShowModal(true);
    };

    const confirmBooking = async () => {
        if (!date || !time || !clientName || !clientMobile) {
            alert("Please fill in all required fields (Name, Mobile, Date, Time)");
            return;
        }

        setLoading(true);
        try {
            const appointmentData = {
                salonId: selectedSalon,
                staffId: selectedStaff || null,
                serviceId: selectedService._id,
                clientName: clientName,
                clientMobile: clientMobile,
                date: new Date(`${date}T${time}`),
                note: note,
                price: selectedService.priceUnisex || selectedService.priceMale || selectedService.priceFemale || selectedService.price || 0,
                status: "pending"
            };

            const res = await fetch("http://localhost:5050/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointmentData)
            });

            if (res.ok) {
                alert("Appointment scheduled successfully!");
                setShowModal(false);
                navigate("/");
            } else {
                const err = await res.json();
                alert(err.message || "Failed to schedule appointment");
            }
        } catch (err) {
            console.error("Booking error:", err);
            alert("An error occurred during booking");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-bg-light py-14 px-4">
            <div className="max-w-6xl mx-auto">

                {/* Page Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold">
                        Book Your <span className="text-primary">Appointment</span>
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Choose your preferred salon, stylist & service
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Step 1: Salon */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                        <label className="block text-lg font-semibold mb-6">
                            Step 1: Select Salon
                        </label>
                        <div className="flex flex-wrap gap-6">
                            {salons.map((salon) => (
                                <div
                                    key={salon._id}
                                    onClick={() => setSelectedSalon(salon._id)}
                                    className={`flex flex-col p-6 rounded-2xl border-2 cursor-pointer transition-all min-w-[200px] flex-1 sm:flex-none ${selectedSalon === salon._id
                                        ? "border-primary bg-primary/5 shadow-md scale-105"
                                        : "border-gray-100 hover:border-gray-300 shadow-sm"
                                        }`}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            🏢
                                        </div>
                                        <span className="text-lg font-bold text-gray-800">{salon.name}</span>
                                    </div>
                                    <p className="text-sm text-gray-500 ml-13">
                                        {salon.branchArea || salon.address || "Main Branch"}
                                    </p>
                                </div>
                            ))}
                            {salons.length === 0 && (
                                <p className="text-gray-400 italic">No salons available at the moment.</p>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Staff */}
                    {selectedSalon && (
                        <div className="bg-white rounded-2xl shadow-lg p-8 mt-8 mb-8">
                            <label className="block text-lg font-semibold mb-6">
                                Step 2: Choose Stylist
                            </label>
                            <div className="flex flex-wrap gap-6">
                                {staffMembers.length > 0 ? (
                                    staffMembers.map((staff) => (
                                        <div
                                            key={staff._id}
                                            onClick={() => setSelectedStaff(staff._id)}
                                            className={`flex flex-col items-center p-6 rounded-2xl border-2 cursor-pointer transition-all min-w-[140px] flex-1 sm:flex-none ${selectedStaff === staff._id
                                                ? "border-primary bg-primary/5 shadow-md scale-105"
                                                : "border-gray-100 hover:border-gray-300"
                                                }`}
                                        >
                                            <img
                                                src={staff.avatarUrl || "https://res.cloudinary.com/dgh9uunif/image/upload/v1768719858/Wavy_Buddies_-_Avatar_5_gdbuhf.webp"}
                                                alt={staff.name}
                                                className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-white shadow-sm"
                                            />
                                            <span className="text-base font-bold text-gray-800">{staff.name}</span>
                                            <span className="text-sm text-gray-500">{staff.profession}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-400 italic">No staff available for this salon.</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Step 3: Services */}
                {selectedStaff && (
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <h2 className="text-2xl font-semibold mb-6">
                            Step 3: Choose Service
                        </h2>

                        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                            {services
                                .filter(service => {
                                    const staff = staffMembers.find(s => s._id === selectedStaff);
                                    // If staff has a services array, filter by it. 
                                    // Otherwise show all services for that salon.
                                    if (staff && staff.services && staff.services.length > 0) {
                                        return staff.services.includes(service._id);
                                    }
                                    return true;
                                })
                                .map((service) => (
                                    <div
                                        key={service._id}
                                        onClick={() => openBooking(service)}
                                        className="bg-white rounded-2xl border p-6 cursor-pointer shadow hover:shadow-xl transition-all hover:border-primary group"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                                {service.name}
                                            </h3>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Duration: {service.duration} mins
                                        </p>
                                        <div className="text-primary font-bold mt-3 text-lg">
                                            {service.price ? `₹${service.price}` : (
                                                <div className="flex flex-wrap gap-x-3 gap-y-1">
                                                    {service.gender === 'unisex' && <span>₹{service.priceUnisex}</span>}
                                                    {service.gender === 'male' && <span>M: ₹{service.priceMale}</span>}
                                                    {service.gender === 'female' && <span>F: ₹{service.priceFemale}</span>}
                                                    {service.gender === 'both' && (
                                                        <>
                                                            <span>M: ₹{service.priceMale}</span>
                                                            <span className="text-gray-300">|</span>
                                                            <span>F: ₹{service.priceFemale}</span>
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                        </div>
                        {services.filter(service => {
                            const staff = staffMembers.find(s => s._id === selectedStaff);
                            if (staff && staff.services && staff.services.length > 0) {
                                return staff.services.includes(service._id);
                            }
                            return true;
                        }).length === 0 && (
                                <p className="text-center text-gray-400 italic py-10">No services available for this stylist.</p>
                            )}
                    </div>
                )}
            </div>

            {/* Booking Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200" onClick={() => setShowModal(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] zoom-in-95" onClick={(e) => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <h3 className="text-xl font-bold text-gray-900">
                                Confirm Appointment
                            </h3>
                            <p className="text-sm text-gray-500">
                                {selectedService.name} {selectedStaff && `with ${staffMembers.find(s => s._id === selectedStaff)?.name}`}
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your Full Name *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter your name"
                                        value={clientName}
                                        onChange={(e) => setClientName(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number *</label>
                                    <input
                                        type="tel"
                                        placeholder="e.g., +91 9876543210"
                                        value={clientMobile}
                                        onChange={(e) => setClientMobile(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date *</label>
                                        <input
                                            type="date"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time *</label>
                                        <input
                                            type="time"
                                            value={time}
                                            onChange={(e) => setTime(e.target.value)}
                                            onClick={(e) => e.target.showPicker && e.target.showPicker()}
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Special Notes (Optional)</label>
                                    <textarea
                                        placeholder="Any specific requests or requirements..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-400 min-h-[100px] resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer - Pinned */}
                        <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
                            <button
                                onClick={() => setShowModal(false)}
                                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-bold active:scale-95"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBooking}
                                disabled={loading}
                                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-secondary transition-all shadow-md shadow-primary/20 font-bold active:scale-95 disabled:bg-gray-400 disabled:shadow-none"
                            >
                                {loading ? "Scheduling..." : "Schedule"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};