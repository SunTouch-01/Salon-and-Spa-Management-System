import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaSave, FaClock, FaList, FaChevronLeft, FaChevronRight, FaChartBar } from 'react-icons/fa';
import { Calendar, CalendarDayButton } from './ui/calendar';
import { cn } from '../lib/utils';
import { useSalon } from '../context/SalonContext';

const Attendance = () => {
    const { selectedSalon } = useSalon();
    const userRole = localStorage.getItem('role');

    const [viewMode, setViewMode] = useState('table'); // 'table', 'calendar', or 'reports'

    // Table View State
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceData, setAttendanceData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const canEdit = userRole === 'receptionist' || userRole === 'owner' || userRole === 'admin';

    // Calendar View State
    const [staffList, setStaffList] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('');
    const [monthlyAttendance, setMonthlyAttendance] = useState([]);
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // Reports View State
    const [reportType, setReportType] = useState('monthly'); // 'weekly', 'monthly', 'yearly'
    const [reportData, setReportData] = useState(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [selectedReportStaff, setSelectedReportStaff] = useState('');
    
    // Get current date info for defaults
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    // Calculate current week number
    const startOfYear = new Date(currentYear, 0, 1);
    const pastDays = (currentDate - startOfYear) / 86400000;
    const currentWeek = Math.ceil((pastDays + startOfYear.getDay() + 1) / 7);
    
    const [reportMonth, setReportMonth] = useState(currentMonth);
    const [reportYear, setReportYear] = useState(currentYear);
    const [reportWeek, setReportWeek] = useState(currentWeek);




    useEffect(() => {
        if (selectedSalon) {
            if (viewMode === 'table') {
                fetchDailyAttendance();
            } else if (viewMode === 'calendar') {
                fetchStaffList();
            } else if (viewMode === 'reports') {
                fetchStaffListForReports();
            }
        }
    }, [selectedSalon, selectedDate, viewMode]);

    useEffect(() => {
        if (viewMode === 'calendar' && selectedStaff && selectedSalon) {
            fetchMonthlyAttendance(selectedStaff, calendarMonth);
        }
    }, [selectedStaff, calendarMonth, viewMode, selectedSalon]);

    useEffect(() => {
        if (viewMode === 'reports' && selectedReportStaff && selectedSalon) {
            fetchAttendanceReport();
        }
    }, [reportType, selectedReportStaff, reportMonth, reportYear, reportWeek, viewMode, selectedSalon]);


    // --- API Calls ---

    const fetchDailyAttendance = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(
                `http://localhost:5050/attendance/daily?salonId=${selectedSalon._id}&date=${selectedDate}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setAttendanceData(data);
            }
        } catch (error) {
            console.error("Error fetching attendance:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStaffList = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5050/staff?salonId=${selectedSalon._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStaffList(data);
                if (!selectedStaff && data.length > 0) {
                    setSelectedStaff(data[0]._id);
                }
            }
        } catch (error) {
            console.error("Error fetching staff list:", error);
        }
    };

    const fetchStaffListForReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5050/staff?salonId=${selectedSalon._id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setStaffList(data);
                if (!selectedReportStaff && data.length > 0) {
                    setSelectedReportStaff(data[0]._id);
                }
            }
        } catch (error) {
            console.error("Error fetching staff list for reports:", error);
        }
    };

    const fetchMonthlyAttendance = async (staffId, date) => {
        try {
            const token = localStorage.getItem('token');
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            const response = await fetch(
                `http://localhost:5050/attendance/monthly?staffId=${staffId}&month=${month}&year=${year}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setMonthlyAttendance(data);
            }
        } catch (error) {
            console.error("Error fetching monthly attendance:", error);
        }
    };

    const fetchAttendanceReport = async () => {
        try {
            setReportLoading(true);
            const token = localStorage.getItem('token');
            
            let url = `http://localhost:5050/attendance/report?staffId=${selectedReportStaff}&type=${reportType}`;
            
            if (reportType === 'weekly') {
                // For weekly, we need the week start date
                const startOfWeek = new Date(reportYear, 0, 1);
                startOfWeek.setDate(startOfWeek.getDate() + (reportWeek - 1) * 7);
                url += `&weekStart=${startOfWeek.toISOString().split('T')[0]}`;

            } else if (reportType === 'monthly') {
                url += `&month=${reportMonth}&year=${reportYear}`;
            } else if (reportType === 'yearly') {
                url += `&year=${reportYear}`;
            }

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                setReportData(data);
            } else {
                setReportData(null);
            }
        } catch (error) {
            console.error("Error fetching attendance report:", error);
            setReportData(null);
        } finally {
            setReportLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const token = localStorage.getItem('token');

            const updates = attendanceData.map(item => ({
                staffId: item.staff._id,
                status: item.attendance?.status || 'Absent',
                checkIn: item.attendance?.checkIn,
                checkOut: item.attendance?.checkOut,
                remarks: item.attendance?.remarks,
                leaveType: item.attendance?.leaveType
            }));

            const response = await fetch('http://localhost:5050/attendance/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    salonId: selectedSalon._id,
                    date: selectedDate,
                    updates
                })
            });

            if (response.ok) {
                alert('Attendance saved successfully!');
                fetchDailyAttendance();
            } else {
                alert('Failed to save attendance');
            }
        } catch (error) {
            console.error("Error saving attendance:", error);
            alert('Error saving attendance');
        } finally {
            setSaving(false);
        }
    };

    // --- Helper Functions ---

    const handleStatusChange = (index, value) => {
        const updated = [...attendanceData];
        if (!updated[index].attendance) updated[index].attendance = {};
        updated[index].attendance.status = value;

        if ((value === 'Present' || value === 'Half Day') && !updated[index].attendance.checkIn) {
            const now = new Date();
            updated[index].attendance.checkIn = now.toISOString();
        }

        setAttendanceData(updated);
    };

    const handleTimeChange = (index, field, value) => {
        const updated = [...attendanceData];
        if (!updated[index].attendance) updated[index].attendance = {};

        if (value) {
            const dateTime = new Date(`${selectedDate}T${value}`);
            updated[index].attendance[field] = dateTime.toISOString();
        } else {
            updated[index].attendance[field] = null;
        }
        setAttendanceData(updated);
    };

    const setNow = (index, field) => {
        const updated = [...attendanceData];
        if (!updated[index].attendance) updated[index].attendance = {};
        updated[index].attendance[field] = new Date().toISOString();
        setAttendanceData(updated);
    };

    const handleRemarksChange = (index, value) => {
        const updated = [...attendanceData];
        if (!updated[index].attendance) updated[index].attendance = {};
        updated[index].attendance.remarks = value;
        setAttendanceData(updated);
    };

    const getTimeString = (isoString) => {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusForDate = (date) => {
        const ds = date.toISOString().split('T')[0];
        return monthlyAttendance.find(a => {
            const recordDate = new Date(a.date).toISOString().split('T')[0];
            return recordDate === ds;
        });
    };

    // Date navigation functions
    const decrementDate = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() - 1);
        setSelectedDate(newDate.toISOString().split('T')[0]);
    };

    const incrementDate = () => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + 1);
        setSelectedDate(newDate.toISOString().split('T')[0]);
    };

    const isStatus = (date, status) => {
        const ds = date.toISOString().split('T')[0];
        return monthlyAttendance.some(a => {
            const recordDate = new Date(a.date).toISOString().split('T')[0];
            return recordDate === ds && a.status === status;
        });
    };

    // Generate year options
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {

        years.push(i);
    }

    // Months array
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Render Reports View
    const renderReportsView = () => {
        return (
            <div className="space-y-6">
                {/* Report Controls */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Staff</label>
                            <select
                                value={selectedReportStaff}
                                onChange={(e) => setSelectedReportStaff(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50"
                            >
                                <option value="">Select Staff</option>
                                {staffList.map(staff => (
                                    <option key={staff._id} value={staff._id}>{staff.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="flex gap-2">
                            <button
                                onClick={() => setReportType('weekly')}
                                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                                    reportType === 'weekly' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Weekly
                            </button>
                            <button
                                onClick={() => setReportType('monthly')}
                                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                                    reportType === 'monthly' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setReportType('yearly')}
                                className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
                                    reportType === 'yearly' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Yearly
                            </button>
                        </div>

                        <div className="flex gap-2">
                            {reportType === 'monthly' && (
                                <>
                                    <select
                                        value={reportMonth}
                                        onChange={(e) => setReportMonth(parseInt(e.target.value))}
                                        className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50"
                                    >
                                        {months.map((month, idx) => (
                                            <option key={idx} value={idx + 1}>{month}</option>
                                        ))}
                                    </select>
                                    <select
                                        value={reportYear}
                                        onChange={(e) => setReportYear(parseInt(e.target.value))}
                                        className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50"
                                    >
                                        {years.map(year => (
                                            <option key={year} value={year}>{year}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                            {reportType === 'yearly' && (
                                <select
                                    value={reportYear}
                                    onChange={(e) => setReportYear(parseInt(e.target.value))}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            )}
                            {reportType === 'weekly' && (
                                <select
                                    value={reportWeek}
                                    onChange={(e) => setReportWeek(parseInt(e.target.value))}
                                    className="px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-gray-50"
                                >
                                    {Array.from({ length: 52 }, (_, i) => i + 1).map(week => (
                                        <option key={week} value={week}>Week {week}</option>
                                    ))}
                                </select>
                            )}

                        </div>
                    </div>
                </div>

                {/* Report Results */}
                {reportLoading ? (
                    <div className="text-center py-12 text-gray-500 font-medium">Loading report data...</div>
                ) : reportData ? (
                    <div className="space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                                <p className="text-sm text-green-600 font-medium">Present</p>
                                <p className="text-3xl font-bold text-green-700">{reportData.summary?.present || 0}</p>
                            </div>
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                                <p className="text-sm text-red-600 font-medium">Absent</p>
                                <p className="text-3xl font-bold text-red-700">{reportData.summary?.absent || 0}</p>
                            </div>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                <p className="text-sm text-yellow-600 font-medium">Half Day</p>
                                <p className="text-3xl font-bold text-yellow-700">{reportData.summary?.halfDay || 0}</p>
                            </div>
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <p className="text-sm text-blue-600 font-medium">Leave</p>
                                <p className="text-3xl font-bold text-blue-700">{reportData.summary?.leave || 0}</p>
                            </div>
                        </div>

                        {/* Monthly Calendar View */}
                        {reportType === 'monthly' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    {months[reportMonth - 1]} {reportYear} - Calendar View
                                </h3>
                                <div className="grid grid-cols-7 gap-2">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-center font-semibold text-gray-500 py-2">{day}</div>
                                    ))}
                                    {reportData.calendar?.map((day, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-2 min-h-[60px] rounded-lg border ${
                                                day.status === 'Present' ? 'bg-green-100 border-green-300' :
                                                day.status === 'Absent' ? 'bg-red-100 border-red-300' :
                                                day.status === 'Half Day' ? 'bg-yellow-100 border-yellow-300' :
                                                day.status === 'Leave' ? 'bg-blue-100 border-blue-300' :
                                                'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <div className="text-sm font-bold text-gray-700">{day.date}</div>
                                            {day.status && (
                                                <div className={`text-xs font-medium mt-1 ${
                                                    day.status === 'Present' ? 'text-green-700' :
                                                    day.status === 'Absent' ? 'text-red-700' :
                                                    day.status === 'Half Day' ? 'text-yellow-700' :
                                                    'text-blue-700'
                                                }`}>
                                                    {day.status}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Yearly View */}
                        {reportType === 'yearly' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">{reportYear} - Yearly View</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {Object.entries(reportData.monthlyBreakdown || {}).map(([month, stats]) => (
                                        <div key={month} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                            <h4 className="font-bold text-gray-800 mb-3">{month}</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-green-600">Present:</span>
                                                    <span className="font-semibold">{stats.present} days</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-red-600">Absent:</span>
                                                    <span className="font-semibold">{stats.absent} days</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-yellow-600">Half Day:</span>
                                                    <span className="font-semibold">{stats.halfDay} days</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-blue-600">Leave:</span>
                                                    <span className="font-semibold">{stats.leave} days</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Weekly View */}
                        {reportType === 'weekly' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Week {reportWeek} - {reportYear}
                                </h3>

                                <div className="grid grid-cols-7 gap-2">
                                    {reportData.dailyBreakdown?.map((day, idx) => (
                                        <div
                                            key={idx}
                                            className={`p-3 rounded-lg border text-center ${
                                                day.status === 'Present' ? 'bg-green-100 border-green-300' :
                                                day.status === 'Absent' ? 'bg-red-100 border-red-300' :
                                                day.status === 'Half Day' ? 'bg-yellow-100 border-yellow-300' :
                                                day.status === 'Leave' ? 'bg-blue-100 border-blue-300' :
                                                'bg-gray-50 border-gray-200'
                                            }`}
                                        >
                                            <div className="text-xs text-gray-500">{day.dayName}</div>
                                            <div className="text-sm font-bold text-gray-700">{day.date}</div>
                                            {day.status && (
                                                <div className={`text-xs font-medium mt-1 ${
                                                    day.status === 'Present' ? 'text-green-700' :
                                                    day.status === 'Absent' ? 'text-red-700' :
                                                    day.status === 'Half Day' ? 'text-yellow-700' :
                                                    'text-blue-700'
                                                }`}>
                                                    {day.status}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-12 text-gray-500 font-medium">
                        Select a staff member to view their attendance report
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-2 md:p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('table')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaList className="inline mr-2" /> Daily List
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'calendar' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaCalendarAlt className="inline mr-2" /> Monthly View
                        </button>
                        <button
                            onClick={() => setViewMode('reports')}
                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'reports' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <FaChartBar className="inline mr-2" /> Reports
                        </button>
                    </div>

                    {viewMode === 'table' && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={decrementDate}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Previous Day"
                            >
                                <FaChevronLeft className="text-gray-600" />
                            </button>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
                            />
                            <button
                                onClick={incrementDate}
                                className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                title="Next Day"
                            >
                                <FaChevronRight className="text-gray-600" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-gray-500 font-medium">Loading attendance data...</div>
            ) : viewMode === 'table' ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-semibold">
                            <tr>
                                <th className="p-4">Staff</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Check In</th>
                                <th className="p-4">Check Out</th>
                                <th className="p-4">Remarks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attendanceData.map((item, index) => (
                                <tr key={item.staff._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {item.staff.avatarUrl ? (
                                                <img src={item.staff.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">
                                                    {item.staff.name.charAt(0)}
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900">{item.staff.name}</p>
                                                <p className="text-xs text-gray-500">{item.staff.role} • {item.staff.profession}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <select
                                            value={item.attendance?.status || 'Absent'}
                                            onChange={(e) => handleStatusChange(index, e.target.value)}
                                            disabled={!canEdit}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium focus:outline-none border shadow-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
                                                ${(item.attendance?.status === 'Present') ? 'bg-green-50 text-green-700 border-green-200' :
                                                    (item.attendance?.status === 'Absent') ? 'bg-red-50 text-red-700 border-red-200' :
                                                        (item.attendance?.status === 'Half Day') ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                                        >
                                            <option value="Present">Present</option>
                                            <option value="Absent">Absent</option>
                                            <option value="Half Day">Half Day</option>
                                            <option value="Leave">Leave</option>
                                        </select>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={getTimeString(item.attendance?.checkIn)}
                                                onChange={(e) => handleTimeChange(index, 'checkIn', e.target.value)}
                                                disabled={!canEdit || item.attendance?.status === 'Absent' || item.attendance?.status === 'Leave'}
                                                className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm disabled:bg-gray-100 disabled:opacity-50"
                                            />
                                            {canEdit && (
                                                <button
                                                    onClick={() => setNow(index, 'checkIn')}
                                                    disabled={item.attendance?.status === 'Absent' || item.attendance?.status === 'Leave'}
                                                    className="text-white bg-primary hover:bg-primary/90 px-2 py-1 text-xs rounded shadow-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    title="Set to Now"
                                                >
                                                    Now
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={getTimeString(item.attendance?.checkOut)}
                                                onChange={(e) => handleTimeChange(index, 'checkOut', e.target.value)}
                                                disabled={!canEdit || item.attendance?.status === 'Absent' || item.attendance?.status === 'Leave'}
                                                className="border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm disabled:bg-gray-100 disabled:opacity-50"
                                            />
                                            {canEdit && (
                                                <button
                                                    onClick={() => setNow(index, 'checkOut')}
                                                    disabled={item.attendance?.status === 'Absent' || item.attendance?.status === 'Leave'}
                                                    className="text-white bg-primary hover:bg-primary/90 px-2 py-1 text-xs rounded shadow-sm transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                                                    title="Set to Now"
                                                >
                                                    Now
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <input
                                            type="text"
                                            placeholder="Add remark..."
                                            value={item.attendance?.remarks || ''}
                                            onChange={(e) => handleRemarksChange(index, e.target.value)}
                                            disabled={!canEdit}
                                            className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none shadow-sm disabled:bg-gray-100"
                                        />
                                    </td>
                                </tr>
                            ))}
                            {attendanceData.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500 italic">No staff found for this salon.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <br />
                    <hr />
                    <br />
                    {viewMode === 'table' && canEdit && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="ml-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            <FaSave />
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    )}
                </div>

            ) : viewMode === 'calendar' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Choose Stylist */}
                    <div className="p-4 sm:p-6 mt-4">
                        <label className="block text-lg font-bold text-gray-900 mb-6">
                            Step 1: Choose Stylist
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {staffList.length > 0 ? (
                                staffList.map((staff) => (
                                    <div
                                        key={staff._id}
                                        onClick={() => setSelectedStaff(staff._id)}
                                        className={cn(
                                            "flex flex-col items-center p-6 rounded-2xl border-2 cursor-pointer transition-all min-w-[140px] flex-1 sm:flex-none",
                                            selectedStaff === staff._id
                                                ? "border-primary bg-primary/5 shadow-md scale-105"
                                                : "border-gray-100 hover:border-gray-300 hover:shadow-sm"
                                        )}
                                    >
                                        <img
                                            src={staff.avatarUrl || "https://res.cloudinary.com/dgh9uunif/image/upload/v1768719858/Wavy_Buddies_-_Avatar_5_gdbuhf.webp"}
                                            alt={staff.name}
                                            className="w-20 h-20 rounded-full object-cover mb-3 border-4 border-white shadow-md transition-transform hover:scale-110"
                                        />
                                        <span className="text-base font-bold text-gray-800">{staff.name}</span>
                                        <span className="text-sm text-gray-500 font-medium">{staff.profession}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 italic">No staff available for this salon.</p>
                            )}
                        </div>
                    </div>

                    {/* Shadcn Calendar Card */}
                    {selectedStaff && (
                        <div className="p-4 sm:p-6 border-t border-gray-100 mt-6">
                            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Monthly Attendance Calendar</h3>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-500 rounded-sm"></div><span className="text-xs font-medium">Present</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm"></div><span className="text-xs font-medium">Absent</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-500 rounded-sm"></div><span className="text-xs font-medium">Half Day</span></div>
                                        <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div><span className="text-xs font-medium">Leave</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-center border-t border-gray-50 pt-8">
                                <Calendar
                                    mode="single"
                                    month={calendarMonth}
                                    onMonthChange={setCalendarMonth}
                                    className="rounded-2xl sm:rounded-3xl border-none shadow-md w-full max-w-5xl bg-gray-50/50 p-2 sm:p-10 [--cell-size:2.8rem] sm:[--cell-size:5.5rem]"
                                    modifiers={{
                                        present: (date) => isStatus(date, 'Present'),
                                        absent: (date) => isStatus(date, 'Absent'),
                                        halfDay: (date) => isStatus(date, 'Half Day'),
                                        leave: (date) => isStatus(date, 'Leave')
                                    }}
                                    modifiersClassNames={{
                                        present: "bg-green-500 text-white hover:bg-green-600 focus:bg-green-600 font-bold shadow-sm",
                                        absent: "bg-red-500 text-white hover:bg-red-600 focus:bg-red-600 font-bold shadow-sm",
                                        halfDay: "bg-yellow-500 text-white hover:bg-yellow-600 focus:bg-yellow-600 font-bold shadow-sm",
                                        leave: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-600 font-bold shadow-sm"
                                    }}
                                    components={{
                                        DayButton: (props) => {
                                            const { day } = props;
                                            const record = getStatusForDate(day.date);
                                            return (
                                                <CalendarDayButton {...props}>
                                                    <div className="flex flex-col items-center justify-center pt-0.5 sm:pt-1">
                                                        <span className="text-sm sm:text-lg">{day.date.getDate()}</span>
                                                        {record && (
                                                            <div className="flex flex-col items-center mt-0.5 sm:mt-1">
                                                                <span className="text-[7px] sm:text-[10px] font-black tracking-tighter uppercase leading-none px-0.5 sm:px-1 py-0.5 bg-black/10 rounded-sm">
                                                                    {record.status === 'Half Day' ? 'Half' : record.status}
                                                                </span>
                                                                <div className="hidden sm:block h-1" />
                                                                {record.checkIn && (record.status === 'Present' || record.status === 'Half Day') && (
                                                                    <div className="flex flex-col items-center leading-none mt-0.5">
                                                                        <span className="text-[6px] sm:text-[9px] font-bold opacity-90">
                                                                            <span className="hidden sm:inline text-white/70">In: </span>
                                                                            {new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                        </span>
                                                                        {record.checkOut && (
                                                                            <span className="text-[6px] sm:text-[9px] font-bold opacity-90 mt-0.5">
                                                                                <span className="hidden sm:inline text-white/70">Out: </span>
                                                                                {new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </CalendarDayButton>
                                            );
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                renderReportsView()
            )}
        </div>
    );
};

export default Attendance;
