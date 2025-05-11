import express from "express";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import {
  createReport,
  getAllReports,
  getReportById,
  deleteReport,
} from "../controllers/reportController.js";

const router = express.Router();

// Routes
router.post("/create", authMiddleware, restrictTo("Admin"), createReport);
router.get("/reports", authMiddleware, restrictTo("Admin"), getAllReports);
router.get("/report/:id", authMiddleware, restrictTo("Admin"), getReportById);
router.delete("/delete/:id", authMiddleware, restrictTo("Admin"), deleteReport);

export default router;
