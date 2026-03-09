import Inventory from "../models/Inventory.js";
import Salon from "../models/Salon.js";
import Staff from "../models/Staff.js";

export const createInventoryItem = async (req, res) => {
    try {
        const item = new Inventory(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getInventory = async (req, res) => {
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

        const items = await Inventory.find(filter).populate('salonId', 'name');
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getInventoryById = async (req, res) => {
    try {
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteInventoryItem = async (req, res) => {
    try {
        const item = await Inventory.findByIdAndDelete(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });
        res.status(200).json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const restockItem = async (req, res) => {
    try {
        const { quantity } = req.body;
        const item = await Inventory.findById(req.params.id);
        if (!item) return res.status(404).json({ message: "Item not found" });

        item.stock += quantity;
        item.lastRestocked = new Date();
        await item.save();

        res.status(200).json(item);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getInventoryStats = async (req, res) => {
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
            if (!staff || !staff.salonId) return res.status(200).json({ totalItems: 0, inStock: 0, lowStock: 0, outOfStock: 0 });
            filter.salonId = staff.salonId;
        }

        const totalItems = await Inventory.countDocuments(filter);

        const items = await Inventory.find(filter);
        const inStock = items.filter(i => i.stock > i.minStock).length;
        const lowStock = items.filter(i => i.stock > 0 && i.stock <= i.minStock).length;
        const outOfStock = items.filter(i => i.stock === 0).length;

        res.status(200).json({
            totalItems,
            inStock,
            lowStock,
            outOfStock
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
