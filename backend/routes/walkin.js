import express from "express";
import {
    createWalkin,
    getWalkinsBySalon,
    updateWalkinStatus,
    deleteWalkin
} from "../controllers/walkin.controller.js";

import { authenticateToken, requireStaff } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all walkin routes
router.use(authenticateToken);

router.post("/", requireStaff, createWalkin);
router.get("/", requireStaff, getWalkinsBySalon);
router.put("/:id", requireStaff, updateWalkinStatus);
router.delete("/:id", requireStaff, deleteWalkin);

export default router;
