import express from "express";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import {
  fileCase,
  assignCase,
  getCaseById,
  getCases,
  deleteCase,
  updateCaseStatus,
} from "../controllers/caseController.js";

const router = express.Router();

router.post("/file", authMiddleware, restrictTo("Client"), fileCase);
router.put("/assign/:caseId", authMiddleware, restrictTo("Admin"), assignCase);
router.get("/:id", authMiddleware, getCaseById);
router.get("/", authMiddleware, getCases);
router.delete("/:id", authMiddleware, restrictTo("Admin"), deleteCase);
router.put(
  "/status/:id",
  authMiddleware,
  restrictTo("Admin", "Judge"),
  updateCaseStatus
);

export default router;
