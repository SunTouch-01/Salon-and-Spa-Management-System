import React, { useState, useEffect } from 'react';
import KpiCard from '../../components/KpiCard';
import Chart from '../../components/Chart';
import LegendItem from '../../components/LegendItem';
import AppointmentRow from '../../components/AppointmentRow';
import CalendarWidget from '../../components/Calendar';
import ScheduleItem from '../../components/ScheduleItem';
import { useSalon } from '../../context/SalonContext';

function Dashboard() {
  const { selectedSalon } = useSalon();
  const [appointments, setAppointments] = useState([]);
  const [walkins, setWalkins] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, leave: 0 });
  const [dashboardStats, setDashboardStats] = useState({
    totalEarnings: 0,
    lastWeekEarnings: 0,
    weeklyTrend: '0%',
    topServices: []
  });
  const [weeklyExpenses, setWeeklyExpenses] = useState(0);

  useEffect(() => {
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
          const filteredData = selectedSalon
            ? data.filter(app => app.salonId?._id === selectedSalon._id || app.salonId === selectedSalon._id)
            : data;

          setAppointments(filteredData);
        }
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
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

  // Fetch Dashboard Stats
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:5050/appointments/dashboard-stats';
        if (selectedSalon) {
          url += `?salonId=${selectedSalon._id}`;
        }

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setDashboardStats(data);
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };
    fetchDashboardStats();
  }, [selectedSalon]);

  // Fetch Weekly Expenses
  useEffect(() => {
    const fetchWeeklyExpenses = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:5050/expenses/weekly';
        if (selectedSalon) {
          url += `?salonId=${selectedSalon._id}`;
        }

        const response = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setWeeklyExpenses(data.thisWeek || 0);
        }
      } catch (error) {
        console.error("Error fetching weekly expenses:", error);
      }
    };
    fetchWeeklyExpenses();
  }, [selectedSalon]);

  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const todaysAppointments = appointments.filter(app =>
    new Date(app.date).toDateString() === new Date().toDateString()
  );

  // Fetch Walkins
  useEffect(() => {
    const fetchWalkins = async () => {
      try {
        const token = localStorage.getItem('token');
        let url = 'http://localhost:5050/walkins';
        if (selectedSalon) {
          url += `?salonId=${selectedSalon._id}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setWalkins(data);
        }
      } catch (error) {
        console.error("Error fetching walkins:", error);
      }
    };
    fetchWalkins();
  }, [selectedSalon]);

  // Get today's walkins
  const todaysWalkins = walkins.filter(walkin =>
    new Date(walkin.date).toDateString() === new Date().toDateString()
  );

  // Combine today's appointments and walkins for upcoming section
  const todaysCombined = [
    ...todaysAppointments.map(app => ({ ...app, itemType: 'appointment' })),
    ...todaysWalkins.map(walkin => ({ ...walkin, itemType: 'walkin' }))
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
<>

    {/*'flex-col' for Mobile (stacks vertically), 'lg:flex-row' for Desktop (side-by-side) */}
    <div className="flex flex-col lg:flex-row gap-8 overflow-y-auto">
      {/* Left Column - Main Content */}
      <div className="flex-2 flex flex-col gap-6 w-full">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
          <p className="text-gray-500 text-sm">Welcome back, here is your daily overview.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KpiCard
            title="Total Earnings"
            value={`₹${dashboardStats.totalEarnings.toLocaleString()}`}
            trend={dashboardStats.weeklyTrend}
            isPositive={!dashboardStats.weeklyTrend.startsWith('-')}
            icon={<span className="text-2xl">💰</span>}
          />
          <KpiCard
            title="Earnings Last Week"
            value={`₹${dashboardStats.lastWeekEarnings.toLocaleString()}`}
            trend={dashboardStats.weeklyTrend}
            isPositive={!dashboardStats.weeklyTrend.startsWith('-')}
            icon={<span className="text-2xl">📉</span>}
          />
          <KpiCard
            title="Expenses This Week"
            value={`₹${weeklyExpenses.toLocaleString()}`}
            trend="0%"
            isPositive={true}
            icon={<span className="text-2xl">💸</span>}
          />
        </div>

        {/* Top Services Card (Replaces Client Age Group) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Services</h3>
          <div className="flex flex-col gap-4">
            {dashboardStats.topServices.map((service, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${index % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`}></div>
                  <span className="text-gray-700 font-medium">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${index % 2 === 0 ? 'bg-primary' : 'bg-secondary'}`}
                      style={{ width: `${service.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 min-w-12">{service.percentage}%</span>
                </div>
              </div>
            ))}
            {dashboardStats.topServices.length === 0 && (
              <p className="text-gray-400 text-sm">No service data available yet.</p>
            )}
          </div>
        </div>

        {/* Upcoming Appointments - Today's Appointments & Walkins */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-x-auto">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold text-gray-900">
              {selectedDate ? `Appointments for ${selectedDate.toLocaleDateString()}` : "Today's Appointments & Walkins"}
            </h3>
            {selectedDate ? (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Clear
              </button>
            ) : (
              <button className="text-primary font-medium text-sm hover:text-secondary transition-colors">View All</button>
            )}
          </div>
          <div className="flex flex-col gap-4 min-w-75">
            {selectedDate ? (
              // Show appointments for selected date
              appointments
              .filter(app => new Date(app.date).toDateString() === selectedDate.toDateString())
                .slice(0, 50)
                .map(app => (
                  <AppointmentRow
                    key={app._id}
                    name={app.clientName}
                    time={app.time ? new Date(`1970-01-01T${app.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                    date={new Date(app.date).toLocaleDateString()}
                    type={app.serviceId?.name || 'Service'}
                    />
                ))
                ) : (
              // Show today's combined appointments and walkins
              todaysCombined.slice(0, 5).map(item => (
                <AppointmentRow
                  key={item._id}
                  name={item.clientName}
                  time={item.time ? new Date(`1970-01-01T${item.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  date={new Date(item.date).toLocaleDateString()}
                  type={item.serviceId?.name || item.serviceId || 'Service'}
                  isWalkin={item.itemType === 'walkin'}
                />
              ))
            )}
            {todaysCombined.length === 0 && !selectedDate && (
              <p className="text-gray-500 text-sm text-center py-4">No appointments or walkins for today.</p>
            )}
            {selectedDate && appointments.filter(app => new Date(app.date).toDateString() === selectedDate.toDateString()).length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No appointments for this date.</p>
            )}
          </div>
        </div>


      </div>

      {/* Right Column - Calendar & Panel */}
      <div className="flex-1 w-full lg:min-w-75 flex flex-col gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
          <h3 className="text-lg font-semibold text-gray-900 mb-5">Calendar</h3>
          <CalendarWidget
            appointments={appointments}
            onDateClick={setSelectedDate}
            selectedDate={selectedDate}
          />

          <div className="mt-8 pt-5 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Schedule for {today}</h4>
            <div className="flex flex-col gap-4">
              {todaysAppointments.length > 0 ? (
                todaysAppointments.slice(0, 5).map((app, index) => (
                  <ScheduleItem
                    key={app._id}
                    time={app.time ? new Date(`1970-01-01T${app.time}`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                    title={`${app.clientName} - ${app.serviceId?.name || 'Service'}`}
                    color={index % 2 === 0 ? "var(--primary)" : "var(--secondary)"}
                  />
                ))
              ) : (
                <p className="text-gray-400 text-sm">No appointments scheduled for today.</p>
              )}
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-gray-100">
            <h4 className="text-xs font-bold text-gray-500 mb-4 uppercase tracking-wider">Staff Attendance</h4>
            <div className="text-sm text-gray-500 mb-2">
              <span className="font-semibold text-green-600">Present:</span> {attendanceStats.present} | <span className="font-semibold text-red-600">Absent:</span> {attendanceStats.absent} | <span className="font-semibold text-blue-600">Leave:</span> {attendanceStats.leave}
            </div>
            <a href="/dashboard/staff" className="text-primary text-sm hover:underline font-medium">Manage Attendance &rarr;</a>
          </div>
        </div>
      </div>

    </div>
                </>
  );
}

export default Dashboard;
