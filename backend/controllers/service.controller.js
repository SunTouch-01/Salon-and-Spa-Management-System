import Service from "../models/Service.js";
import Salon from "../models/Salon.js";
import Staff from "../models/Staff.js";

export const createService = async (req, res) => {
    try {
        const service = new Service(req.body);
        await service.save();
        res.status(201).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getServices = async (req, res) => {
    try {
        const { salonId, categoryId } = req.query;
        let filter = {};

        if (req.user && req.user.role === 'owner') {
            if (salonId) {
                // Ensure the salon belongs to the owner
                const salon = await Salon.findOne({ _id: salonId, ownerId: req.user.id });
                if (!salon) return res.status(403).json({ message: "Access denied" });
                filter.salonId = salonId;
            } else {
                // Return services for all salons owned by this user
                const salons = await Salon.find({ ownerId: req.user.id });
                filter.salonId = { $in: salons.map(s => s._id) };
            }
        } else if (req.user) {
            // For staff, restrict to their salonId
            const staff = await Staff.findById(req.user.id);
            if (!staff || !staff.salonId) return res.status(200).json([]);
            filter.salonId = staff.salonId;
        } else {
            // Public request - Allow fetching all services if no salonId provided
            if (salonId) {
                filter.salonId = salonId;
            }
        }

        if (categoryId) filter.categoryId = categoryId;

        const services = await Service.find(filter).populate('categoryId', 'name').populate('salonId', 'name');
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id).populate('categoryId', 'name').populate('salonId', 'name');
        if (!service) return res.status(404).json({ message: "Service not found" });
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!service) return res.status(404).json({ message: "Service not found" });
        res.status(200).json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const service = await Service.findByIdAndDelete(req.params.id);
        if (!service) return res.status(404).json({ message: "Service not found" });
        res.status(200).json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
