import express from "express";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import {
  createHearing,
  updateHearing,
} from "../controllers/hearingController.js";

const router = express.Router();

router.post(
  "/create/:caseId",
  authMiddleware,
  restrictTo("Judge"),
  createHearing
);
router.put("/update/:id", authMiddleware, restrictTo("Judge"), updateHearing);

export default router;
