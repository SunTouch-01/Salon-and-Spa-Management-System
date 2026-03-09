import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'staff' // Default role
  });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleRoleChange = (role) => {
    setFormData({ ...formData, role });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("=== FRONTEND LOGIN DEBUG ===");
      console.log("Form Data being sent:", formData);

      const response = await fetch('http://localhost:5050/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      const data = await response.json();
      console.log("Response data:", data);

      if (response.ok) {
        localStorage.setItem('token', data.token); // Store the JWT token
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('role', data.role); // Store the role
        // Store accessToTabs for role-based navigation
        localStorage.setItem('accessToTabs', JSON.stringify(data.accessToTabs));
        if (data.salonId) {
          localStorage.setItem('salonId', data.salonId);
        }
        navigate('/dashboard');
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("An error occurred during login");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-24 p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Welcome Back</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm text-center">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Role Selection */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            type="button"
            onClick={() => handleRoleChange('owner')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${formData.role === 'owner'
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Owner
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('staff')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${formData.role === 'staff'
              ? 'bg-primary text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Staff
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
            placeholder="Enter your password"
            required
          />
        </div>
        <button type="submit" className="w-full bg-primary hover:bg-secondary text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 mt-2">
          Login as {formData.role === 'owner' ? 'Owner' : 'Staff'}
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account? <a href="/signup" className="text-primary hover:text-secondary font-medium">Sign up</a>
        </p>
      </form>
    </div>
  );
}


export default LoginForm
