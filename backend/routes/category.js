import express from "express";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../controllers/category.controller.js";

import { authenticateToken, requireStaff } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all category routes
router.use(authenticateToken);

router.post("/", requireStaff, createCategory);
router.get("/", requireStaff, getCategories);
router.put("/:id", requireStaff, updateCategory);
router.delete("/:id", requireStaff, deleteCategory);

export default router;
