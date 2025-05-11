import express from "express";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import { createCourt, getAllCourts } from "../controllers/courtControlers.js";

const router = express.Router();

//  Routes
router.post("/create", authMiddleware, restrictTo("Admin"), createCourt);
router.get(
  "/courts",
  authMiddleware,
  restrictTo("Admin", "Judge"),
  getAllCourts
);

export default router;
