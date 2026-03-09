import Appointment from "../models/Appointment.js";
import Walkin from "../models/Walkin.js";
import Client from "../models/Client.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";

export const getReports = async (req, res) => {
    try {
        const { period, salonId } = req.query; // period: 'weekly', 'monthly', 'annually'

        let startDate = new Date();
        let endDate = new Date();
        let groupByFormat = "";

        // Determine date range and grouping format
        if (period === 'weekly') {
            startDate.setDate(startDate.getDate() - 7);
            groupByFormat = "%Y-%m-%d"; // Group by day
        } else if (period === 'monthly') {
            startDate.setMonth(startDate.getMonth() - 1);
            groupByFormat = "%Y-%m-%d"; // Group by day for last 30 days
        } else if (period === 'annually') {
            startDate.setFullYear(startDate.getFullYear() - 1);
            groupByFormat = "%Y-%m"; // Group by month
        } else {
            // Default to monthly if not specified
            startDate.setMonth(startDate.getMonth() - 1);
            groupByFormat = "%Y-%m-%d";
        }

        const matchFilter = {
            createdAt: { $gte: startDate, $lte: endDate }
        };

        if (salonId) {
            matchFilter.salonId = new mongoose.Types.ObjectId(salonId);
        } else if (req.user && req.user.role === 'owner') {
            matchFilter.ownerId = new mongoose.Types.ObjectId(req.user.id);
        }
        // If staff/admin, they should probably provide salonId or we default to their salon if valid.
        // For now trusting salonId passed or owner's scope.

        // 1. Appointments (Bookings) Report
        // Combine Appointments and Walkins as "Orders" / "Bookings"
        const appointmentStats = await Appointment.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
                    count: { $sum: 1 },
                    value: { $sum: "$price" } // Potential value
                }
            },
            { $sort: { _id: 1 } }
        ]);

        const walkinStats = await Walkin.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
                    count: { $sum: 1 },
                    value: { $sum: "$price" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Merge Appointment and Walkin stats
        const bookingsMap = {};
        [...appointmentStats, ...walkinStats].forEach(item => {
            if (!bookingsMap[item._id]) {
                bookingsMap[item._id] = { date: item._id, count: 0, value: 0 };
            }
            bookingsMap[item._id].count += item.count;
            bookingsMap[item._id].value += item.value;
        });
        const bookingsReport = Object.values(bookingsMap).sort((a, b) => a.date.localeCompare(b.date));


        // 2. Clients Report (New Clients)
        const clientStats = await Client.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // 3. Revenue Report (Payments)
        const revenueStats = await Payment.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: { $dateToString: { format: groupByFormat, date: "$createdAt" } },
                    amount: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            period,
            bookings: bookingsReport,
            clients: clientStats.map(c => ({ date: c._id, count: c.count })),
            revenue: revenueStats.map(r => ({ date: r._id, amount: r.amount }))
        });

    } catch (error) {
        console.error("Get Reports Error:", error);
        res.status(500).json({ message: error.message });
    }
};
