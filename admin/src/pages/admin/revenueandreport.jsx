import React, { useState, useEffect } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Legend } from 'recharts';
import RevenueTable from '../../components/tables/RevenueTable';
import { useSalon } from '../../context/SalonContext';

const RevenueReport = () => {
  const { selectedSalon } = useSalon();
  const [stylists, setStylists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [salaryInput, setSalaryInput] = useState('');
  const [loading, setLoading] = useState(true);

  // Report State
  const [reportPeriod, setReportPeriod] = useState('monthly'); // weekly, monthly, annually
  const [reportData, setReportData] = useState({
    bookings: [],
    clients: [],
    revenue: []
  });

  // Fetch Reports Data
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = selectedSalon
          ? `http://localhost:5050/reports?period=${reportPeriod}&salonId=${selectedSalon._id}`
          : `http://localhost:5050/reports?period=${reportPeriod}`;

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setReportData({
            bookings: data.bookings,
            clients: data.clients,
            revenue: data.revenue
          });
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      }
    };
    fetchReports();
  }, [selectedSalon, reportPeriod]);

  // Fetch appointments (for table calculations)
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const token = localStorage.getItem('token');
        const url = selectedSalon
          ? `http://localhost:5050/appointments?salonId=${selectedSalon._id}`
          : 'http://localhost:5050/appointments';
        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAppointments(data);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [selectedSalon]);

  // Fetch staff and calculate appointment counts
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        setLoading(true);
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
          // Filter for stylists if needed, or just show all staff
          const mappedData = data.map((staff, index) => {
            // Count completed appointments for this stylist
            const completedCount = appointments.filter(
              apt => apt.staffId?._id === staff._id && apt.status === 'completed'
            ).length;

            return {
              id: index + 1,
              realId: staff._id,
              name: staff.name,
              status: staff.isActive ? 'Active' : 'Inactive',
              cases: completedCount,
              salary: staff.salary ? `₹${staff.salary.toLocaleString()}` : '₹0'
            };
          });
          setStylists(mappedData);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStaff();
  }, [selectedSalon, appointments]);

  const handleEditSalary = (staff) => {
    setSelectedStaff(staff);
    setSalaryInput('');
    setShowSalaryModal(true);
  };

  const handleSaveSalary = async () => {
    if (!salaryInput || isNaN(salaryInput)) {
      alert('Please enter a valid salary amount');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5050/staff/${selectedStaff.realId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ salary: parseFloat(salaryInput) })
      });

      if (response.ok) {
        // Refresh staff list
        const url = selectedSalon
          ? `http://localhost:5050/staff?salonId=${selectedSalon._id}`
          : 'http://localhost:5050/staff';
        const staffResponse = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (staffResponse.ok) {
          const data = await staffResponse.json();
          const mappedData = data.map((staff, index) => {
            const completedCount = appointments.filter(
              apt => apt.staffId?._id === staff._id && apt.status === 'completed'
            ).length;

            return {
              id: index + 1,
              realId: staff._id,
              name: staff.name,
              status: staff.isActive ? 'Active' : 'Inactive',
              cases: completedCount,
              salary: staff.salary ? `₹${staff.salary.toLocaleString()}` : '₹0'
            };
          });
          setStylists(mappedData);
        }
        setShowSalaryModal(false);
        alert('Salary updated successfully!');
      } else {
        alert('Failed to update salary');
      }
    } catch (error) {
      console.error('Error updating salary:', error);
      alert('Error updating salary');
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return '₹0';
    if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else if (value >= 1000) {
      return `₹${(value / 1000).toFixed(1)}K`;
    }
    return `₹${value.toLocaleString()}`;
  };

  const totalRevenue = reportData.revenue.reduce((acc, curr) => acc + curr.amount, 0);
  const totalBookings = reportData.bookings.reduce((acc, curr) => acc + curr.count, 0);
  const totalClients = reportData.clients.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="min-h-screen pb-10">
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-1 flex">
            {['weekly', 'monthly', 'annually'].map((period) => (
              <button
                key={period}
                onClick={() => setReportPeriod(period)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${reportPeriod === period
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium uppercase">Total Revenue ({reportPeriod})</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">{formatCurrency(totalRevenue)}</h2>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium uppercase">Total Appointments</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">{totalBookings}</h2>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <p className="text-gray-500 text-sm font-medium uppercase">New Clients</p>
            <h2 className="text-3xl font-bold text-gray-900 mt-2">{totalClients}</h2>
          </div>
        </div>

        {/* CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue Trend</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.revenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      if (reportPeriod === 'annually') return date.toLocaleDateString('en-US', { month: 'short' });
                      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line type="monotone" dataKey="amount" stroke="#9381ff" strokeWidth={3} dot={{ r: 4, fill: '#9381ff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bookings & Clients Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Appointments & Clients</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.bookings}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      if (reportPeriod === 'annually') return date.toLocaleDateString('en-US', { month: 'short' });
                      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
                    }}
                  />
                  <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} />
                  <Tooltip labelFormatter={(label) => new Date(label).toLocaleDateString()} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" name="Appointments" fill="#b8b8ff" radius={[4, 4, 0, 0]} />
                  {/* Merging Client Data into same chart might require mapping if dates align perfectly, 
                                 otherwise separate charts or just showing appointments here is fine for now. 
                                 Let's simplisticly show Bookings here. */}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>


        {/* FILTER BAR REMOVED/SIMPLIFIED as main filter is at top */}

        <h2 className="text-2xl font-bold text-gray-900 mb-6 border-t pt-8">Staff Performance</h2>
        {/* TABLE */}
        {loading ? (
          <div className="bg-white rounded-xl p-8 text-center text-gray-500">Loading staff data...</div>
        ) : (
          <RevenueTable stylists={stylists} onEditSalary={handleEditSalary} />
        )}
      </div>

      {/* Salary Edit Modal */}
      {showSalaryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 relative shadow-xl">
            <button
              onClick={() => setShowSalaryModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-2xl"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Salary</h2>
            <p className="text-gray-600 mb-4">Update salary for <span className="font-semibold">{selectedStaff?.name}</span></p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Annual Salary (₹)</label>
              <input
                type="number"
                value={salaryInput}
                onChange={(e) => setSalaryInput(e.target.value)}
                placeholder="Enter salary amount"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveSalary}
                className="flex-1 bg-primary hover:bg-secondary text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Save
              </button>
              <button
                onClick={() => setShowSalaryModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}

function StatCard({ title, value, trend, data, color }) {
  const isPositive = trend.includes('↑');

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border flex flex-col justify-between h-62.5 transform hover:scale-[1.02] transition-transform duration-300 ">
      <div>
        <p className="text-gray-500 text-sm font-medium uppercase tracking-wide ">{title}</p>
        <div className="flex items-baseline gap-2 mt-2">
          <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
          <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${isPositive ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'
            }`}>{trend}</span>
        </div>
      </div>
      <div className="w-full h-30 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              interval="preserveStartEnd"
              hide={true}
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
              cursor={{ stroke: '#d1d5db', strokeWidth: 1 }}
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Value']}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color || "#9381ff"}
              strokeWidth={4}
              dot={{ r: 4, fill: color, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: color, stroke: 'white', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default RevenueReport;
