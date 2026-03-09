import Attendance from "../models/Attendance.js";
import Staff from "../models/Staff.js";
import Salon from "../models/Salon.js";

// Helper to normalize date to midnight UTC to avoid timezone issues
const normalizeDate = (date) => {
    const d = new Date(date);
    d.setUTCHours(0, 0, 0, 0);
    return d;
};

export const markAttendance = async (req, res) => {
    try {
        const { staffId, salonId, date, status, checkIn, checkOut, remarks, leaveType } = req.body;

        if (!staffId || !salonId || !date) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const normalizedDate = normalizeDate(date);

        const filter = { staffId, date: normalizedDate };
        const update = {
            salonId,
            status,
            remarks,
            leaveType: status === 'Leave' ? leaveType : null
        };

        // Only update times if provided
        if (checkIn !== undefined) update.checkIn = checkIn;
        if (checkOut !== undefined) update.checkOut = checkOut;

        const attendance = await Attendance.findOneAndUpdate(
            filter,
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.status(200).json(attendance);
    } catch (error) {
        console.error("Mark Attendance Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getDailyAttendance = async (req, res) => {
    try {
        const { salonId, date } = req.query;

        if (!date) {
            return res.status(400).json({ message: "Date is required" });
        }

        let filterSalonId = salonId;

        if (req.user && req.user.role === 'owner') {
            if (salonId) {
                const salon = await Salon.findOne({ _id: salonId, ownerId: req.user.id });
                if (!salon) return res.status(403).json({ message: "Access denied" });
            } else {
                // If no salonId, we might want to return nothing or all?
                // For attendance, usually it's per salon.
                return res.status(400).json({ message: "Salon ID is required" });
            }
        } else if (req.user) {
            const staff = await Staff.findById(req.user.id);
            if (!staff || !staff.salonId) return res.status(200).json([]);
            if (salonId && salonId !== staff.salonId.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
            filterSalonId = staff.salonId;
        } else {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const normalizedDate = normalizeDate(date);

        // Fetch all active staff for this salon
        const staffMembers = await Staff.find({ salonId: filterSalonId, isActive: true }).select('name role profession avatarUrl mobile');

        // Fetch existing attendance records for this date
        const attendanceRecords = await Attendance.find({
            salonId: filterSalonId,
            date: normalizedDate
        });

        // Merge staff with their attendance record
        const result = staffMembers.map(staff => {
            const record = attendanceRecords.find(a => a.staffId.toString() === staff._id.toString());
            return {
                staff,
                attendance: record || null
            };
        });

        res.status(200).json(result);
    } catch (error) {
        console.error("Get Daily Attendance Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getMonthlyAttendance = async (req, res) => {
    try {
        const { staffId, month, year } = req.query;

        if (!staffId || !month || !year) {
            return res.status(400).json({ message: "Staff ID, Month, and Year are required" });
        }

        const startDate = new Date(Date.UTC(year, month - 1, 1));
        const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

        const records = await Attendance.find({
            staffId,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ date: 1 });

        res.status(200).json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const bulkUpdateAttendance = async (req, res) => {
    try {
        const { salonId, date, updates } = req.body;
        // updates: Array of { staffId, status, checkIn, checkOut, remarks, ... }

        if (!updates || !Array.isArray(updates)) {
            return res.status(400).json({ message: "Invalid updates format" });
        }

        const normalizedDate = normalizeDate(date);
        const operations = updates.map(update => ({
            updateOne: {
                filter: { staffId: update.staffId, date: normalizedDate },
                update: {
                    $set: {
                        salonId,
                        status: update.status,
                        checkIn: update.checkIn,
                        checkOut: update.checkOut,
                        remarks: update.remarks,
                        leaveType: update.status === 'Leave' ? update.leaveType : null
                    }
                },
                upsert: true
            }
        }));

        if (operations.length > 0) {
            await Attendance.bulkWrite(operations);
        }

        res.status(200).json({ message: "Attendance updated successfully" });
    } catch (error) {
        console.error("Bulk Update Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Get Attendance Report - Weekly, Monthly, or Yearly
export const getAttendanceReport = async (req, res) => {
    try {
        const { staffId, type, month, year, weekStart } = req.query;

        if (!staffId || !type) {
            return res.status(400).json({ message: "Staff ID and report type are required" });
        }

        let startDate, endDate;
        
        if (type === 'weekly') {
            const weekStartDate = weekStart ? new Date(weekStart) : new Date();
            startDate = new Date(weekStartDate);
            startDate.setDate(startDate.getDate() - startDate.getDay());
            endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 6);

            const weekRecords = await Attendance.find({
                staffId,
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 });

            const dailyBreakdown = [];
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            for (let i = 0; i < 7; i++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + i);
                const dateStr = currentDate.toISOString().split('T')[0];
                
                const record = weekRecords.find(r => {
                    const recordDate = new Date(r.date).toISOString().split('T')[0];
                    return recordDate === dateStr;
                });

                dailyBreakdown.push({
                    dayName: dayNames[i],
                    date: currentDate.getDate(),
                    status: record ? record.status : null,
                    checkIn: record ? record.checkIn : null,
                    checkOut: record ? record.checkOut : null
                });
            }

            const summary = {
                present: weekRecords.filter(r => r.status === 'Present').length,
                absent: weekRecords.filter(r => r.status === 'Absent').length,
                halfDay: weekRecords.filter(r => r.status === 'Half Day').length,
                leave: weekRecords.filter(r => r.status === 'Leave').length
            };

            res.status(200).json({ summary, dailyBreakdown });

        } else if (type === 'monthly') {
            const m = parseInt(month) || new Date().getMonth() + 1;
            const y = parseInt(year) || new Date().getFullYear();
            
            startDate = new Date(Date.UTC(y, m - 1, 1));
            endDate = new Date(Date.UTC(y, m, 0, 23, 59, 59));

            const monthRecords = await Attendance.find({
                staffId,
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 });

            const daysInMonth = new Date(y, m, 0).getDate();
            const calendar = [];
            
            for (let day = 1; day <= daysInMonth; day++) {
                const currentDate = new Date(Date.UTC(y, m - 1, day));
                const dateStr = currentDate.toISOString().split('T')[0];
                
                const record = monthRecords.find(r => {
                    const recordDate = new Date(r.date).toISOString().split('T')[0];
                    return recordDate === dateStr;
                });

                calendar.push({
                    date: day,
                    status: record ? record.status : null,
                    checkIn: record ? record.checkIn : null,
                    checkOut: record ? record.checkOut : null
                });
            }

            const summary = {
                present: monthRecords.filter(r => r.status === 'Present').length,
                absent: monthRecords.filter(r => r.status === 'Absent').length,
                halfDay: monthRecords.filter(r => r.status === 'Half Day').length,
                leave: monthRecords.filter(r => r.status === 'Leave').length
            };

            res.status(200).json({ summary, calendar });

        } else if (type === 'yearly') {
            const y = parseInt(year) || new Date().getFullYear();
            
            startDate = new Date(Date.UTC(y, 0, 1));
            endDate = new Date(Date.UTC(y, 11, 31, 23, 59, 59));

            const yearRecords = await Attendance.find({
                staffId,
                date: { $gte: startDate, $lte: endDate }
            }).sort({ date: 1 });

            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

            const monthlyBreakdown = {};
            monthNames.forEach(monthName => {
                monthlyBreakdown[monthName] = { present: 0, absent: 0, halfDay: 0, leave: 0 };
            });

            yearRecords.forEach(record => {
                const recordDate = new Date(record.date);
                const monthName = monthNames[recordDate.getUTCMonth()];
                
                if (record.status === 'Present') monthlyBreakdown[monthName].present++;
                else if (record.status === 'Absent') monthlyBreakdown[monthName].absent++;
                else if (record.status === 'Half Day') monthlyBreakdown[monthName].halfDay++;
                else if (record.status === 'Leave') monthlyBreakdown[monthName].leave++;
            });

            const summary = {
                present: yearRecords.filter(r => r.status === 'Present').length,
                absent: yearRecords.filter(r => r.status === 'Absent').length,
                halfDay: yearRecords.filter(r => r.status === 'Half Day').length,
                leave: yearRecords.filter(r => r.status === 'Leave').length
            };

            res.status(200).json({ summary, monthlyBreakdown });
        } else {
            return res.status(400).json({ message: "Invalid report type. Use 'weekly', 'monthly', or 'yearly'" });
        }

    } catch (error) {
        console.error("Get Attendance Report Error:", error);
        res.status(500).json({ message: error.message });
    }
};
