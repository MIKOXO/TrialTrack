import express from "express";
import {
  authUser,
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  selectRole,
  updateUserProfile,
} from "../controllers/authController.js";
const router = express.Router();

router.post("/authenticate", authUser);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.route("/me").get(getMe).put(updateUserProfile);
router.post("/role", selectRole);

export default router;
