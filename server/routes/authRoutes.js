import express from "express";
import {
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  updateUserProfile,
  uploadProfilePicture,
  deleteUserProfile,
  getUsers,
} from "../controllers/authController.js";
import { authMiddleware, restrictTo } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/me", authMiddleware, getMe);
router.put("/update/:id", authMiddleware, updateUserProfile);
router.post(
  "/upload-profile-picture/:id",
  authMiddleware,
  upload.single("profilePicture"),
  uploadProfilePicture
);
router.delete("/delete/:id", authMiddleware, deleteUserProfile);
router.get("/users", authMiddleware, restrictTo("Admin"), getUsers);

export default router;
