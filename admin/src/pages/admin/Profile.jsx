import React, { useState, useEffect } from 'react';
import InfoField from '../../components/InfoField';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';

function DashboardProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const userId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  const fetchProfileData = async () => {
    try {
      let userData = {};

      if (userId && role) {
        const response = await fetch(`http://localhost:5050/auth/me?userId=${userId}&role=${role}`);
        if (response.ok) {
          userData = await response.json();
        }
      }

        // Map backend data to frontend model
      const mappedData = {
        id: userData._id || '1',
        firstName: userData.name ? userData.name.split(' ')[0] : 'User',
        lastName: userData.name ? userData.name.split(' ').slice(1).join(' ') : '',
        role: (role || 'Staff').charAt(0).toUpperCase() + (role || 'Staff').slice(1),
        // Backend doesn't have age/gender/address yet, keep placeholders or show empty
        age: userData.age || '--',
        phone: userData.phone || userData.mobile || '',
        email: userData.email || '',
        // Use avatar from backend, fallback to default only if not available
        avatar: userData.avatarUrl || userData.avatar || 'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719858/Wavy_Buddies_-_Avatar_5_gdbuhf.webp',
        // Random/Default data for visual completeness until backend supports it
        preferences: 'Dry Scalp, Wavy Hair',
        notes: 'Prefer sulfate-free shampoo. Sensitive scalp.',
        dob: userData.dob ? new Date(userData.dob).toLocaleDateString() : '--',
        gender: userData.gender || 'N/A',
        address: userData.address || '',
        city: userData.city || '--',
        zipCode: userData.zipCode || '--',
        avatarUrl: userData.avatarUrl || userData.avatar || 'https://res.cloudinary.com/dgh9uunif/image/upload/v1768719858/Wavy_Buddies_-_Avatar_5_gdbuhf.webp',
        memberStatus: userData.isActive ? 'Active' : 'Active Member',
        registeredDate: userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        subscription: userData.subscription || {}
      };


      setProfile(mappedData);
      setEditFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || userData.mobile || '',
        dob: userData.dob ? userData.dob.split('T')[0] : '',
        gender: userData.gender || '',
        address: userData.address || '',
        city: userData.city || '',
        zipCode: userData.zipCode || '',
        avatarUrl: userData.avatarUrl || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        userId,
        role,
        ...editFormData
      };

      const response = await fetch('http://localhost:5050/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setIsEditing(false);
        fetchProfileData(); // Refresh data
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleInputChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };


  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg-light">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen">
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <FaEdit /> Edit Profile
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <FaTimes /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <FaSave /> Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Left Column - Profile Card (40%) */}
          <div className="w-full lg:w-1/3 bg-white rounded-2xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">

            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-secondary flex items-center justify-center mb-6 shadow-sm overflow-hidden ring-4 ring-accent-cream">
              <img src={profile.avatarUrl} alt={`${profile.firstName}'s avatar`} className="w-full h-full object-cover" />
            </div>

            {/* Name & Age */}
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">{profile.firstName} {profile.lastName}</h2>
            <p className="text-gray-500 font-medium mb-6">{profile.age} Years Old</p>

            {/* Mobile */}
            <div className="flex items-center gap-3 mb-8 text-gray-700 bg-accent-cream/50 px-5 py-2 rounded-full">
              <span role="img" aria-label="phone">📞</span>
              <span className="font-semibold text-sm">{profile.phone}</span>
            </div>

            {/* Preferences */}
            <div className="w-full mb-6">
              <p className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-2">Hair/Skin Preference</p>
              <div className="bg-accent-cream text-primary p-3 rounded-xl font-semibold text-center border border-accent-peach">
                {profile.preferences}
              </div>
            </div>

            {/* Notes */}
            <div className="w-full">
              <p className="text-xs uppercase text-gray-400 font-bold tracking-wider mb-2">Notes</p>
              <textarea
                className="w-full h-32 p-3 rounded-xl border border-accent-peach/50 resize-none text-sm text-gray-600 bg-bg-light focus:outline-none focus:ring-2 focus:ring-primary/20"
                defaultValue={profile.notes}
                disabled // Notes editing not requested on backend yet
              />
            </div>

          </div>

          {/* Right Column - Personal Information (60%) */}
          <div className="w-full lg:w-2/3 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-100">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {isEditing ? (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={editFormData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={editFormData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                    <input
                      type="text"
                      name="avatarUrl"
                      value={editFormData.avatarUrl}
                      onChange={handleInputChange}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phone"
                      value={editFormData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dob"
                      value={editFormData.dob}
                      onChange={handleInputChange}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={editFormData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      name="address"
                      value={editFormData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={editFormData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                    <input
                      type="text"
                      name="zipCode"
                      value={editFormData.zipCode}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </>
              ) : (
                <>
                  <InfoField label="First Name" value={profile.firstName} />
                  <InfoField label="Last Name" value={profile.lastName} />
                  <InfoField label="Role" value={profile.role} />
                  <InfoField label="Email Address" value={profile.email} />
                  <InfoField label="Phone" value={profile.phone} />
                  <InfoField label="Date of Birth" value={profile.dob} />
                  <InfoField label="Gender" value={profile.gender} />
                  <InfoField label="Address" value={profile.address} fullWidth />
                  <InfoField label="City" value={profile.city} />
                  <InfoField label="Zip Code" value={profile.zipCode} />
                  <InfoField label="Member Status" value={profile.memberStatus} />
                  <InfoField label="Registered Date" value={profile.registeredDate} />

                  <div className="md:col-span-2 mt-6 pt-6 border-t border-gray-100">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <InfoField label="Current Plan" value={profile.subscription?.planName || 'None'} />
                      <InfoField label="Billing Cycle" value={profile.subscription?.billingCycle || '--'} />
                      {profile.subscription?.planName === 'Demo Plan' && (
                        <InfoField
                          label="Trial Expiration"
                          value={profile.subscription?.trialEndDate ? new Date(profile.subscription.trialEndDate).toLocaleDateString() : 'N/A'}
                        />
                      )}
                      {profile.subscription?.planName === 'Demo Plan' && (
                        <InfoField
                          label="Days Remaining"
                          value={
                            profile.subscription?.trialEndDate
                              ? Math.max(0, Math.ceil((new Date(profile.subscription.trialEndDate) - new Date()) / (1000 * 60 * 60 * 24))) + ' Days'
                              : '--'
                          }
                        />
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default DashboardProfile;
