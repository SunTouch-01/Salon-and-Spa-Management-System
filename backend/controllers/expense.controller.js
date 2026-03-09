import Expense from "../models/Expense.js";
import Salon from "../models/Salon.js";
import Staff from "../models/Staff.js";

export const createExpense = async (req, res) => {
    try {
        const expense = new Expense(req.body);
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getExpenses = async (req, res) => {
    try {
        const { salonId, category } = req.query;
        let filter = {};

        if (req.user && req.user.role === 'owner') {
            if (salonId) {
                const salon = await Salon.findOne({ _id: salonId, ownerId: req.user.id });
                if (!salon) return res.status(403).json({ message: "Access denied" });
                filter.salonId = salonId;
            } else {
                const salons = await Salon.find({ ownerId: req.user.id });
                filter.salonId = { $in: salons.map(s => s._id) };
            }
        } else if (req.user) {
            const staff = await Staff.findById(req.user.id);
            if (!staff || !staff.salonId) return res.status(200).json([]);
            if (salonId && salonId !== staff.salonId.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
            filter.salonId = staff.salonId;
        }

        if (category && category !== 'All') filter.category = category;

        const expenses = await Expense.find(filter)
            .populate('salonId', 'name')
            .populate('addedBy', 'name')
            .sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getExpenseById = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        res.status(200).json(expense);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        res.status(200).json(expense);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findByIdAndDelete(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getExpenseStats = async (req, res) => {
    try {
        const { salonId } = req.query;
        let filter = {};

        if (req.user && req.user.role === 'owner') {
            if (salonId) {
                const salon = await Salon.findOne({ _id: salonId, ownerId: req.user.id });
                if (!salon) return res.status(403).json({ message: "Access denied" });
                filter.salonId = salonId;
            } else {
                const salons = await Salon.find({ ownerId: req.user.id });
                filter.salonId = { $in: salons.map(s => s._id) };
            }
        } else if (req.user) {
            const staff = await Staff.findById(req.user.id);
            if (!staff || !staff.salonId) return res.status(200).json({ thisMonth: 0, lastMonth: 0, categoryBreakdown: [] });
            filter.salonId = staff.salonId;
        }

        // This month's expenses
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const thisMonthExpenses = await Expense.aggregate([
            { $match: { ...filter, date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Last month's expenses
        const startOfLastMonth = new Date(startOfMonth);
        startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
        const endOfLastMonth = new Date(startOfMonth);
        endOfLastMonth.setDate(0);

        const lastMonthExpenses = await Expense.aggregate([
            { $match: { ...filter, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        // Category breakdown
        const categoryBreakdown = await Expense.aggregate([
            { $match: { ...filter, date: { $gte: startOfMonth } } },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } }
        ]);

        res.status(200).json({
            thisMonth: thisMonthExpenses[0]?.total || 0,
            lastMonth: lastMonthExpenses[0]?.total || 0,
            categoryBreakdown
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get weekly expenses
export const getWeeklyExpenses = async (req, res) => {
    try {
        const { salonId } = req.query;
        let filter = {};

        if (req.user && req.user.role === 'owner') {
            if (salonId) {
                const salon = await Salon.findOne({ _id: salonId, ownerId: req.user.id });
                if (!salon) return res.status(403).json({ message: "Access denied" });
                filter.salonId = salonId;
            } else {
                const salons = await Salon.find({ ownerId: req.user.id });
                filter.salonId = { $in: salons.map(s => s._id) };
            }
        } else if (req.user) {
            const staff = await Staff.findById(req.user.id);
            if (!staff || !staff.salonId) return res.status(200).json({ thisWeek: 0 });
            filter.salonId = staff.salonId;
        }

        // Get start of current week (Sunday)
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const weeklyExpenses = await Expense.aggregate([
            { $match: { ...filter, date: { $gte: startOfWeek } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.status(200).json({
            thisWeek: weeklyExpenses[0]?.total || 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get expenses by duration (week/month/year)
export const getExpensesByDuration = async (req, res) => {
    try {
        const { salonId, duration = 'month' } = req.query;
        let filter = {};

        if (req.user && req.user.role === 'owner') {
            if (salonId) {
                const salon = await Salon.findOne({ _id: salonId, ownerId: req.user.id });
                if (!salon) return res.status(403).json({ message: "Access denied" });
                filter.salonId = salonId;
            } else {
                const salons = await Salon.find({ ownerId: req.user.id });
                filter.salonId = { $in: salons.map(s => s._id) };
            }
        } else if (req.user) {
            const staff = await Staff.findById(req.user.id);
            if (!staff || !staff.salonId) return res.status(200).json({ expenses: [], total: 0, count: 0 });
            filter.salonId = staff.salonId;
        }

        const now = new Date();
        let startDate = new Date();

        switch (duration) {
            case 'week':
                // Start of current week (Sunday)
                startDate.setDate(now.getDate() - now.getDay());
                break;
            case 'month':
                // Start of current month
                startDate.setDate(1);
                break;
            case 'year':
                // Start of current year
                startDate.setMonth(0, 1);
                break;
            default:
                startDate.setDate(1);
        }

        startDate.setHours(0, 0, 0, 0);

        const expenses = await Expense.find({
            ...filter,
            date: { $gte: startDate }
        })
            .populate('salonId', 'name')
            .populate('addedBy', 'name')
            .sort({ date: -1 });

        const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

        res.status(200).json({
            expenses,
            total,
            duration,
            count: expenses.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
