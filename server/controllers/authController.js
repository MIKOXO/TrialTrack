import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id || user.id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: "30d",
    }
  );
};

// @desc    Register user
// @route   POST api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password || !role) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role,
  });

  if (user) {
    const token = generateToken(user);
    res.status(201).json({
      token,
      user: {
        _id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    res.status(400);
    throw new Error("Invalid User Data");
  }
});

// @desc    Login user
// @route   POST api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).send({ error: "Invalid Credentials" });
  }

  if (user.role !== role) {
    return res
      .status(403)
      .json({ error: `You are not registered as a ${role}` });
  }

  if (await bcrypt.compare(password, user.password)) {
    const token = generateToken(user);
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } else {
    return res.status(400).send({ error: "Invalid Credentials" });
  }
});

// @desc    Logout user
// @route   POST api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Logout User" });
});

// @desc    Get User Profile
// @route   GET api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const { _id, username, email, role } = await User.findById(req.user.id);

  res.status(200).json({
    id: _id,
    username,
    email,
    role,
  });
});

// @desc    Get all users
// @route   GET api/auth/users
// @access  Private
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select("-password");
  if (!req.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!users) return res.status(404).json({ error: "No users found" });

  res.json(users);
});

// @desc    Update user profile
// @route   PUT api/auth/update/:id
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if user is updating their own profile or is an admin
    if (req.user.id !== id && req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    const allowedFields = [
      "username",
      "email",
      "firstName",
      "lastName",
      "phone",
      "profilePicture",
    ];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    // Handle password change
    if (req.body.newPassword) {
      if (!req.body.currentPassword) {
        return res
          .status(400)
          .json({ error: "Current password is required to change password" });
      }

      const isCurrentPasswordValid = await bcrypt.compare(
        req.body.currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      updates.password = await bcrypt.hash(req.body.newPassword, salt);
    }

    updates.updatedAt = new Date();

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Upload profile picture
// @route   POST api/auth/upload-profile-picture/:id
// @access  Private
const uploadProfilePicture = asyncHandler(async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Check if user is updating their own profile or is an admin
    if (req.user.id !== id && req.user.role !== "Admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Delete old profile picture if it exists
    if (user.profilePicture) {
      const oldImagePath = path.join(
        process.cwd(),
        "uploads",
        user.profilePicture
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Update user with new profile picture path
    const profilePicturePath = req.file.filename;
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        profilePicture: profilePicturePath,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile picture uploaded successfully",
      user: updatedUser,
      profilePictureUrl: `/uploads/${profilePicturePath}`,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Delete user profile
// @route   PUT api/auth/delete
// @access  Private
const deleteUserProfile = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (req.user.id !== id && req.user.role !== "Admin") {
    return res.status(403).json({ error: "Access denied" });
  }

  const user = await User.findByIdAndDelete(id);

  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({ message: "User deleted successfully" });
});

// // @desc    Select a role
// // @route   POST api/auth/role
// // @access  Public
// const selectRole = asyncHandler(async (req, res) => {
//   res.status(200).json({ message: "Role Selector" });
// });

export {
  generateToken,
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateUserProfile,
  uploadProfilePicture,
  deleteUserProfile,
  getUsers,
};
