import React, { useState, useEffect } from 'react';
import AppointmentsTable from '../../components/tables/AppointmentsTable';
import { useSalon } from '../../context/SalonContext';

const predefinedServices = [
  { title: "Hair Styling & Cutting", id: "1" },
  { title: "Express Facial", id: "2" },
  { title: "Spa & Massage", id: "3" },
  { title: "Skin Consultation", id: "4" },
  { title: "Coloring & Highlights", id: "5" },
  { title: "Beauty Products", id: "6" },
  { title: "Manicure & Pedicure", id: "7" },
  { title: "Bridal Packages", id: "8" },
];

function Appointments() {
  const { selectedSalon, setSelectedSalon } = useSalon();
  const [showModal, setShowModal] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState(predefinedServices.map(s => ({ ...s, _id: s.id, name: s.title })));
  const [staff, setStaff] = useState([]);
  const [salons, setSalons] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Availability state
  const [availabilityError, setAvailabilityError] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    clientName: '',
    clientMobile: '',
    date: '',
    time: '',
    serviceId: '',
    staffId: '',
    salonId: '',
    price: ''
  });

  // Fetch staff's assigned salon for receptionist/staff roles
  useEffect(() => {
    const fetchStaffSalon = async () => {
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');

      // If user is staff/receptionist, fetch their salon
      if (role && role !== 'owner' && userId) {
        try {
          const response = await fetch(`http://localhost:5050/auth/me?userId=${userId}&role=${role}`);
          if (response.ok) {
            const staffData = await response.json();
            if (staffData.salonId) {
              const salonIdString = typeof staffData.salonId === 'object'
                ? staffData.salonId._id
                : staffData.salonId;
              setFormData(prev => ({ ...prev, salonId: salonIdString }));

              // NEW: Ensure context is aware of the staff's salon
              if (staffData.salonId) {
                const salonToSelect = typeof staffData.salonId === 'object'
                  ? staffData.salonId
                  : { _id: staffData.salonId, name: 'My Branch' };

                // Only update if current context is missing or different
                if (!selectedSalon || selectedSalon._id !== salonIdString) {
                  setSelectedSalon(salonToSelect);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error fetching staff salon:', error);
        }
      }
    };

    fetchStaffSalon();
  }, []);

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5050/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();

        // Filter by selected Salon if available
        const filteredData = selectedSalon
          ? data.filter(app => app.salonId?._id === selectedSalon._id || app.salonId === selectedSalon._id)
          : data;

        // Map backend data to table expected format
        const mappedData = filteredData.map(app => {
          // If serviceId is populated as an object, use its name.
          let serviceName = 'Service';
          if (app.serviceId && typeof app.serviceId === 'object') {
            serviceName = app.serviceId.name;
          } else if (app.serviceId) {
            // Look up in predefined services if it's a static ID
            const staticService = predefinedServices.find(s => String(s.id) === String(app.serviceId));
            if (staticService) {
              serviceName = staticService.title;
            }
          }

          return {
            id: app._id,
            name: app.clientName,
            mobile: app.clientMobile,
            staff: app.staffId?.name || 'Unassigned',
            date: new Date(app.date).toLocaleDateString(),
            serviceType: serviceName,
            price: app.price || 0,
            note: app.note || '',
            status: app.status || 'waiting',
            category: app.category || 'online' // Include category in data
          };
        });
        setAppointments(mappedData);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  // Re-fetch when selectedSalon changes
  useEffect(() => {
    const loadData = async () => {
      await fetchAppointments();
    };
    loadData();
  }, [selectedSalon]);

  const fetchServices = async () => {
    try {
      const salonId = selectedSalon?._id;
      if (!salonId) return;

      const response = await fetch(`http://localhost:5050/services?salonId=${salonId}`);
      if (response.ok) {
        const data = await response.json();
        const normalizedPredefined = predefinedServices.map(s => ({ ...s, _id: s.id, name: s.title }));
        // Put predefined services first, then API services
        setServices([...normalizedPredefined, ...data]);
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use _id if it's an object, otherwise use the value itself
      const salonId = selectedSalon?._id || selectedSalon;

      const url = salonId
        ? `http://localhost:5050/staff?salonId=${salonId}`
        : 'http://localhost:5050/staff';

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter active staff who are not on leave
        const availableStaff = data.filter(s => s.isActive && !s.onLeave);
        setStaff(availableStaff);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchSalons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5050/salons', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSalons(data);
      }
    } catch (error) {
      console.error("Error fetching salons:", error);
    }
  };

  // Check availability when date, time, or staff changes
  const checkAvailability = async () => {
    if (!formData.date || !formData.time || !selectedSalon) return;
    
    setCheckingAvailability(true);
    setAvailabilityError('');
    
    try {
      const token = localStorage.getItem('token');
      const appointmentDate = new Date(`${formData.date}T${formData.time}`);
      
      let url = `http://localhost:5050/appointments/check-availability?salonId=${selectedSalon._id}&date=${appointmentDate.toISOString()}`;
      
      // If editing, exclude current appointment
      if (formData._id) {
        url += `&excludeAppointmentId=${formData._id}`;
      }
      
      // If staff is selected, check specifically for that staff
      if (formData.staffId) {
        url += `&staffId=${formData.staffId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBookedSlots(data.bookedSlots || []);
        
        // Check if selected time slot is already booked
        const isTimeSlotBooked = data.bookedSlots.some(slot => {
          const slotTime = new Date(slot.time).getTime();
          const selectedTime = appointmentDate.getTime();
          return slotTime === selectedTime;
        });
        
        if (isTimeSlotBooked) {
          setAvailabilityError('This time slot is already booked. Please select a different time.');
        } else if (formData.staffId) {
          // Check if selected staff is available at this time
          const selectedStaffMember = data.availableStaff?.find(s => s._id === formData.staffId);
          if (selectedStaffMember && !selectedStaffMember.isAvailable) {
            setAvailabilityError('Selected staff is not available at this time. Please choose another staff or time slot.');
          }
        }
      }
    } catch (error) {
      console.error("Error checking availability:", error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  useEffect(() => {
    if (selectedSalon) {
      fetchServices();
      fetchStaff();
    }
  }, [selectedSalon]);

  useEffect(() => {
    fetchSalons();
  }, []);

  // Check availability when date, time, or staff changes
  useEffect(() => {
    if (formData.date && formData.time) {
      checkAvailability();
    }
  }, [formData.date, formData.time, formData.staffId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear availability error when user changes inputs
    if (name === 'date' || name === 'time' || name === 'staffId') {
      setAvailabilityError('');
    }
  };

  const handleEdit = (appointment) => {
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5050/appointments/${appointment.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setFormData({
          _id: data._id,
          clientName: data.clientName,
          clientMobile: data.clientMobile,
          date: data.date ? data.date.split('T')[0] : '',
          time: data.date ? new Date(data.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '',
          serviceId: data.serviceId?._id || data.serviceId,
          staffId: data.staffId?._id || data.staffId,
          salonId: data.salonId?._id || data.salonId,
          price: data.price || '',
        });
        setShowModal(true);
        // Check availability for the appointment being edited
        setTimeout(() => checkAvailability(), 100);
      })
      .catch(err => {
        console.error("Error fetching appointment for edit:", err);
        alert("Failed to load appointment details.");
      });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5050/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) fetchAppointments();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.date || !formData.time) {
        alert('Please select both date and time.');
        return;
      }

      // Check for availability errors before submitting
      if (availabilityError) {
        alert(availabilityError);
        return;
      }

      // Combine date and time
      const appointmentDate = new Date(`${formData.date}T${formData.time}`);

      const payload = {
        ...formData,
        date: appointmentDate,
        status: 'pending', // Default status, or keep existing if editing
        category: 'online' // Mark as online appointment (created from admin panel)
      };

      const method = formData._id ? 'PUT' : 'POST';
      const url = formData._id
        ? `http://localhost:5050/appointments/${formData._id}`
        : 'http://localhost:5050/appointments';

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchAppointments();
        setShowModal(false);
        setFormData({
          clientName: '',
          clientMobile: '',
          date: '',
          time: '',
          serviceId: '',
          staffId: '',
          salonId: selectedSalon?._id || ''
        });
        setAvailabilityError('');
        setBookedSlots([]);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to save appointment');
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert('An error occurred while saving the appointment.');
    }
  };

  const handleMarkComplete = async (appointmentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5050/appointments/${appointmentId}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update local state
        setAppointments(prev => prev.map(app =>
          app.id === appointmentId ? { ...app, status: 'completed' } : app
        ));
        alert('Appointment marked as complete!');
      } else {
        alert('Failed to mark appointment as complete');
      }
    } catch (error) {
      console.error('Error completing appointment:', error);
      alert('Error completing appointment');
    }
  };

  // Helper to check if a staff member is available
  const isStaffAvailable = (staffId) => {
    if (!bookedSlots.length || !formData.date || !formData.time) return true;
    
    const appointmentDate = new Date(`${formData.date}T${formData.time}`);
    
    // Check if this staff has a booking at the same time
    const hasConflict = bookedSlots.some(slot => {
      const slotTime = new Date(slot.time).getTime();
      const selectedTime = appointmentDate.getTime();
      return slot.staffId === staffId && slotTime === selectedTime;
    });
    
    return !hasConflict;
  };

  return (
    <div className="min-h-screen">
      <div>
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 md:gap-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
              <p className="text-gray-500">View and manage scheduled appointments.</p>
            </div>
            <button
              className="bg-primary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 w-full md:w-auto"
              onClick={() => {
                setFormData({
                  clientName: '',
                  clientMobile: '',
                  date: '',
                  time: '',
                  serviceId: '',
                  staffId: '',
                  salonId: selectedSalon?._id || ''
                });
                setAvailabilityError('');
                setBookedSlots([]);
                setShowModal(true);
              }}
            >
              + Create New Appointment
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Search Bar */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by client name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2.5 pl-10 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50"
                />
                <svg
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            <AppointmentsTable
              appointments={appointments.filter(app => 
                app.name.toLowerCase().includes(searchTerm.toLowerCase())
              )}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkComplete={handleMarkComplete}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh] zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{formData._id ? 'Edit Appointment' : 'Create New Appointment'}</h2>
                <p className="text-sm text-gray-500">Fill in the details to schedule an appointment.</p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => setShowModal(false)}
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <form id="appointment-form" className="p-6 space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Client Name</label>
                    <input
                      name="clientName"
                      value={formData.clientName}
                      onChange={handleInputChange}
                      type="text"
                      required
                      placeholder="Enter client name"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 placeholder:text-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile Number</label>
                    <input
                      name="clientMobile"
                      value={formData.clientMobile}
                      onChange={handleInputChange}
                      type="tel"
                      required
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date</label>
                    <input
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Time
                      {checkingAvailability && (
                        <span className="ml-2 text-xs text-primary animate-pulse">Checking...</span>
                      )}
                    </label>
                    <input
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      type="time"
                      required
                      className={`w-full px-4 py-2.5 rounded-xl border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 cursor-pointer ${
                        availabilityError ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}
                    />
                    {availabilityError && (
                      <p className="mt-1 text-xs text-red-600 flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        {availabilityError}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Type</label>
                    <select
                      name="serviceId"
                      value={formData.serviceId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 appearance-none cursor-pointer"
                    >
                      <option value="">Select service</option>
                      {services.map(service => (
                        <option key={service._id} value={service._id}>{service.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹)</label>
                    <input
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      type="number"
                      required
                      placeholder="Enter price"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Staff
                      {formData.date && formData.time && (
                        <span className="ml-1 text-xs text-gray-500">(shows availability)</span>
                      )}
                    </label>
                    <select
                      name="staffId"
                      value={formData.staffId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 appearance-none cursor-pointer"
                    >
                      <option value="">Select staff</option>
                      {staff.map(s => {
                        const available = isStaffAvailable(s._id);
                        return (
                          <option 
                            key={s._id} 
                            value={s._id}
                            disabled={!available}
                            className={!available ? 'text-gray-400' : ''}
                          >
                            {s.name}{!available ? ' (Booked)' : ''}
                          </option>
                        );
                      })}
                    </select>
                    {formData.staffId && !isStaffAvailable(formData.staffId) && (
                      <p className="mt-1 text-xs text-amber-600">
                        This staff is already booked at the selected time.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Salon</label>
                    <select
                      name="salonId"
                      value={formData.salonId || selectedSalon?._id || ''}
                      onChange={handleInputChange}
                      disabled={localStorage.getItem('role') !== 'owner'}
                      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 ${localStorage.getItem('role') !== 'owner' ? 'opacity-60 cursor-not-allowed' : 'appearance-none cursor-pointer'
                        }`}
                    >
                      <option value="">Select salon</option>
                      {salons.map(salon => (
                        <option key={salon._id} value={salon._id}>{salon.name}</option>
                      ))}
                    </select>
                    {localStorage.getItem('role') !== 'owner' && (
                      <p className="text-[10px] text-gray-500 mt-1">Your assigned branch is pre-selected</p>
                    )}
                  </div>
                </div>
                
                {/* Availability Summary */}
                {formData.date && formData.time && bookedSlots.length > 0 && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">Booked Slots for {new Date(formData.date).toLocaleDateString()}</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {bookedSlots.map((slot, idx) => (
                        <div key={idx} className="text-xs text-blue-700 flex justify-between">
                          <span>{new Date(slot.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <span>{slot.staffName || 'Unknown Staff'}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Modal Footer - Pinned */}
            <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                type="button"
                className="flex-1 px-6 py-2.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                form="appointment-form"
                type="submit"
                disabled={!!availabilityError || checkingAvailability}
                className={`flex-1 px-6 py-2.5 font-bold rounded-xl transition-all shadow-md ${
                  availabilityError || checkingAvailability
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary text-white hover:bg-secondary shadow-primary/20 active:scale-95'
                }`}
              >
                {checkingAvailability ? 'Checking...' : formData._id ? ' Update Appointment' : 'Schedule Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Appointments
