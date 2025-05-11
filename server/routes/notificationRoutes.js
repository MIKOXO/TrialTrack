import express from "express";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import {
  sendNotification,
  getMyNotifications,
  markAsRead,
} from "../controllers/notificationController.js";

const router = express.Router();

// Routes
router.post("/send", authMiddleware, sendNotification);
router.get("/getNotifications", authMiddleware, getMyNotifications);
router.put("/read/:id", authMiddleware, markAsRead);

export default router;
