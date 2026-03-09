import React, { useState, useEffect } from 'react';
import DashboardSidebar from '../../components/DashboardSidebar';
import ChangePasswordModal from '../../components/modals/ChangePasswordModal';
import DeleteAccountModal from '../../components/modals/DeleteAccountModal';
import SalonModal from '../../components/modals/SalonModal';
import PlanLimitModal from '../../components/modals/PlanLimitModal';
import ResizableTh from '../../components/ResizableTh';
import { useSalon } from '../../context/SalonContext';
import { FaEdit, FaTrash } from 'react-icons/fa';

function Settings() {
  const { branchLimit } = useSalon();
  const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
  const [user, setUser] = useState({
    name: '',
    contact: '',
    email: '',
    subscription: null
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');
      if (userId && role) {
        try {
          const response = await fetch(`http://localhost:5050/auth/me?userId=${userId}&role=${role}`);
          if (response.ok) {
            const data = await response.json();
            setUser({
              name: data.name || '',
              contact: data.phone || data.mobile || '',
              email: data.email || '',
              subscription: data.subscription || null
            });
          }
        } catch (error) {
          console.error("Error fetching user settings:", error);
        }
      }
    };
    fetchUserData();
  }, []);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSalonModalOpen, setIsSalonModalOpen] = useState(false);
  const [editingSalon, setEditingSalon] = useState(null);

  const [salons, setSalons] = useState([]);
  const [message, setMessage] = useState('');
  const [userRole, setUserRole] = useState(localStorage.getItem('role'));

  // Update role on mount in case it changed (though unlikely without reload)
  useEffect(() => {
    setUserRole(localStorage.getItem('role'));
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (field) => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (!userId || !role) {
      alert('User not authenticated');
      return;
    }

    try {
      const response = await fetch('http://localhost:5050/auth/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          role,
          name: user.name,
          email: user.email,
          phone: user.contact
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert('Profile updated successfully');
        // Optionally refresh the user data
        const fetchUserData = async () => {
          try {
            const response = await fetch(`http://localhost:5050/auth/me?userId=${userId}&role=${role}`);
            if (response.ok) {
              const data = await response.json();
              setUser({
                name: data.name || '',
                contact: data.phone || data.mobile || '',
                email: data.email || '',
                subscription: data.subscription || null
              });
            }
          } catch (error) {
            console.error("Error fetching user settings:", error);
          }
        };
        fetchUserData();
      } else {
        alert(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  const handleChangePasswordSubmit = async (passwordData) => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const { currentPassword, newPassword } = passwordData;

    try {
      const response = await fetch('http://localhost:5050/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setIsPasswordModalOpen(false);
      } else {
        alert(data.message || 'Failed to change password');
      }
    } catch (error) {
      console.error("Error changing password:", error);
      alert('An error occurred while changing password');
    }
  };

  const handleDeleteAccount = async (password) => {
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');

    try {
      const response = await fetch('http://localhost:5050/auth/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        localStorage.clear();
        window.location.href = '/login';
      } else {
        alert(data.message || 'Failed to delete account');
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert('An error occurred while deleting account');
    }
    setIsDeleteModalOpen(false);
  };

  const handleSalonModalSubmit = async (salonData) => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      let url = 'http://localhost:5050/salons';
      let method = 'POST';
      let payload = { ...salonData, ownerId: userId };

      if (editingSalon) {
        url = `http://localhost:5050/salons/${editingSalon._id}`;
        method = 'PUT';
        // OwnerId doesn't generally change, but can keep payload similar or sanitize
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(editingSalon ? 'Salon updated successfully!' : 'Salon added successfully!');
        setIsSalonModalOpen(false);
        setEditingSalon(null);
        fetchSalons(); // Refresh the salons list
      } else {
        setMessage(result.message || 'Failed to save salon');
      }
    } catch (error) {
      console.error('Error saving salon:', error);
      setMessage('Failed to save salon');
    }
  };

  const handleEditSalon = (salon) => {
    setEditingSalon(salon);
    setIsSalonModalOpen(true);
  };

  const handleDeleteSalon = async (salonId) => {
    if (!window.confirm("Are you sure you want to delete this salon? All associated staff and appointments will also be deleted.")) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5050/salons/${salonId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchSalons();
        setMessage("Salon deleted successfully");
      } else {
        setMessage("Failed to delete salon");
      }
    } catch (error) {
      console.error("Error deleting salon:", error);
    }
  };

  const fetchSalons = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const role = localStorage.getItem('role');

      let response;
      if (role === 'owner') {
        // Owners fetch all their salons
        response = await fetch(`http://localhost:5050/salons?ownerId=${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } else {
        // Staff/Receptionist fetch their own details to get assigned salon
        response = await fetch(`http://localhost:5050/auth/me?userId=${userId}&role=${role}`);
        if (response.ok) {
          const staffData = await response.json();
          if (staffData.salonId) {
            // Extract salon ID (could be string or populated object)
            const salonIdString = typeof staffData.salonId === 'object'
              ? staffData.salonId._id
              : staffData.salonId;

            // Fetch the salon details
            const salonResponse = await fetch(`http://localhost:5050/salons/${salonIdString}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            if (salonResponse.ok) {
              const salonData = await salonResponse.json();
              setSalons([salonData]); // Wrap in array for consistent rendering
              return;
            }
          } else {
            setSalons([]); // No salon assigned
            return;
          }
        }
      }

      if (response && response.ok) {
        const data = await response.json();
        setSalons(data);
      }
    } catch (error) {
      console.error('Error fetching salons:', error);
    }
  };

  useEffect(() => {
    fetchSalons();
  }, []);

  return (
    <div className="flex min-h-screen font-sans bg-linear-to-br from-bg-light to-accent-cream">
      <DashboardSidebar />

      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and security preferences.</p>
          </div>

          <div className="space-y-6">

            {/* Plan Details Card */}
            {user.subscription && user.subscription.planName ? (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_40px_rgba(147,129,255,0.15)] transition-transform duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-primary">Current Plan</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${user.subscription.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.subscription.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Plan Name</p>
                    <p className="text-lg font-bold text-gray-800">{user.subscription.planName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Branch Limit</p>
                    <p className="text-lg font-bold text-gray-800">
                      {salons.length} / {user.subscription.branchLimit} Branches Used
                    </p>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${(salons.length / user.subscription.branchLimit) >= 1 ? 'bg-red-500' : 'bg-primary'}`}
                        style={{ width: `${Math.min((salons.length / user.subscription.branchLimit) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Billing</p>
                    <p className="text-lg font-bold text-gray-800">₹{user.subscription.price} / {user.subscription.billingCycle}</p>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => window.location.href = '/plans-and-pricing'}
                      className="px-6 py-3 bg-secondary text-gray-900 font-bold rounded-xl hover:bg-[#ffcca8] transition-colors shadow-sm w-full md:w-auto"
                    >
                      Upgrade / Change Plan
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_40px_rgba(147,129,255,0.15)] transition-transform duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-primary">Current Plan</h2>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                    No Plan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Plan Name</p>
                    <p className="text-lg font-bold text-gray-800">None</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Branch Limit</p>
                    <p className="text-lg font-bold text-gray-800">
                      {salons.length} / 0 Branches Used
                    </p>
                    <div className="w-full bg-gray-200 h-2 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-gray-400" style={{ width: '0%' }}></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Billing</p>
                    <p className="text-lg font-bold text-gray-800">--</p>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={() => window.location.href = '/plans-and-pricing'}
                      className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-[#7a67e0] transition-colors shadow-sm w-full md:w-auto"
                    >
                      Subscribe Now
                    </button>
                  </div>
                </div>
              </div>
            )}


            {/* Account Details Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_40px_rgba(147,129,255,0.15)] transition-transform duration-300 hover:-translate-y-1">
              <h2 className="text-xl font-semibold text-primary mb-6">Account Details</h2>

              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
                {['name', 'contact', 'email'].map((field) => (
                  <div key={field} className="flex flex-col gap-2">
                    <label className="text-sm font-medium text-gray-700 capitalize">{field}</label>
                    <div className="flex gap-2">
                      <input
                        type={field === 'email' ? 'email' : 'text'}
                        name={field}
                        value={user[field]}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-secondary bg-bg-light text-sm focus:outline-none focus:border-primary transition-colors"
                      />
                      <button
                        onClick={() => handleUpdate(field)}
                        className="px-4 py-2 bg-primary text-white rounded-xl hover:bg-[#7a67e0] transition-colors shadow-sm"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_40px_rgba(147,129,255,0.15)] transition-transform duration-300 hover:-translate-y-1">
              <h2 className="text-xl font-semibold text-primary mb-6">Security</h2>
              <button
                onClick={() => setIsPasswordModalOpen(true)}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-colors font-medium"
              >
                Change Password
              </button>
            </div>

            {/* 2FA Card (Highlight Theme) */}
            <div className="bg-linear-to-br from-secondary to-accent-peach rounded-2xl p-6 shadow-[0_20px_40px_rgba(147,129,255,0.15)] transition-transform duration-300 hover:-translate-y-1">
              <h2 className="text-xl font-semibold text-white mb-2">🛡 Two-Factor Authentication</h2>
              <p className="text-white/90 mb-4">Enable OTP verification for enhanced security.</p>
              <button className="px-6 py-3 bg-white text-primary border-2 border-primary rounded-xl hover:bg-gray-50 transition-colors font-semibold">
                Enable 2FA
              </button>
            </div>

            {/* Active Sessions */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_40px_rgba(147,129,255,0.15)] transition-transform duration-300 hover:-translate-y-1">
              <h2 className="text-xl font-semibold text-primary mb-6">💻 Active Sessions</h2>

              <div className="flex justify-between items-center bg-bg-light p-4 rounded-xl mb-4">
                <span className="font-medium text-gray-700">Windows · Chrome</span>
                <span className="text-primary font-bold">Active</span>
              </div>

              <button 
                onClick={() => {
                  localStorage.removeItem('userId');
                  localStorage.removeItem('token');
                  localStorage.removeItem('role');
                  localStorage.removeItem('accessToTabs');
                  window.location.href = '/login';
                }}
                className="px-6 py-3 bg-accent-peach text-gray-800 rounded-xl hover:bg-[#ffcca8] transition-colors font-medium"
              >
                Logout from all devices
              </button>

            </div>

            {/* Login History Table */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_40px_rgba(147,129,255,0.15)] transition-transform duration-300 hover:-translate-y-1 overflow-hidden">
              <h2 className="text-xl font-semibold text-primary mb-6">📊 Login Activity</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse mt-2">
                  <thead>
                    <tr>
                      <ResizableTh className="p-3 bg-secondary text-gray-800 rounded-l-lg text-sm font-semibold uppercase">Device</ResizableTh>
                      <ResizableTh className="p-3 bg-secondary text-gray-800 text-sm font-semibold uppercase">Browser</ResizableTh>
                      <ResizableTh className="p-3 bg-secondary text-gray-800 text-sm font-semibold uppercase">IP</ResizableTh>
                      <ResizableTh className="p-3 bg-secondary text-gray-800 rounded-r-lg text-sm font-semibold uppercase">Date</ResizableTh>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    {/* Add spacing between rows using transparent borders or separate divs if needed, 
                        but standard table padding works here */}
                    <tr className="hover:bg-accent-cream transition-colors group">
                      <td className="p-3 bg-bg-light rounded-l-lg mt-2 group-hover:bg-accent-cream">Windows</td>
                      <td className="p-3 bg-bg-light group-hover:bg-accent-cream">Chrome</td>
                      <td className="p-3 bg-bg-light group-hover:bg-accent-cream">192.168.1.2</td>
                      <td className="p-3 bg-bg-light rounded-r-lg group-hover:bg-accent-cream">30 Jan 2026</td>
                    </tr>
                    <tr className="block h-2"></tr> {/* Spacer */}
                    <tr className="hover:bg-accent-cream transition-colors group">
                      <td className="p-3 bg-bg-light rounded-l-lg group-hover:bg-accent-cream">Android</td>
                      <td className="p-3 bg-bg-light group-hover:bg-accent-cream">Edge</td>
                      <td className="p-3 bg-bg-light group-hover:bg-accent-cream">192.168.1.8</td>
                      <td className="p-3 bg-bg-light rounded-r-lg group-hover:bg-accent-cream">29 Jan 2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Salon Section - Only for Owners */}
            {userRole === 'owner' && (
              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_40px_rgba(147,129,255,0.15)] transition-transform duration-300 hover:-translate-y-1">
                <h2 className="text-xl font-semibold text-primary mb-6">🏢 Salon Management</h2>
                <button
                  onClick={() => {
                    if (salons.length >= branchLimit) {
                      setIsLimitModalOpen(true);
                    } else {
                      setEditingSalon(null);
                      setIsSalonModalOpen(true);
                    }
                  }}
                  disabled={!user.subscription || !user.subscription.planName}
                  className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                    !user.subscription || !user.subscription.planName
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary text-white hover:bg-[#7a67e0]'
                  }`}
                >
                  Add Salon
                </button>
                {(!user.subscription || !user.subscription.planName) && (
                  <p className="text-sm text-red-500 mt-2">
                    Please subscribe to a plan to add salons.
                  </p>
                )}
              </div>
            )}


            {/* My Branch Section */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-6 shadow-[0_20px_40px_rgba(147,129,255,0.15)] transition-transform duration-300 hover:-translate-y-1 overflow-hidden">
              <h2 className="text-xl font-semibold text-primary mb-6">
                🏢 {userRole === 'owner' ? 'My Branches' : 'My Branch'}
              </h2>

              {salons.length === 0 ? (
                <p className="text-gray-600">
                  {userRole === 'owner' ? 'No salons added yet.' : 'No branch assigned yet.'}
                </p>
              ) : (
                <div className="space-y-4">
                  {salons.map((salon) => (
                    <div key={salon._id} className="bg-bg-light p-4 rounded-xl relative group">
                      {/* Edit/Delete buttons - Only for Owners */}
                      {userRole === 'owner' && (
                        <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEditSalon(salon)}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                            title="Edit Branch"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteSalon(salon._id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete Branch"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                      <div className="flex justify-between items-start mb-2 {userRole === 'owner' ? 'pr-20' : ''}">
                        <h3 className="font-semibold text-primary">{salon.name}</h3>
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">{salon.type}</span>
                      </div>
                      <p className="text-gray-700 mb-1"><strong>Address:</strong> {salon.address}</p>
                      <p className="text-gray-700 mb-1"><strong>Branch Area:</strong> {salon.branchArea}</p>
                      <p className="text-gray-700 mb-1"><strong>Pincode:</strong> {salon.pincode}</p>
                      <p className="text-gray-700 mb-1"><strong>Contact:</strong> {salon.contactNumber}</p>
                      <p className="text-gray-700 mb-1"><strong>Phone:</strong> {salon.phoneNumber}</p>
                      {salon.description && (
                        <p className="text-gray-700 mb-1"><strong>Description:</strong> {salon.description}</p>
                      )}
                      {salon.createdAt && (
                        <p className="text-sm text-gray-500">Added on: {new Date(salon.createdAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  ))
                  }
                </div>
              )}
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
              <h2 className="text-xl font-semibold text-red-600 mb-2">Danger Zone</h2>
              <p className="text-gray-500 text-sm mb-6">Once you delete your account, there is no going back. Please be certain.</p>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-xl hover:bg-red-100 transition-colors font-medium"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSubmit={handleChangePasswordSubmit}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
      />

      <SalonModal
        isOpen={isSalonModalOpen}
        onClose={() => { setIsSalonModalOpen(false); setEditingSalon(null); }}
        onSubmit={handleSalonModalSubmit}
        initialData={editingSalon}
      />

      <PlanLimitModal
        isOpen={isLimitModalOpen}
        onClose={() => setIsLimitModalOpen(false)}
        currentLimit={branchLimit}
      />
    </div>
  )
}

export default Settings;
