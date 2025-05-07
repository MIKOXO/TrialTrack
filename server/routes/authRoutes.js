import express from "express";
import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
  deleteUserProfile,
  getUsers,
} from "../controllers/authController.js";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getMe);
router.put("/update/:id", authMiddleware, updateUserProfile);
router.delete("/delete/:id", authMiddleware, deleteUserProfile);
router.get("/users", authMiddleware, restrictTo("Admin"), getUsers);

export default router;
