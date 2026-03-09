import React, { useState, useEffect } from 'react'
import { FaTimes, FaSearch, FaClock, FaCalendarAlt } from 'react-icons/fa';
import StaffTable from '../../components/tables/StaffTable';
import Attendance from '../../components/Attendance'; // Import the new component
import { useSalon } from '../../context/SalonContext';
import { getAllTabOptions, DEFAULT_TABS } from '../../config/roleConfig';

const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

function Staff() {
  const [staffList, setStaffList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { salons, selectedSalon } = useSalon();
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'attendance'

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'staff',
    profession: 'Stylist',
    mobile: '',
    email: '',
    password: 'password123',
    isActive: true,
    onLeave: false,
    salonId: '',
    avatarUrl: '',
    accessToTabs: [],
    services: [],
    salary: '',
    workingHours: allDays.map(day => ({
      day,
      startTime: '09:00',
      endTime: '18:00',
      isWorking: true
    }))
  });

  const [salonServices, setSalonServices] = useState([]);


  // Get all available tabs for checkbox display
  const allTabOptions = getAllTabOptions();

  const fetchStaff = async (salonId = '') => {
    try {
      const token = localStorage.getItem('token');
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
        setStaffList(data);
      } else {
        console.error('Failed to fetch staff');
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  useEffect(() => {
    if (selectedSalon) {
      fetchStaff(selectedSalon._id);
      fetchServices(selectedSalon._id);
    } else {
      fetchStaff();
      setSalonServices([]);
    }
  }, [selectedSalon]);

  const fetchServices = async (salonId) => {
    try {
      const res = await fetch(`http://localhost:5050/services?salonId=${salonId}`);
      if (res.ok) {
        const data = await res.json();
        setSalonServices(data);
      }
    } catch (err) {
      console.error("Error fetching services:", err);
    }
  };


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'role') {
      const defaultTabs = DEFAULT_TABS[value] || DEFAULT_TABS.staff;
      setFormData(prev => ({
        ...prev,
        [name]: value,
        accessToTabs: defaultTabs
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleWorkingHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      workingHours: prev.workingHours.map(wh => 
        wh.day === day ? { ...wh, [field]: value } : wh
      )
    }));
  };

  const handleTabAccessChange = (tabId, isChecked) => {
    setFormData(prev => {
      const currentTabs = prev.accessToTabs || [];
      if (isChecked) {
        return { ...prev, accessToTabs: [...currentTabs, tabId] };
      } else {
        return { ...prev, accessToTabs: currentTabs.filter(t => t !== tabId) };
      }
    });
  };

  const handleServiceChange = (serviceId, isChecked) => {
    setFormData(prev => {
      const currentServices = prev.services || [];
      if (isChecked) {
        return { ...prev, services: [...currentServices, serviceId] };
      } else {
        return { ...prev, services: currentServices.filter(id => id !== serviceId) };
      }
    });
  };

  const handleEdit = (staff) => {
    setFormData({
      ...staff,
      password: '',
      salonId: staff.salonId?._id || staff.salonId,
      avatarUrl: staff.avatarUrl || '',
      accessToTabs: staff.accessToTabs || DEFAULT_TABS[staff.role] || [],
      services: staff.services?.map(s => s._id || s) || [],
      salary: staff.salary || '',
      workingHours: staff.workingHours || allDays.map(day => ({
        day,
        startTime: '09:00',
        endTime: '18:00',
        isWorking: true
      }))
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5050/staff/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        fetchStaff(selectedSalon?._id);
      } else {
        console.error('Failed to delete staff');
      }
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;

      const method = formData._id ? 'PUT' : 'POST';
      const url = formData._id
        ? `http://localhost:5050/staff/${formData._id}`
        : 'http://localhost:5050/staff';

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        fetchStaff(selectedSalon?._id);
        setIsModalOpen(false);
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Failed to save staff: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Error saving staff: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: 'staff',
      profession: 'Stylist',
      mobile: '',
      email: '',
      password: 'password123',
      isActive: true,
      onLeave: false,
      salonId: selectedSalon?._id || '',
      avatarUrl: '',
      accessToTabs: DEFAULT_TABS.staff,
      services: [],
      salary: '',
      workingHours: allDays.map(day => ({
        day,
        startTime: '09:00',
        endTime: '18:00',
        isWorking: true
      }))
    });
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const filteredStaff = staffList.filter(staff => {
    const searchLower = searchTerm.toLowerCase();
    return (
      staff.name?.toLowerCase().includes(searchLower) ||
      staff.email?.toLowerCase().includes(searchLower) ||
      staff.mobile?.includes(searchTerm) ||
      staff.profession?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Staff Management</h1>
            <p className="text-gray-500 mt-1">Manage your salon team, roles, and attendance.</p>
          </div>

          <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'list'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Staff List
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'attendance'
                ? 'bg-gray-900 text-white shadow-md'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
            >
              Attendance
            </button>
          </div>
        </div>

        {/* Action Bar (Search & Add Button) */}
        {activeTab === 'list' && (
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="relative w-full sm:max-w-md">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border-none rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all shadow-inner"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-200 rounded-full transition-colors"
                >
                  <FaTimes size={12} />
                </button>
              )}
            </div>

            <button
              onClick={openAddModal}
              className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex items-center justify-center gap-2"
            >
              <span>+ Add Staff Member</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-125">
          {activeTab === 'list' ? (
            <div className="p-1">
              <StaffTable staffList={filteredStaff} onEdit={handleEdit} onDelete={handleDelete} />
            </div>
          ) : (
            <div className="p-6">
              <Attendance />
            </div>
          )}
        </div>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{formData._id ? 'Edit Staff Profile' : 'New Staff Member'}</h2>
                <p className="text-sm text-gray-500 mt-1">Enter the details for the staff member below.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <FaTimes size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
              <form id="staff-form" onSubmit={handleSubmit} className="p-8 space-y-6">

                {/* Avatar & Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Avatar URL</label>
                    <input
                      type="text"
                      name="avatarUrl"
                      placeholder="https://example.com/avatar.jpg"
                      value={formData.avatarUrl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Role</label>
                    <div className="relative">
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="staff">Staff Member</option>
                        <option value="receptionist">Receptionist</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Profession/Title</label>
                    <div className="relative">
                      <select
                        name="profession"
                        value={formData.profession}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="Stylist">Stylist</option>
                        <option value="Barber">Barber</option>
                        <option value="Masseuse">Masseuse</option>
                        <option value="Beautician">Beautician</option>
                        <option value="Nail Technician">Nail Technician</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Assigned Branch</label>
                    <div className="relative">
                      <select
                        name="salonId"
                        value={formData.salonId}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                      >
                        <option value="">Select Branch</option>
                        {salons.map(salon => (
                          <option key={salon._id} value={salon._id}>{salon.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z" /></svg>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Monthly Salary (₹)</label>
                    <input
                      type="number"
                      name="salary"
                      placeholder="e.g. 25000"
                      value={formData.salary}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Working Hours Section */}
                <div className="border-t border-gray-100 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FaClock className="text-primary" />
                    <h3 className="text-lg font-bold text-gray-900">Working Hours</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.workingHours?.map((wh) => (
                      <div key={wh.day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <label className="flex items-center gap-2 min-w-[100px]">
                          <input
                            type="checkbox"
                            checked={wh.isWorking}
                            onChange={(e) => handleWorkingHoursChange(wh.day, 'isWorking', e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <span className={`text-sm font-medium ${wh.isWorking ? 'text-gray-900' : 'text-gray-400'}`}>
                            {wh.day}
                          </span>
                        </label>
                        
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={wh.startTime}
                            onChange={(e) => handleWorkingHoursChange(wh.day, 'startTime', e.target.value)}
                            disabled={!wh.isWorking}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-400"
                          />
                          <span className="text-gray-400">to</span>
                          <input
                            type="time"
                            value={wh.endTime}
                            onChange={(e) => handleWorkingHoursChange(wh.day, 'endTime', e.target.value)}
                            disabled={!wh.isWorking}
                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Permissions & Status */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-700">Status</span>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.onLeave ? 'bg-amber-400' : 'bg-gray-200'}`}>
                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-300 ${formData.onLeave ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-600 group-hover:text-amber-600 transition-colors">On Leave</span>
                      <input type="checkbox" name="onLeave" checked={formData.onLeave} onChange={handleInputChange} className="hidden" />
                    </label>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700">Access Permissions</label>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                      {allTabOptions.map(tab => (
                        <label key={tab.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.accessToTabs?.includes(tab.id) || false}
                              onChange={(e) => handleTabAccessChange(tab.id, e.target.checked)}
                              className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-primary checked:bg-primary"
                            />
                            <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600 font-medium">{tab.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {formData.role === 'staff' && (
                    <div className="space-y-3 mt-6">
                      <label className="text-sm font-semibold text-gray-700">Offered Services</label>
                      <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50/80 rounded-xl border border-gray-100 max-h-48 overflow-y-auto scrollbar-hide">
                        {salonServices.length > 0 ? (
                          salonServices.map(service => (
                            <label key={service._id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer">
                              <div className="relative flex items-center">
                                <input
                                  type="checkbox"
                                  checked={formData.services?.includes(service._id) || false}
                                  onChange={(e) => handleServiceChange(service._id, e.target.checked)}
                                  className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-gray-300 transition-all checked:border-primary checked:bg-primary"
                                />
                                <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100">
                                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </div>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm text-gray-600 font-semibold">{service.name}</span>
                                <span className="text-xs text-gray-400">
                                  {service.price ? `₹${service.price}` : (
                                    <>
                                      {service.gender === 'unisex' && `₹${service.priceUnisex}`}
                                      {service.gender === 'male' && `M: ₹${service.priceMale}`}
                                      {service.gender === 'female' && `F: ₹${service.priceFemale}`}
                                      {service.gender === 'both' && `M: ₹${service.priceMale} / F: ₹${service.priceFemale}`}
                                    </>
                                  )}
                                </span>
                              </div>
                            </label>
                          ))
                        ) : (
                          <p className="text-sm text-gray-400 italic p-2">No services found for this salon.</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Footer Buttons - Pinned */}
            <div className="flex justify-end gap-3 p-8 border-t border-gray-100 sticky bottom-0 bg-white">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-2.5 text-gray-600 font-bold bg-gray-100 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                form="staff-form"
                type="submit"
                className="px-8 py-2.5 bg-gray-900 text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 active:scale-95"
              >
                {formData._id ? 'Save Changes' : 'Create Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Staff;
