import express from "express";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import {
  submitComment,
  getComments,
  updateCommentStatus,
  getCommentStats,
} from "../controllers/commentController.js";

const router = express.Router();

// Client routes - submit feedback/comments
router.post("/submit", authMiddleware, restrictTo("Client"), submitComment);

// Admin routes - manage comments
router.get("/", authMiddleware, restrictTo("Admin"), getComments);
router.get("/stats", authMiddleware, restrictTo("Admin"), getCommentStats);
router.put(
  "/status/:id",
  authMiddleware,
  restrictTo("Admin"),
  updateCommentStatus
);

export default router;
