import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
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
    res.status(201).json({
      _id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
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
  const { email, password } = req.body;

  // Check for user email
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      token: generateToken(user._id),
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

  const allowedFields = ["username", "email"];
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) return res.status(404).json({ error: "User not found" });

  res.json(updatedUser);
  res.status(400).json({ error: err.message });
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
  deleteUserProfile,
  getUsers,
  // selectRole,
};
