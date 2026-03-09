import Salon from "../models/Salon.js";
import Owner from "../models/Owner.js";

// Create Salon
export const createSalon = async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Check branch limit
    const owner = await Owner.findById(ownerId);
    if (!owner) return res.status(404).json({ message: "Owner not found" });

    const currentBranchCount = owner.salons.length;
    const branchLimit = owner.subscription?.branchLimit || 1;

    if (currentBranchCount >= branchLimit) {
      return res.status(403).json({
        message: `Branch limit reached (${branchLimit}). Please upgrade your plan to add more branches.`
      });
    }

    const salon = new Salon({ ...req.body, ownerId });
    await salon.save();

    // Update Owner's salons array
    await Owner.findByIdAndUpdate(ownerId, {
      $push: { salons: salon._id }
    });

    res.status(201).json(salon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Salons (Optional: Filter by ownerId)
export const getSalons = async (req, res) => {
  try {
    const { ownerId } = req.query;
    let filter = { isActive: true };

    if (ownerId) {
      filter.ownerId = ownerId;
    } else if (req.user && req.user.role === 'owner') {
      filter.ownerId = req.user.id;
    } else {
      // Public request - return all active salons for booking flow
      const salons = await Salon.find(filter).populate('ownerId', 'name email');
      return res.status(200).json(salons);
    }

    const salons = await Salon.find(filter).populate('ownerId', 'name email');
    res.status(200).json(salons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Salon by ID
export const getSalonById = async (req, res) => {
  try {
    const salon = await Salon.findById(req.params.id)
      .populate('ownerId', 'name email')
      .populate('staff', 'name email role profession mobile accessToTabs');
    if (!salon) return res.status(404).json({ message: "Salon not found" });
    res.status(200).json(salon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Salon
export const updateSalon = async (req, res) => {
  try {
    const salon = await Salon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!salon) return res.status(404).json({ message: "Salon not found" });
    res.status(200).json(salon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete Salon
export const deleteSalon = async (req, res) => {
  try {
    const salon = await Salon.findByIdAndDelete(req.params.id);
    if (!salon) return res.status(404).json({ message: "Salon not found" });

    // Remove from Owner's salons array
    if (salon.ownerId) {
      await Owner.findByIdAndUpdate(salon.ownerId, {
        $pull: { salons: salon._id }
      });
    }

    res.status(200).json({ message: "Salon deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
