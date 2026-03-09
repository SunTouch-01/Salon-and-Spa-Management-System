import express from "express";
import {
    createExpense,
    getExpenses,
    getExpenseById,
    updateExpense,
    deleteExpense,
    getExpenseStats,
    getWeeklyExpenses,
    getExpensesByDuration
} from "../controllers/expense.controller.js";

import { authenticateToken, requireStaff } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all expense routes
router.use(authenticateToken);

// Stats route (must be before /:id route)
router.get("/stats", requireStaff, getExpenseStats);
router.get("/weekly", requireStaff, getWeeklyExpenses);
router.get("/by-duration", requireStaff, getExpensesByDuration);

// CRUD operations
router.post("/", requireStaff, createExpense);
router.get("/", requireStaff, getExpenses);
router.get("/:id", requireStaff, getExpenseById);
router.put("/:id", requireStaff, updateExpense);
router.delete("/:id", requireStaff, deleteExpense);


export default router;
