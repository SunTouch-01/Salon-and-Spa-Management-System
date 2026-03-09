import Appointment from "../models/Appointment.js";
import mongoose from "mongoose";
import Salon from "../models/Salon.js";
import Staff from "../models/Staff.js";
import Client from "../models/Client.js";
import Payment from "../models/Payment.js";

export const createAppointment = async (req, res) => {
    try {
        const { salonId, serviceId, clientName, clientMobile, price, staffId, date, category } = req.body;

        if (!salonId) {
            return res.status(400).json({ message: "Salon ID is required" });
        }

        const salon = await Salon.findById(salonId);
        if (!salon) {
            return res.status(404).json({ message: "Salon not found" });
        }

        // Check staff availability if staff is selected
        if (staffId && date) {
            const appointmentDate = new Date(date);
            
            // Check if the date is in the past
            if (appointmentDate < new Date()) {
                return res.status(400).json({ message: "Cannot book appointments in the past" });
            }

            // Get the start and end of the selected hour (allow 1-hour slots)
            const slotStart = new Date(appointmentDate);
            slotStart.setMinutes(0, 0, 0);
            const slotEnd = new Date(appointmentDate);
            slotEnd.setMinutes(59, 59, 999);

            // Check if staff has any active appointment at this time
            const conflictingAppointment = await Appointment.findOne({
                staffId: new mongoose.Types.ObjectId(staffId),
                date: { $gte: slotStart, $lte: slotEnd },
                status: { $in: ['pending', 'confirmed'] }
            });

            if (conflictingAppointment) {
                return res.status(400).json({ 
                    message: `This specialist is already booked at ${new Date(conflictingAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Please choose another time or specialist.`
                });
            }

            // Also check if staff is on leave
            const staff = await Staff.findById(staffId);
            if (staff && staff.onLeave) {
                return res.status(400).json({ message: "This specialist is currently on leave" });
            }
        }

        // Find or create client
        let client = await Client.findOne({ mobile: clientMobile, salonId });
        if (!client) {
            client = new Client({
                salonId,
                name: clientName,
                mobile: clientMobile,
                totalSpent: 0,
                visits: 0
            });
            await client.save();
            console.log('New client created:', client._id);
        }

        const appointment = new Appointment({
            ...req.body,
            ownerId: salon.ownerId,
            clientId: client._id,  // Save the clientId reference
            price: price || 0,
            category: category || 'online'  // Default to 'online' if not provided
        });
        await appointment.save();

        console.log('Appointment created with clientId:', appointment.clientId);

        // DON'T update visits here - only update when completed
        // Remove these lines:
        // client.visits += 1;
        // client.lastVisit = new Date();
        // await client.save();

        res.status(201).json(appointment);
    } catch (error) {
        console.error('Create Appointment Error:', error);
        res.status(400).json({ message: error.message });
    }
};

export const getAppointments = async (req, res) => {
    try {
        const { salonId, staffId, date } = req.query;
        let filter = {};

        if (req.user && req.user.role === 'owner') {
            // Force owner isolation
            filter.ownerId = req.user.id;
            if (salonId) filter.salonId = salonId;
        } else if (req.user) {
            // Check if specific salon requested, otherwise default to staff's salon
            if (salonId) {
                filter.salonId = salonId;
            } else {
                // Handle staff roles (receptionist, stylist, etc.)
                const userStaff = await Staff.findById(req.user.id);
                if (userStaff && userStaff.salonId) {
                    filter.salonId = userStaff.salonId;
                } else {
                    return res.status(200).json([]);
                }
            }
        }

        if (staffId) filter.staffId = staffId;
        if (date) {
            // Simple date matching (start of day to end of day)
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            filter.date = { $gte: start, $lte: end };
        }

        const appointments = await Appointment.find(filter)
            .populate('salonId', 'name')
            .populate('staffId', 'name');

        res.status(200).json(appointments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        res.status(200).json(appointment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAppointment = async (req, res) => {
    try {
        // Allow price updates for receptionists and owners
        const allowedFields = ['clientName', 'clientMobile', 'date', 'status', 'note', 'staffId', 'serviceId'];
        if (req.user && (req.user.role === 'owner' || req.user.role === 'receptionist')) {
            allowedFields.push('price');
        }

        const updateData = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updateData[field] = req.body[field];
            }
        });

        const appointment = await Appointment.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        res.status(200).json(appointment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) return res.status(404).json({ message: "Appointment not found" });
        res.status(200).json({ message: "Appointment deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const completeAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: "Appointment not found" });
        }

        if (appointment.status === 'completed') {
            return res.status(400).json({ message: "Appointment already completed" });
        }

        // Update appointment status
        appointment.status = 'completed';
        await appointment.save();

        // Create payment record
        const payment = new Payment({
            ownerId: appointment.ownerId,
            salonId: appointment.salonId,
            appointmentId: appointment._id,
            amount: appointment.price,
            method: 'cash'
        });
        await payment.save();

        // Increment staff appointment count
        if (appointment.staffId) {
            await Staff.findByIdAndUpdate(
                appointment.staffId,
                { $inc: { appointmentCount: 1 } }
            );
        }

        // Update client total spent, visits, and last visit
        let targetClientId = appointment.clientId;

        console.log('Appointment clientId:', targetClientId);
        console.log('Appointment clientMobile:', appointment.clientMobile);

        // Fallback: if clientId is missing, find by mobile
        if (!targetClientId && appointment.clientMobile) {
            const client = await Client.findOne({
                mobile: appointment.clientMobile,
                salonId: appointment.salonId
            });
            if (client) {
                targetClientId = client._id;
                console.log('Found client by mobile:', targetClientId);

                // Update the appointment with the found clientId for future reference
                appointment.clientId = client._id;
                await appointment.save();
            } else {
                console.log('No client found with mobile:', appointment.clientMobile);
            }
        }

        if (targetClientId) {
            const finalPrice = Number(appointment.price) || 0;
            console.log(`Updating client ${targetClientId}: adding ${finalPrice} to totalSpent`);

            // Use atomic $inc operation for safety
            const updatedClient = await Client.findByIdAndUpdate(
                targetClientId,
                {
                    $inc: {
                        totalSpent: finalPrice,  // Add price to total
                        visits: 1                // Increment visits
                    },
                    lastVisit: new Date()        // Update last visit date
                },
                { new: true }  // Return the updated document
            );

            if (updatedClient) {
                console.log('✅ Client updated successfully!');
                console.log('New totalSpent:', updatedClient.totalSpent);
                console.log('New visits:', updatedClient.visits);
            } else {
                console.log('❌ Client not found with ID:', targetClientId);
            }
        } else {
            console.log('⚠️ No targetClientId found - client will not be updated');
        }

        res.status(200).json({
            message: "Appointment completed successfully",
            appointment,
            payment
        });
    } catch (error) {
        console.error("Complete Appointment Error:", error);
        res.status(500).json({ message: error.message });
    }
};
export const getTodayStats = async (req, res) => {
    try {
        const { salonId } = req.query;
        let filter = {};

        // Set up date filter for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filter.date = { $gte: today, $lt: tomorrow };

        // Apply role-based filtering
        if (req.user && req.user.role === 'owner') {
            filter.ownerId = req.user.id;
            if (salonId) filter.salonId = salonId;
        } else if (req.user) {
            // For staff (including receptionist), filter by their salon
            const userStaff = await Staff.findById(req.user.id);
            if (userStaff && userStaff.salonId) {
                if (salonId && salonId !== userStaff.salonId.toString()) {
                    return res.status(200).json({ customerCount: 0, revenue: 0 });
                }
                filter.salonId = userStaff.salonId;
            } else {
                return res.status(200).json({ customerCount: 0, revenue: 0 });
            }
        } else {
            return res.status(403).json({ message: "Access denied" });
        }

        // Get all appointments for today
        const appointments = await Appointment.find(filter)
            .populate('serviceId', 'price');

        // Calculate customer count (total appointments today)
        const customerCount = appointments.length;

        // Calculate revenue from payments for completed appointments
        const Payment = mongoose.model('Payment');
        const completedAppointmentIds = appointments
            .filter(app => app.status === 'completed')
            .map(app => app._id);

        const payments = await Payment.find({
            appointmentId: { $in: completedAppointmentIds },
            ...(filter.salonId ? { salonId: filter.salonId } : {}),
            ...(filter.ownerId ? { ownerId: filter.ownerId } : {})
        });

        const revenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

        res.status(200).json({ customerCount, revenue });
    } catch (error) {
        console.error("Get Today Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getRevenueStats = async (req, res) => {
    try {
        const { salonId } = req.query;
        let matchFilter = {};

        // Apply role-based filtering
        if (req.user && req.user.role === 'owner') {
            matchFilter.ownerId = new mongoose.Types.ObjectId(req.user.id);
            if (salonId) matchFilter.salonId = new mongoose.Types.ObjectId(salonId);
        } else if (req.user) {
            const userStaff = await Staff.findById(req.user.id);
            if (userStaff && userStaff.salonId) {
                if (salonId && salonId !== userStaff.salonId.toString()) {
                    return res.status(403).json({ message: "Access denied" });
                }
                matchFilter.salonId = userStaff.salonId;
            } else {
                return res.status(200).json({ revenueThisMonth: null, totalIncome: null, clients: null });
            }
        } else {
            return res.status(403).json({ message: "Access denied" });
        }

        // Get data for the last 7 months
        const months = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({
                year: date.getFullYear(),
                month: date.getMonth() + 1,
                name: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
            });
        }

        // Monthly revenue from payments
        const Payment = mongoose.model('Payment');
        const revenueData = await Payment.aggregate([
            {
                $match: {
                    ...matchFilter,
                    createdAt: { $gte: new Date(months[0].year, months[0].month - 1, 1) }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    revenue: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Map revenue data to months
        const monthlyRevenue = months.map(m => {
            const found = revenueData.find(r => r._id.year === m.year && r._id.month === m.month);
            return {
                name: m.name,
                value: found ? found.revenue : 0
            };
        });

        // Calculate this month's revenue
        const currentMonthRevenue = monthlyRevenue[monthlyRevenue.length - 1]?.value || 0;
        const lastMonthRevenue = monthlyRevenue[monthlyRevenue.length - 2]?.value || 0;
        const revenueTrend = lastMonthRevenue > 0
            ? (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(0)
            : (currentMonthRevenue > 0 ? 100 : 0);

        // Total income (all time from payments)
        const totalIncomeResult = await Payment.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        const totalIncome = totalIncomeResult[0]?.total || 0;

        // Monthly income trend (cumulative)
        let cumulative = 0;
        const incomeData = monthlyRevenue.map(m => {
            cumulative += m.value;
            return { name: m.name, value: cumulative };
        });

        // Client count by month
        const Client = mongoose.model('Client');
        const clientFilter = salonId ? { salonId: new mongoose.Types.ObjectId(salonId) } : {};

        const clientData = await Client.aggregate([
            { $match: clientFilter },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        // Map client data - show cumulative growth
        let cumulativeClients = 0;
        const monthlyClients = months.map(m => {
            const found = clientData.find(c => c._id.year === m.year && c._id.month === m.month);
            cumulativeClients += found ? found.count : 0;
            return {
                name: m.name,
                value: cumulativeClients
            };
        });

        const totalClients = await Client.countDocuments(clientFilter);
        const thisMonthClients = clientData.find(c =>
            c._id.year === now.getFullYear() && c._id.month === now.getMonth() + 1
        )?.count || 0;
        const lastMonthClients = clientData.find(c =>
            c._id.year === (now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear()) &&
            c._id.month === (now.getMonth() === 0 ? 12 : now.getMonth())
        )?.count || 0;
        const clientTrend = lastMonthClients > 0
            ? (((thisMonthClients - lastMonthClients) / lastMonthClients) * 100).toFixed(0)
            : (thisMonthClients > 0 ? 100 : 0);

        res.status(200).json({
            revenueThisMonth: {
                value: currentMonthRevenue,
                trend: revenueTrend,
                data: monthlyRevenue
            },
            totalIncome: {
                value: totalIncome,
                trend: revenueTrend,
                data: incomeData
            },
            clients: {
                value: totalClients,
                trend: clientTrend,
                data: monthlyClients
            }
        });
    } catch (error) {
        console.error("Get Revenue Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardStats = async (req, res) => {
    try {
        const { salonId } = req.query;
        let matchFilter = {};
        if (req.user && req.user.role === 'owner') {
            matchFilter.ownerId = new mongoose.Types.ObjectId(req.user.id);
            if (salonId) matchFilter.salonId = new mongoose.Types.ObjectId(salonId);
        } else if (req.user) { // Staff
            const userStaff = await Staff.findById(req.user.id);
            if (userStaff && userStaff.salonId) {
                if (salonId && salonId !== userStaff.salonId.toString()) {
                    return res.status(403).json({ message: "Access denied" });
                }
                matchFilter.salonId = userStaff.salonId;
            } else {
                return res.status(200).json({ totalEarnings: 0, lastWeekEarnings: 0, weeklyTrend: '0%', topServices: [] });
            }
        } else {
            return res.status(403).json({ message: "Access denied" });
        }

        // Total Earnings (All Time from payments)
        const Payment = mongoose.model('Payment');
        const totalEarningsResult = await Payment.aggregate([
            { $match: matchFilter },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);
        const totalEarnings = totalEarningsResult[0]?.total || 0;

        // Earnings Last Week & Previous Week for Trend
        const today = new Date();
        const lastWeekStart = new Date(today);
        lastWeekStart.setDate(today.getDate() - 7);
        const previousWeekStart = new Date(today);
        previousWeekStart.setDate(today.getDate() - 14);

        const weeklyEarnings = await Appointment.aggregate([
            {
                $match: {
                    ...matchFilter,
                    status: 'completed',
                    date: { $gte: previousWeekStart, $lt: today }
                }
            },
            {
                $lookup: {
                    from: 'services',
                    localField: 'serviceId',
                    foreignField: '_id',
                    as: 'service'
                }
            },
            { $unwind: { path: '$service', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    date: 1,
                    price: { $ifNull: ['$price', 0] }
                }
            }
        ]);

        let lastWeekTotal = 0;
        let previousWeekTotal = 0;

        weeklyEarnings.forEach(app => {
            if (app.date >= lastWeekStart) {
                lastWeekTotal += app.price;
            } else {
                previousWeekTotal += app.price;
            }
        });

        const weeklyTrend = previousWeekTotal > 0
            ? (((lastWeekTotal - previousWeekTotal) / previousWeekTotal) * 100).toFixed(1)
            : (lastWeekTotal > 0 ? 100 : 0);

        // Top Services
        const topServices = await Appointment.aggregate([
            { $match: { ...matchFilter, status: 'completed' } },
            {
                $group: {
                    _id: '$serviceId',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'services',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'service'
                }
            },
            { $unwind: '$service' },
            {
                $project: {
                    name: '$service.name',
                    count: 1
                }
            }
        ]);

        // Calculate percentages for top services
        const totalServiceCount = topServices.reduce((acc, curr) => acc + curr.count, 0);
        const topServicesWithPercentage = topServices.map(s => ({
            ...s,
            percentage: totalServiceCount > 0 ? Math.round((s.count / totalServiceCount) * 100) : 0
        }));

        res.status(200).json({
            totalEarnings,
            lastWeekEarnings: lastWeekTotal,
            weeklyTrend: `${weeklyTrend > 0 ? '+' : ''}${weeklyTrend}%`,
            topServices: topServicesWithPercentage
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getEarningsPageData = async (req, res) => {
    try {
        const { salonId } = req.query;
        let matchFilter = {};
        if (req.user && req.user.role === 'owner') {
            matchFilter.ownerId = new mongoose.Types.ObjectId(req.user.id);
            if (salonId) matchFilter.salonId = new mongoose.Types.ObjectId(salonId);
        } else if (req.user) {
            const userStaff = await Staff.findById(req.user.id);
            if (userStaff && userStaff.salonId) {
                if (salonId && salonId !== userStaff.salonId.toString()) {
                    return res.status(403).json({ message: "Access denied" });
                }
                matchFilter.salonId = userStaff.salonId;
            } else {
                return res.status(200).json({ thisMonth: 0, lastMonth: 0, totalYear: 0, pending: 0, recentEarnings: [] });
            }
        } else {
            return res.status(403).json({ message: "Access denied" });
        }

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Fetch earnings data from payments
        const Payment = mongoose.model('Payment');
        const earningsData = await Payment.aggregate([
            {
                $match: {
                    ...matchFilter,
                    createdAt: { $gte: startOfYear }
                }
            },
            {
                $project: {
                    createdAt: 1,
                    amount: 1
                }
            }
        ]);

        let thisMonth = 0;
        let lastMonth = 0;
        let totalYear = 0;

        earningsData.forEach(payment => {
            totalYear += payment.amount;
            if (payment.createdAt >= startOfMonth) {
                thisMonth += payment.amount;
            } else if (payment.createdAt >= startOfLastMonth && payment.createdAt <= endOfLastMonth) {
                lastMonth += payment.amount;
            }
        });

        // Pending Amount (All time from appointment prices)
        const pendingResult = await Appointment.aggregate([
            { $match: { ...matchFilter, status: { $in: ['pending', 'confirmed'] } } },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$price' }
                }
            }
        ]);
        const pendingAmount = pendingResult[0]?.total || 0;

        // Recent Earnings Table (Last 10)
        const recentEarnings = await Appointment.find({ ...matchFilter, status: 'completed' })
            .sort({ date: -1 })
            .limit(10)
            .populate('serviceId', 'name price')
            .lean();

        const formattedRecent = recentEarnings.map(app => ({
            id: app._id,
            date: app.date,
            service: app.serviceId?.name || 'Service',
            client: app.clientName,
            amount: app.price || 0,
            status: 'Paid' // Completed implies paid for this context
        }));

        res.status(200).json({
            thisMonth,
            lastMonth,
            totalYear,
            pending: pendingAmount,
            recentEarnings: formattedRecent
        });

    } catch (error) {
        console.error("Earnings Page Data Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Check staff availability and time slot conflicts
export const checkAvailability = async (req, res) => {
    try {
        const { salonId, staffId, date, excludeAppointmentId } = req.query;
        
        if (!salonId || !date) {
            return res.status(400).json({ message: "Salon ID and date are required" });
        }

        const appointmentDate = new Date(date);
        const startOfDay = new Date(appointmentDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(appointmentDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Build filter for appointments on the same day
        let filter = {
            salonId: new mongoose.Types.ObjectId(salonId),
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['pending', 'confirmed'] } // Only check active appointments
        };

        // If checking for specific staff, add to filter
        if (staffId) {
            filter.staffId = new mongoose.Types.ObjectId(staffId);
        }

        // Exclude current appointment when editing
        if (excludeAppointmentId) {
            filter._id = { $ne: new mongoose.Types.ObjectId(excludeAppointmentId) };
        }

        // Get all appointments for the day
        const appointments = await Appointment.find(filter)
            .populate('staffId', 'name')
            .lean();

        // Get all staff for the salon to check their availability status
        const allStaff = await Staff.find({ 
            salonId: new mongoose.Types.ObjectId(salonId),
            isActive: true,
            onLeave: false
        }).select('_id name');

        // Format booked time slots
        const bookedSlots = appointments.map(app => ({
            time: new Date(app.date).toISOString(),
            staffId: app.staffId?._id?.toString(),
            staffName: app.staffId?.name,
            appointmentId: app._id
        }));

        res.status(200).json({
            available: true,
            bookedSlots,
            availableStaff: allStaff.map(s => ({
                _id: s._id,
                name: s.name,
                isAvailable: !appointments.some(app => 
                    app.staffId?._id?.toString() === s._id.toString() &&
                    new Date(app.date).getTime() === appointmentDate.getTime()
                )
            }))
        });

    } catch (error) {
        console.error("Check Availability Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Public endpoint for clients to check staff availability (no auth required)
export const checkStaffAvailability = async (req, res) => {
    try {
        const { staffId, date } = req.query;
        
        if (!staffId || !date) {
            return res.status(400).json({ available: false, message: "Staff ID and date are required" });
        }

        const appointmentDate = new Date(date);
        
        // Check if the date is in the past
        if (appointmentDate < new Date()) {
            return res.status(200).json({ 
                available: false, 
                message: "Cannot book appointments in the past" 
            });
        }

        // Get the start and end of the selected hour (allow 1-hour slots)
        const slotStart = new Date(appointmentDate);
        slotStart.setMinutes(0, 0, 0);
        const slotEnd = new Date(appointmentDate);
        slotEnd.setMinutes(59, 59, 999);

        // Check if staff has any active appointment at this time
        const conflictingAppointment = await Appointment.findOne({
            staffId: new mongoose.Types.ObjectId(staffId),
            date: { $gte: slotStart, $lte: slotEnd },
            status: { $in: ['pending', 'confirmed'] }
        }).populate('staffId', 'name');

        if (conflictingAppointment) {
            return res.status(200).json({ 
                available: false, 
                message: `This specialist is already booked at ${new Date(conflictingAppointment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Please choose another time or specialist.`,
                conflictingAppointment: {
                    date: conflictingAppointment.date,
                    clientName: conflictingAppointment.clientName
                }
            });
        }

        // Also check if staff is on leave
        const staff = await Staff.findById(staffId);
        if (staff && staff.onLeave) {
            return res.status(200).json({ 
                available: false, 
                message: "This specialist is currently on leave" 
            });
        }

        res.status(200).json({ 
            available: true, 
            message: "Staff is available at this time" 
        });

    } catch (error) {
        console.error("Check Staff Availability Error:", error);
        res.status(500).json({ available: false, message: error.message });
    }
};
