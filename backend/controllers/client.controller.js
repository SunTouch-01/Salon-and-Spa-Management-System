import Client from "../models/Client.js";
import Salon from "../models/Salon.js";
import Staff from "../models/Staff.js";

export const createClient = async (req, res) => {
    try {
        const client = new Client(req.body);
        await client.save();
        res.status(201).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getClients = async (req, res) => {
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
            if (!staff || !staff.salonId) return res.status(200).json([]);
            if (salonId && salonId !== staff.salonId.toString()) {
                return res.status(403).json({ message: "Access denied" });
            }
            filter.salonId = staff.salonId;
        }

        const clients = await Client.find(filter).populate('salonId', 'name');
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) return res.status(404).json({ message: "Client not found" });
        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!client) return res.status(404).json({ message: "Client not found" });
        res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) return res.status(404).json({ message: "Client not found" });
        res.status(200).json({ message: "Client deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getClientStats = async (req, res) => {
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
            if (!staff || !staff.salonId) return res.status(200).json({ totalClients: 0, newThisMonth: 0, activeClients: 0, vipClients: 0 });
            filter.salonId = staff.salonId;
        }

        // Total clients
        const totalClients = await Client.countDocuments(filter);

        // New clients this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonth = await Client.countDocuments({
            ...filter,
            createdAt: { $gte: startOfMonth }
        });

        // Active clients (visited in last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const activeClients = await Client.countDocuments({
            ...filter,
            lastVisit: { $gte: thirtyDaysAgo }
        });

        // VIP clients
        const vipClients = await Client.countDocuments({
            ...filter,
            isVip: true
        });

        res.status(200).json({
            totalClients,
            newThisMonth,
            activeClients,
            vipClients
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
