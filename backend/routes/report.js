import express from "express";
import { getReports } from "../controllers/report.controller.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.get("/", authenticateToken, getReports);

export default router;
