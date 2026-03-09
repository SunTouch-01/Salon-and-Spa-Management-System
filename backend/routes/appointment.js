import express from "express";
import {
    createAppointment,
    getAppointments,
    getAppointmentById,
    updateAppointment,
    deleteAppointment,
    completeAppointment,
    getTodayStats,
    getRevenueStats,
    getDashboardStats,
    getEarningsPageData,
    checkAvailability,
    checkStaffAvailability
} from "../controllers/appointment.controller.js";

import { authenticateToken, requireStaff } from "../middleware/auth.js";

const router = express.Router();

// Create appointment - public for clients
router.post("/", createAppointment);

// Public endpoint for clients to check staff availability (no auth required)
router.get("/check-staff-availability", checkStaffAvailability);

// Protected routes below
router.use(authenticateToken);

// All appointment operations require staff role (owners and staff can manage appointments)
router.get("/check-availability", requireStaff, checkAvailability);
router.get("/today-stats", requireStaff, getTodayStats);

router.get("/revenue-stats", requireStaff, getRevenueStats);
router.get("/dashboard-stats", requireStaff, getDashboardStats);
router.get("/earnings-data", requireStaff, getEarningsPageData);
router.get("/", requireStaff, getAppointments);
router.get("/:id", requireStaff, getAppointmentById);
router.put("/:id", requireStaff, updateAppointment);
router.delete("/:id", requireStaff, deleteAppointment);
router.put("/:id/complete", requireStaff, completeAppointment);

export default router;
