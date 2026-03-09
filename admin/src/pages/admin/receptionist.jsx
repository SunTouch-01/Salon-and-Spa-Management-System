

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import CalendarWidget from '../../components/Calendar';
import ReceptionistTable from '../../components/tables/ReceptionistTable';
import KpiCard from '../../components/KpiCard';
import { useSalon } from '../../context/SalonContext';

function Receptionist() {


  const { selectedSalon } = useSalon();
  const [showNewPatientPopup, setShowNewPatientPopup] = useState(false);
  const [showEmergencyPopup, setShowEmergencyPopup] = useState(false);

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeFilter, setTimeFilter] = useState('today'); // 'today', 'week', 'month', 'all'
  const [staff, setStaff] = useState([]);
  const [todayStats, setTodayStats] = useState({ customerCount: 0, revenue: 0 });
  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, leave: 0 });


  // Function to fetch today's stats
  const fetchTodayStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const url = selectedSalon
        ? `http://localhost:5050/appointments/today-stats?salonId=${selectedSalon._id}`
        : 'http://localhost:5050/appointments/today-stats';
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTodayStats(data);
      } else {
        console.error('Failed to fetch stats:', response.status);
      }
    } catch (error) {
      console.error("Error fetching today's stats:", error);
    }
  }, [selectedSalon]);

  // Form state for New Client Registration
  const [newClientForm, setNewClientForm] = useState({
    name: '',
    mobile: '',
    age: '',
    gender: 'Male',
    reason: ''
  });

  // Form state for Walk-in Entry
  const [walkinForm, setWalkinForm] = useState({
    clientName: '',
    serviceRequest: '',
    stylistId: '',
    price: ''
  });

  useEffect(() => {
    const fetchAppointmentsAndWalkins = async () => {
      try {
        const token = localStorage.getItem('token');
        const salonId = selectedSalon?._id;

        // Fetch Appointments
        const appResponse = await fetch('http://localhost:5050/appointments', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Fetch Walkins
        const walkinUrl = salonId
          ? `http://localhost:5050/walkins?salonId=${salonId}`
          : 'http://localhost:5050/walkins';
        const walkinResponse = await fetch(walkinUrl, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        let mappedAppointments = [];
        let mappedWalkins = [];

        if (appResponse.ok) {
          const data = await appResponse.json();
          const filteredData = selectedSalon
            ? data.filter(app => app.salonId?._id === selectedSalon._id || app.salonId === selectedSalon._id)
            : data;

          mappedAppointments = filteredData.map(app => ({
            id: app._id,
            time: new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(app.date), // Preserve original date for filtering
            name: app.clientName,
            gender: "N/A",
            age: "--",
            reason: app.serviceId?.name || "Visit",
            stylist: app.staffId?.name || "Stylist",
            price: app.price || 0,
            status: app.status || "waiting",
            type: 'appointment'
          }));

        }

        if (walkinResponse.ok) {
          const data = await walkinResponse.json();
          mappedWalkins = data.map(w => ({
            id: w._id,
            time: new Date(w.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            date: new Date(w.date), // Preserve original date for filtering
            name: w.clientName,
            gender: "N/A",
            age: "--",
            reason: w.serviceId || "Walk-in", // Could map if it's an ID
            stylist: w.staffId?.name || "Stylist",
            price: w.price || 0,
            status: w.status || "waiting",
            type: 'walkin'
          }));

        }

        // Combine and sort by date/time (most recent first for receptionist or as per requirement)
        setAppointments([...mappedAppointments, ...mappedWalkins]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchAppointmentsAndWalkins();
  }, [selectedSalon]);

  useEffect(() => {
    // Fetch stats on component mount and when selectedSalon changes
    fetchTodayStats();
  }, [fetchTodayStats]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = selectedSalon
          ? `http://localhost:5050/staff?salonId=${selectedSalon._id}`
          : 'http://localhost:5050/staff';
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          // Filter for active stylists
          const stylists = data.filter(s => s.isActive && (s.role === 'stylist' || s.role === 'assistant'));
          setStaff(stylists);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };
    fetchStaff();
  }, [selectedSalon]);

  // Fetch Attendance Stats
  useEffect(() => {
    const fetchAttendanceStats = async () => {
      if (!selectedSalon) return;
      try {
        const token = localStorage.getItem('token');
        const date = new Date().toISOString().split('T')[0];
        const response = await fetch(`http://localhost:5050/attendance/daily?salonId=${selectedSalon._id}&date=${date}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          const present = data.filter(d => d.attendance?.status === 'Present' || d.attendance?.status === 'Half Day').length;
          const absent = data.filter(d => d.attendance?.status === 'Absent').length;
          const leave = data.filter(d => d.attendance?.status === 'Leave').length;
          setAttendanceStats({ present, absent, leave });
        }
      } catch (error) {
        console.error("Error fetching attendance stats:", error);
      }
    };
    fetchAttendanceStats();
  }, [selectedSalon]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'checked': return 'bg-blue-100 text-blue-700';
      case 'waiting': return 'bg-yellow-100 text-yellow-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'checked': return 'Checked In';
      case 'waiting': return 'Waiting';
      case 'completed': return 'Completed';
      default: return status;
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const item = appointments.find(app => app.id === id);
      const isWalkin = item?.type === 'walkin';

      const url = isWalkin
        ? `http://localhost:5050/walkins/${id}`
        : `http://localhost:5050/appointments/${id}/complete`;

      const method = isWalkin ? 'PUT' : 'PUT';
      const body = isWalkin ? JSON.stringify({ status: 'completed' }) : null;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          ...(isWalkin && { 'Content-Type': 'application/json' })
        },
        ...(isWalkin && { body })
      });

      if (response.ok) {
        setAppointments(prev => prev.map(app =>
          app.id === id ? { ...app, status: 'completed' } : app
        ));
        fetchTodayStats();
      } else {
        alert("Failed to complete " + (isWalkin ? "walk-in" : "appointment"));
      }
    } catch (error) {
      console.error("Error completing entry:", error);
      alert("Error completing entry");
    }
  };

  const handleNewClientSubmit = async () => {
    try {
      if (!selectedSalon) {
        alert('Please select a salon first');
        return;
      }

      const token = localStorage.getItem('token');

      // Create appointment for new client
      const appointmentData = {
        clientName: newClientForm.name,
        clientMobile: newClientForm.mobile,
        date: new Date(), // Current date and time
        serviceId: newClientForm.reason || null,
        staffId: null,
        salonId: selectedSalon?._id || null,
        status: 'pending'
      };

      const response = await fetch('http://localhost:5050/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(appointmentData)
      });

      if (response.ok) {
        // Refresh appointments list
        const fetchAppointments = async () => {
          const res = await fetch('http://localhost:5050/appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const filteredData = selectedSalon
              ? data.filter(app => app.salonId?._id === selectedSalon._id || app.salonId === selectedSalon._id)
              : data;
            const mappedData = filteredData.map(app => ({
              id: app._id,
              time: new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              name: app.clientName,
              gender: "N/A",
              age: "--",
              reason: app.serviceId?.name || "Visit",
              stylist: app.staffId?.name || "Stylist",
              status: app.status || "waiting"
            }));
            setAppointments(mappedData);
          }
        };
        await fetchAppointments();

        // Reset form and close modal
        setNewClientForm({ name: '', mobile: '', age: '', gender: 'Male', reason: '' });
        setShowNewPatientPopup(false);
        alert('New client registered successfully!');
      } else {
        alert('Failed to register client');
      }
    } catch (error) {
      console.error('Error registering client:', error);
      alert('Error registering client');
    }
  };

  const handleWalkinSubmit = async () => {
    try {
      if (!selectedSalon) {
        alert('Please select a salon first');
        return;
      }

      const token = localStorage.getItem('token');

      const walkinData = {
        clientName: walkinForm.clientName || 'Walk-in Client',
        clientMobile: '0000000000',
        serviceId: walkinForm.serviceRequest || '',
        staffId: walkinForm.stylistId || null,
        salonId: selectedSalon._id,
        price: Number(walkinForm.price) || 0,
        status: 'waiting'
      };

      console.log('Sending walk-in data:', walkinData);

      const response = await fetch('http://localhost:5050/walkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(walkinData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error creating appointment:', errorData);
        alert(`Failed to add walk-in entry: ${errorData.message || 'Unknown error'}`);
        return;
      }

      if (response.ok) {
        // Refresh appointments
        const fetchAppointments = async () => {
          const res = await fetch('http://localhost:5050/appointments', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            const filteredData = selectedSalon
              ? data.filter(app => app.salonId?._id === selectedSalon._id || app.salonId === selectedSalon._id)
              : data;
            const mappedData = filteredData.map(app => ({
              id: app._id,
              time: new Date(app.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              name: app.clientName,
              gender: "N/A",
              age: "--",
              reason: app.serviceId?.name || "Visit",
              stylist: app.staffId?.name || "Stylist",
              status: app.status || "waiting"
            }));
            setAppointments(mappedData);
          }
        };
        await fetchAppointments();

        // Reset form and close modal
        setWalkinForm({ clientName: '', serviceRequest: '', stylistId: '', price: '' });
        setShowEmergencyPopup(false);
        alert('Walk-in entry added successfully!');
      } else {
        alert('Failed to add walk-in entry');
      }
    } catch (error) {
      console.error('Error adding walk-in:', error);
      alert('Error adding walk-in entry');
    }
  };

  // Helper function to check if date is within filter range
  const isWithinTimeFilter = (date) => {
    const now = new Date();
    const appDate = new Date(date);
    
    if (timeFilter === 'today') {
      return appDate.toDateString() === now.toDateString();
    }
    
    if (timeFilter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return appDate >= startOfWeek && appDate <= endOfWeek;
    }
    
    if (timeFilter === 'month') {
      return appDate.getMonth() === now.getMonth() && appDate.getFullYear() === now.getFullYear();
    }
    
    if (timeFilter === 'all') {
      return true;
    }
    
    return true;
  };


  // Filter appointments based on time filter and search term
  const filteredAppointments = appointments.filter(app => {
    // First apply time filter
    if (!isWithinTimeFilter(app.date)) {
      return false;
    }
    
    // Then apply search filter
    const searchLower = searchTerm.toLowerCase();
    return (
      app.name?.toLowerCase().includes(searchLower) ||
      app.stylist?.toLowerCase().includes(searchLower) ||
      app.reason?.toLowerCase().includes(searchLower) ||
      app.status?.toLowerCase().includes(searchLower)
    );
  });

  // Get header title based on filter
  const getHeaderTitle = () => {
    switch (timeFilter) {
      case 'today': return "Today's Appointments";
      case 'week': return "This Week's Appointments";
      case 'month': return "This Month's Appointments";
      case 'all': return "All Appointments";
      default: return "Appointments";
    }
  };

  // Get date range text based on filter
  const getDateRangeText = () => {
    const now = new Date();
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    
    if (timeFilter === 'today') {
      return now.toLocaleDateString('en-US', options);
    }
    
    if (timeFilter === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    
    if (timeFilter === 'month') {
      return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    if (timeFilter === 'all') {
      return 'All time';
    }
    
    return '';
  };



  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{getHeaderTitle()}</h1>
        <p className="text-gray-500">{getDateRangeText()}</p>
      </div>

      {/* Time Filter Buttons */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[
          { key: 'today', label: 'Today' },
          { key: 'week', label: 'This Week' },
          { key: 'month', label: 'This Month' },
          { key: 'all', label: 'All Time' }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setTimeFilter(filter.key)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              timeFilter === filter.key
                ? 'bg-primary text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}

      <div className="mb-6">
        <div className="relative max-w-md">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by client name, stylist, or service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-500 mt-2">
            Showing {filteredAppointments.length} of {appointments.length} appointments
          </p>
        )}
      </div>

      {/* Stats Cards - Temporarily showing to all users for debugging */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <KpiCard
          title="Today's Customers"
          value={todayStats.customerCount.toString()}
          trend="+0%"
          isPositive={true}
          icon={<span className="text-2xl">👥</span>}
        />
        <KpiCard
          title="Today's Revenue"
          value={`₹${todayStats.revenue.toLocaleString()}`}
          trend="+0%"
          isPositive={true}
          icon={<span className="text-2xl">💰</span>}
        />
      </div>
      {/* DEBUG: Role is {userRole} */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Appointments Table */}
        <ReceptionistTable appointments={filteredAppointments} onMarkComplete={handleMarkComplete} />


        {/* Right Panel */}
        <div className="space-y-6">
          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <CalendarWidget />
            <div className="mt-4 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Staff Attendance</h4>
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>Present: {attendanceStats.present}</span>
                  <span>Absent: {attendanceStats.absent}</span>
                  <span>Leave: {attendanceStats.leave}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">Manage daily attendance</span>
                  <a href="/staff" className="text-primary text-sm hover:underline font-medium">View &rarr;</a>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button
            className="w-full bg-primary hover:bg-secondary text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            onClick={() => setShowNewPatientPopup(true)}
          >
            + New Client Registration
          </button>

          <button
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5"
            onClick={() => setShowEmergencyPopup(true)}
          >
            🚨 Walk-in Entry
          </button>
        </div>
      </div>

      {/* Popup Modal */}
      {(showNewPatientPopup || showEmergencyPopup) && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => {
            setShowNewPatientPopup(false);
            setShowEmergencyPopup(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden flex flex-col max-h-[90vh] zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Popup Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {showNewPatientPopup ? "New Client Registration" : "Walk-in Entry"}
                </h2>
                <p className="text-sm text-gray-500">
                  {showNewPatientPopup ? "Register a new client for an appointment." : "Record a direct walk-in service."}
                </p>
              </div>
              <button
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors"
                onClick={() => {
                  setShowNewPatientPopup(false);
                  setShowEmergencyPopup(false);
                }}
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            {/* Popup Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <form id="receptionist-form" className="p-6 space-y-4" onSubmit={(e) => {
                e.preventDefault();
                if (showNewPatientPopup) {
                  handleNewClientSubmit();
                } else if (showEmergencyPopup) {
                  handleWalkinSubmit();
                }
              }}>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter client name"
                    value={showNewPatientPopup ? newClientForm.name : walkinForm.clientName}
                    onChange={(e) => {
                      if (showNewPatientPopup) {
                        setNewClientForm({ ...newClientForm, name: e.target.value });
                      } else {
                        setWalkinForm({ ...walkinForm, clientName: e.target.value });
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 placeholder:text-gray-400"
                  />
                </div>

                {showNewPatientPopup && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mobile</label>
                      <input
                        type="tel"
                        required
                        placeholder="Enter mobile number"
                        value={newClientForm.mobile}
                        onChange={(e) => setNewClientForm({ ...newClientForm, mobile: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 placeholder:text-gray-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Age</label>
                        <input
                          type="number"
                          placeholder="Enter age"
                          value={newClientForm.age}
                          onChange={(e) => setNewClientForm({ ...newClientForm, age: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 placeholder:text-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Gender</label>
                        <select
                          value={newClientForm.gender}
                          onChange={(e) => setNewClientForm({ ...newClientForm, gender: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 appearance-none cursor-pointer"
                        >
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reason</label>
                      <input
                        type="text"
                        placeholder="Service needed"
                        value={newClientForm.reason}
                        onChange={(e) => setNewClientForm({ ...newClientForm, reason: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all bg-gray-50 placeholder:text-gray-400"
                      />
                    </div>
                  </>
                )}

                {showEmergencyPopup && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Service Request</label>
                      <input
                        type="text"
                        required
                        placeholder="Describe service needed"
                        value={walkinForm.serviceRequest}
                        onChange={(e) => setWalkinForm({ ...walkinForm, serviceRequest: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all bg-gray-50 placeholder:text-gray-400"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stylist</label>
                      <select
                        required
                        value={walkinForm.stylistId}
                        onChange={(e) => setWalkinForm({ ...walkinForm, stylistId: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all bg-gray-50 appearance-none cursor-pointer"
                      >
                        <option value="">Select Stylist</option>
                        {staff.map(stylist => (
                          <option key={stylist._id} value={stylist._id}>{stylist.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price (₹)</label>
                      <input
                        type="number"
                        required
                        placeholder="Enter price"
                        value={walkinForm.price}
                        onChange={(e) => setWalkinForm({ ...walkinForm, price: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all bg-gray-50 placeholder:text-gray-400"
                      />
                    </div>
                  </>
                )}
              </form>
            </div>

            {/* Popup Footer - Pinned */}
            <div className="flex gap-3 p-6 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 px-6 rounded-xl transition-all active:scale-95"
                onClick={() => {
                  setShowNewPatientPopup(false);
                  setShowEmergencyPopup(false);
                }}
              >
                Cancel
              </button>
              <button
                form="receptionist-form"
                type="submit"
                className={`flex-1 ${showEmergencyPopup ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-primary hover:bg-secondary shadow-primary/20'} text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md active:scale-95`}
              >
                {showNewPatientPopup ? "Register Client" : "Add Walk-in"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Receptionist
