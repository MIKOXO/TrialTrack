import express from "express";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import {
  createHearing,
  updateHearing,
  getHearings,
  getClientHearings,
  getHearingById,
  deleteHearing,
  getAvailableTimeSlots,
} from "../controllers/hearingController.js";

const router = express.Router();

//  Routes
router.get("/", authMiddleware, restrictTo("Judge", "Admin"), getHearings);
router.get("/client", authMiddleware, restrictTo("Client"), getClientHearings);
router.get(
  "/available-slots/:courtId/:date",
  authMiddleware,
  restrictTo("Judge"),
  getAvailableTimeSlots
);
router.get("/:id", authMiddleware, getHearingById);
router.post(
  "/create/:caseId",
  authMiddleware,
  restrictTo("Judge"),
  createHearing
);
router.put("/update/:id", authMiddleware, restrictTo("Judge"), updateHearing);
router.delete("/:id", authMiddleware, restrictTo("Judge"), deleteHearing);

export default router;
