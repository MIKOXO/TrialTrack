import asyncHandler from "express-async-handler";
// @desc    Authenticate user
// @route   POST api/auth/authenticate
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Auth User" });
});

// @desc    Register user
// @route   POST api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Register User" });
});

// @desc    Login user
// @route   POST api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Login User" });
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
  res.status(200).json({ message: "User Profile" });
});

// @desc    Update user profile
// @route   PUT api/auth/me
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Update Profile" });
});

// @desc    Select a role
// @route   POST api/auth/role
// @access  Public
const selectRole = asyncHandler(async (req, res) => {
  res.status(200).json({ message: "Role Selector" });
});

export {
  authUser,
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateUserProfile,
  selectRole,
};
