import React, { useState, useEffect } from "react";
import { X, Calendar, Clock, User, Scissors, Landmark, ChevronRight, CheckCircle2, AlertCircle } from "lucide-react";

interface Service {
    _id: string;
    name: string;
    price?: number;
    duration: number;
    priceUnisex?: number;
    priceMale?: number;
    priceFemale?: number;
    gender: string;
    salonId: { _id: string; name: string };
}

interface Salon {
    _id: string;
    name: string;
    branchArea: string;
}

interface Staff {
    _id: string;
    name: string;
    profession: string;
    avatarUrl?: string;
    services?: string[];
}

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialSalonId?: string;
    initialService?: Service | null;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, initialSalonId, initialService }) => {
    const [step, setStep] = useState(1);
    const [salons, setSalons] = useState<Salon[]>([]);
    const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
    const [services, setServices] = useState<Service[]>([]);

    const [selectedSalon, setSelectedSalon] = useState("");
    const [selectedStaff, setSelectedStaff] = useState("");
    const [selectedService, setSelectedService] = useState<Service | null>(null);

    const [clientName, setClientName] = useState("");
    const [clientMobile, setClientMobile] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    // Staff availability states
    const [availabilityChecking, setAvailabilityChecking] = useState(false);
    const [availabilityError, setAvailabilityError] = useState("");
    const [isSlotAvailable, setIsSlotAvailable] = useState<boolean | null>(null);

    // Initialize with props
    useEffect(() => {
        if (isOpen) {
            fetchSalons();
            if (initialSalonId) {
                setSelectedSalon(initialSalonId);
                setStep(2);
            } else if (initialService && initialService.salonId) {
                if (typeof initialService.salonId === 'object' && initialService.salonId._id) {
                    setSelectedSalon(initialService.salonId._id);
                } else if (typeof initialService.salonId === 'string') {
                    setSelectedSalon(initialService.salonId);
                }
                setSelectedService(initialService);
                setStep(2);
            } else {
                setStep(1);
                setSelectedSalon("");
                setSelectedService(null);
            }
            setSelectedStaff("");
            setClientName("");
            setClientMobile("");
            setDate("");
            setTime("");
            setNote("");
            setSuccess(false);
            setAvailabilityError("");
            setIsSlotAvailable(null);
        }
    }, [isOpen, initialSalonId, initialService]);


    const fetchSalons = async () => {
        try {
            const res = await fetch("http://localhost:5050/salons");
            const data = await res.json();
            if (Array.isArray(data)) setSalons(data);
        } catch (err) {
            console.error("Error fetching salons:", err);
        }
    };

    useEffect(() => {
        if (selectedSalon) {
            const fetchData = async () => {
                try {
                    const staffRes = await fetch(`http://localhost:5050/staff?salonId=${selectedSalon}`);
                    const staffData = await staffRes.json();
                    setStaffMembers(staffData);

                    const servicesRes = await fetch(`http://localhost:5050/services?salonId=${selectedSalon}`);
                    const servicesData = await servicesRes.json();
                    setServices(servicesData);
                } catch (err) {
                    console.error("Error fetching salon data:", err);
                }
            };
            fetchData();
        }
    }, [selectedSalon]);

    // Check staff availability when date or time changes
    useEffect(() => {
        const checkAvailability = async () => {
            if (selectedStaff && date && time) {
                setAvailabilityChecking(true);
                setAvailabilityError("");
                setIsSlotAvailable(null);

                try {
                    const appointmentDate = new Date(`${date}T${time}`);
                    const res = await fetch(
                        `http://localhost:5050/appointments/check-staff-availability?staffId=${selectedStaff}&date=${appointmentDate.toISOString()}`
                    );
                    const data = await res.json();

                    if (data.available) {
                        setIsSlotAvailable(true);
                        setAvailabilityError("");
                    } else {
                        setIsSlotAvailable(false);
                        setAvailabilityError(data.message || "This time slot is not available");
                    }
                } catch (err) {
                    console.error("Error checking availability:", err);
                } finally {
                    setAvailabilityChecking(false);
                }
            } else {
                setIsSlotAvailable(null);
                setAvailabilityError("");
            }
        };

        // Debounce the availability check
        const timer = setTimeout(() => {
            checkAvailability();
        }, 500);

        return () => clearTimeout(timer);
    }, [selectedStaff, date, time]);

    const handleStaffSelection = (staffId: string) => {
        setSelectedStaff(staffId);
        // Reset availability when staff changes
        setIsSlotAvailable(null);
        setAvailabilityError("");
        if (selectedService) {
            setStep(4);
        } else {
            setStep(3);
        }
    };

    const handleBooking = async () => {
        if (!clientName || !clientMobile || !date || !time) {
            alert("Please fill in all required fields.");
            return;
        }

        // Check if slot is available before booking
        if (selectedStaff && isSlotAvailable === false) {
            alert("This time slot is not available. Please choose another time or specialist.");
            return;
        }

        setLoading(true);
        try {
            const appointmentData = {
                salonId: selectedSalon,
                staffId: selectedStaff || null,
                serviceId: selectedService?._id,
                clientName,
                clientMobile,
                date: new Date(`${date}T${time}`),
                note,
                price: selectedService?.price || selectedService?.priceUnisex || selectedService?.priceMale || selectedService?.priceFemale || 0,
                status: "pending",
                category: "online" // Mark as online booking
            };

            const res = await fetch("http://localhost:5050/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(appointmentData)
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => {
                    onClose();
                }, 3000);
            } else {
                const err = await res.json();
                alert(err.message || "Failed to schedule appointment");
            }
        } catch (err) {
            console.error("Booking error:", err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-primary p-6 text-white flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Book Appointment</h2>
                        <p className="text-primary-foreground/80 text-sm">Experience luxury, one step at a time</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors bg-transparent border-none">
                        <X size={24} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="grid grid-cols-4 h-1.5 bg-gray-100">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`h-full transition-all duration-500 ${step >= s ? 'bg-primary' : ''}`} />
                    ))}
                </div>

                {/* Body */}
                <div className="p-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    {success ? (
                        <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Scheduled!</h3>
                            <p className="text-gray-500">We've received your request and will see you soon.</p>
                        </div>
                    ) : (
                        <>
                            {step === 1 && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <div className="flex items-center gap-3 mb-2 text-primary">
                                        <Landmark size={24} />
                                        <h3 className="text-xl font-bold text-gray-900">Choose a Salon</h3>
                                    </div>
                                    <div className="grid gap-4">
                                        {salons.map((salon) => (
                                            <button
                                                key={salon._id}
                                                onClick={() => { setSelectedSalon(salon._id); setStep(2); }}
                                                className={`flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all ${selectedSalon === salon._id ? 'border-primary bg-primary/5' : 'bg-white border-gray-100 hover:border-primary/50'
                                                    }`}
                                            >
                                                <div>
                                                    <p className="font-bold text-gray-900">{salon.name}</p>
                                                    <p className="text-sm text-gray-500">{salon.branchArea}</p>
                                                </div>
                                                <ChevronRight className="text-gray-400" />
                                            </button>
                                        ))}
                                        {salons.length === 0 && <p className="text-gray-400 italic">No salons available...</p>}
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <div className="flex items-center gap-3 mb-2 text-primary">
                                        <User size={24} />
                                        <h3 className="text-xl font-bold text-gray-900">Select Specialist</h3>
                                    </div>
                                    {selectedService && (
                                        <div className="p-4 bg-primary/5 rounded-xl mb-4 border border-primary/10">
                                            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">Selected Service</p>
                                            <p className="font-bold text-gray-900">{selectedService.name}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        {staffMembers
                                            .filter(staff => {
                                                if (!selectedService) return true;
                                                return staff.services?.includes(selectedService._id);
                                            })
                                            .map((staff) => (
                                            <button
                                                key={staff._id}
                                                onClick={() => handleStaffSelection(staff._id)}
                                                className={`flex flex-col items-center p-6 rounded-2xl border-2 transition-all ${selectedStaff === staff._id ? 'border-primary bg-primary/5' : 'bg-white border-gray-100 hover:border-primary/50'
                                                    }`}
                                            >
                                                <img src={staff.avatarUrl || `https://ui-avatars.com/api/?name=${staff.name}&background=9381ff&color=fff`} className="w-16 h-16 rounded-full object-cover mb-3" alt={staff.name} />
                                                <p className="font-bold text-gray-900 text-center">{staff.name}</p>
                                                <p className="text-xs text-gray-500 uppercase tracking-wider text-center">{staff.profession}</p>
                                            </button>
                                        ))}
                                        {(staffMembers.filter(staff => !selectedService || staff.services?.includes(selectedService._id)).length === 0) && (
                                            <p className="text-gray-400 italic col-span-2">
                                                {selectedService 
                                                    ? `No specialists available for ${selectedService.name}...` 
                                                    : "No specialists for this salon..."}
                                            </p>
                                        )}
                                    </div>
                                    <button onClick={() => setStep(1)} className="text-primary font-semibold text-sm hover:underline">← Back to Salons</button>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <div className="flex items-center gap-3 mb-2 text-primary">
                                        <Scissors size={24} />
                                        <h3 className="text-xl font-bold text-gray-900">Pick a Service</h3>
                                    </div>
                                    <div className="grid gap-3">
                                        {services
                                            .filter(s => {
                                                const staff = staffMembers.find(st => st._id === selectedStaff);
                                                return staff?.services?.length ? staff.services.includes(s._id) : true;
                                            })
                                            .map((service) => (
                                                <button
                                                    key={service._id}
                                                    onClick={() => { setSelectedService(service); setStep(4); }}
                                                    className={`flex items-center justify-between p-5 rounded-2xl border-2 text-left transition-all ${selectedService?._id === service._id ? 'border-primary bg-primary/5' : 'bg-white border-gray-100 hover:border-primary/50'
                                                        }`}
                                                >
                                                    <div>
                                                        <p className="font-bold text-gray-900">{service.name}</p>
                                                        <p className="text-sm text-gray-500">{service.duration} mins</p>
                                                    </div>
                                                    <span className="font-bold text-primary">₹{service.price || service.priceUnisex || service.priceMale || service.priceFemale}</span>
                                                </button>
                                            ))}
                                    </div>
                                    <button onClick={() => setStep(2)} className="text-primary font-semibold text-sm hover:underline">← Back to Specialists</button>
                                </div>
                            )}

                            {step === 4 && (
                                <div className="space-y-6 animate-in slide-in-from-right duration-300">
                                    <div className="flex items-center gap-3 mb-2 text-primary">
                                        <Calendar size={24} />
                                        <h3 className="text-xl font-bold text-gray-900">Your Details</h3>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Service</span>
                                            <span className="font-bold text-gray-900">{selectedService?.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Specialist</span>
                                            <span className="font-bold text-gray-900">{staffMembers.find(s => s._id === selectedStaff)?.name}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Total Price</span>
                                            <span className="font-bold text-primary">₹{selectedService?.price || selectedService?.priceUnisex || selectedService?.priceMale || selectedService?.priceFemale}</span>
                                        </div>
                                    </div>

                                    {/* Availability Status */}
                                    {selectedStaff && date && time && (
                                        <div className={`p-4 rounded-xl border-2 ${
                                            availabilityChecking 
                                                ? 'bg-blue-50 border-blue-200'
                                                : isSlotAvailable === true 
                                                    ? 'bg-green-50 border-green-200'
                                                    : isSlotAvailable === false 
                                                        ? 'bg-red-50 border-red-200'
                                                        : 'bg-gray-50 border-gray-200'
                                        }`}>
                                            <div className="flex items-center gap-2">
                                                {availabilityChecking ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                                        <span className="text-sm text-blue-600">Checking availability...</span>
                                                    </>
                                                ) : isSlotAvailable === true ? (
                                                    <>
                                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                                        <span className="text-sm text-green-600">This time slot is available!</span>
                                                    </>
                                                ) : isSlotAvailable === false ? (
                                                    <>
                                                        <AlertCircle className="w-5 h-5 text-red-600" />
                                                        <span className="text-sm text-red-600">{availabilityError || "This time slot is not available"}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Clock className="w-5 h-5 text-gray-400" />
                                                        <span className="text-sm text-gray-500">Select a date and time to check availability</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid gap-5">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Date</label>
                                                <input 
                                                    type="date" 
                                                    value={date} 
                                                    onChange={e => setDate(e.target.value)} 
                                                    min={new Date().toISOString().split('T')[0]}
                                                    className="w-full mt-1.5 p-3 rounded-xl border border-gray-200 focus:border-primary outline-none" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Time</label>
                                                <input 
                                                    type="time" 
                                                    value={time} 
                                                    onChange={e => setTime(e.target.value)} 
                                                    className="w-full mt-1.5 p-3 rounded-xl border border-gray-200 focus:border-primary outline-none" 
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Full Name</label>
                                            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Enter your name" className="w-full mt-1.5 p-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-500 uppercase ml-1">Mobile Number</label>
                                            <input type="tel" value={clientMobile} onChange={e => setClientMobile(e.target.value)} placeholder="e.g. +91 9876543210" className="w-full mt-1.5 p-3 rounded-xl border border-gray-200 focus:border-primary outline-none" />
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleBooking} 
                                        disabled={loading || (selectedStaff && isSlotAvailable === false) || availabilityChecking} 
                                        className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${
                                            selectedStaff && isSlotAvailable === false
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-primary text-white shadow-primary/30 hover:bg-secondary'
                                        }`}
                                    >
                                        {loading ? "Scheduling..." : availabilityChecking ? "Checking availability..." : isSlotAvailable === false ? "Slot Unavailable" : "Confirm Booking"}
                                    </button>
                                    <button onClick={() => setStep(selectedService ? 2 : 3)} className="w-full text-primary font-semibold text-sm hover:underline">← Back</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookingModal;
