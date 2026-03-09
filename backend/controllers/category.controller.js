import Category from "../models/Category.js";
import Service from "../models/Service.js";
import Salon from "../models/Salon.js";
import Staff from "../models/Staff.js";

export const createCategory = async (req, res) => {
    try {
        const { salonId, name } = req.body;
        if (!salonId || !name) {
            return res.status(400).json({ message: "Salon ID and name are required" });
        }
        const category = new Category({ salonId, name });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getCategories = async (req, res) => {
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
            filter.salonId = staff.salonId;
        } else {
            if (!salonId) return res.status(400).json({ message: "Salon ID is required" });
            filter.salonId = salonId;
        }

        const categories = await Category.find(filter);
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id;

        // NEW: Delete all services in this category
        await Service.deleteMany({ categoryId });

        const category = await Category.findByIdAndDelete(categoryId);
        if (!category) return res.status(404).json({ message: "Category not found" });
        res.status(200).json({ message: "Category and associated services deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
