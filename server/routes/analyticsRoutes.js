import express from "express";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import {
  getDashboardAnalytics,
  getCaseTrends,
} from "../controllers/analyticsController.js";

const router = express.Router();

// Routes
router.get(
  "/dashboard",
  authMiddleware,
  restrictTo("Admin"),
  getDashboardAnalytics
);
router.get("/case-trends", authMiddleware, restrictTo("Admin"), getCaseTrends);

export default router;
