import express from "express";
import {
    createOffer,
    getOffers,
    getOfferById,
    updateOffer,
    deleteOffer
} from "../controllers/offer.controller.js";
import { authenticateToken, requireOwner, requireStaff } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all offer routes
// Public routes
router.get("/", getOffers);
router.get("/:id", getOfferById);

// Protected routes - require authentication

// Create offer - only owners can create offers
router.post("/", authenticateToken, requireOwner, createOffer);

// Get offers - both owners and staff can view offers
// Get offers - public access
// router.get("/", requireStaff, getOffers); // Moved to public

// Get offer by ID - both owners and staff can view offer details
// Get offer by ID - public access
// router.get("/:id", requireStaff, getOfferById); // Moved to public

// Update offer - only owners can update offers
router.put("/:id", authenticateToken, requireOwner, updateOffer);

// Delete offer - only owners can delete offers
router.delete("/:id", authenticateToken, requireOwner, deleteOffer);

export default router;
