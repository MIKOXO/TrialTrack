import asyncHandler from "express-async-handler";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {
  validatePasswordStrength,
  formatPasswordErrors,
} from "../utils/passwordValidation.js";

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

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    res.status(400);
    throw new Error(formatPasswordErrors(passwordValidation.errors));
  }

  // Security: Only allow Client role for public registration
  // Admin and Judge roles should only be created by existing admins
  const allowedRole = "Client";
  if (role && role !== allowedRole) {
    res.status(403);
    throw new Error("Unauthorized role assignment");
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

  // Create user with Client role only
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: allowedRole,
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
    return res.status(403).json({ error: `You are not registered as ${role}` });
  }

  if (await bcrypt.compare(password, user.password)) {
    // Check if user must change password (especially for judges on first login)
    if (user.mustChangePassword) {
      const token = generateToken(user);
      return res.json({
        token,
        mustChangePassword: true,
        user: {
          _id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          isFirstLogin: user.isFirstLogin,
        },
        message: "Password change required before accessing the system",
      });
    }

    const token = generateToken(user);
    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture:
          user.profilePicture && user.profilePicture.data
            ? {
                contentType: user.profilePicture.contentType,
                url: `/api/auth/profile-picture/${user._id}`,
              }
            : null,
        firstName: user.firstName,
        lastName: user.lastName,
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
  const user = await User.findById(req.user.id);

  res.status(200).json({
    id: user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    profilePicture:
      user.profilePicture && user.profilePicture.data
        ? {
            contentType: user.profilePicture.contentType,
            url: `/api/auth/profile-picture/${user._id}`,
          }
        : null,
    firstName: user.firstName,
    lastName: user.lastName,
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

  // Transform users data to include proper profile picture structure
  const transformedUsers = users.map((user) => ({
    ...user.toObject(),
    profilePicture:
      user.profilePicture && user.profilePicture.data
        ? {
            contentType: user.profilePicture.contentType,
            url: `/api/auth/profile-picture/${user._id}`,
          }
        : null,
  }));

  res.json(transformedUsers);
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

      // Validate new password strength
      const passwordValidation = validatePasswordStrength(req.body.newPassword);
      if (!passwordValidation.isValid) {
        return res.status(400).json({
          error: formatPasswordErrors(passwordValidation.errors),
        });
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
      updates.lastPasswordChange = new Date();
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

    // Update user with new profile picture data
    const updatedUser = await User.findByIdAndUpdate(
      id,
      {
        profilePicture: {
          data: req.file.buffer,
          contentType: req.file.mimetype,
        },
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Profile picture uploaded successfully",
      user: {
        ...updatedUser.toObject(),
        profilePicture: updatedUser.profilePicture
          ? {
              contentType: updatedUser.profilePicture.contentType,
              hasData: !!updatedUser.profilePicture.data,
            }
          : null,
      },
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// @desc    Get profile picture
// @route   GET api/auth/profile-picture/:id
// @access  Public
const getProfilePicture = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("profilePicture");
    if (!user || !user.profilePicture || !user.profilePicture.data) {
      return res.status(404).json({ error: "Profile picture not found" });
    }

    res.setHeader("Content-Type", user.profilePicture.contentType);
    res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
    res.send(user.profilePicture.data);
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

// @desc    Create judge (Admin only)
// @route   POST api/auth/create-judge
// @access  Private/Admin
const createJudge = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error("Please add all fields");
  }

  // Validate password strength
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    res.status(400);
    throw new Error(formatPasswordErrors(passwordValidation.errors));
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

  // Create judge with mandatory password change requirement
  const judge = await User.create({
    username,
    email,
    password: hashedPassword,
    role: "Judge",
    mustChangePassword: true,
    isFirstLogin: true,
  });

  if (judge) {
    res.status(201).json({
      _id: judge._id,
      username: judge.username,
      email: judge.email,
      role: judge.role,
      message: "Judge created successfully",
    });
  } else {
    res.status(400);
    throw new Error("Invalid judge data");
  }
});

// @desc    Force password change (for first login)
// @route   POST api/auth/force-password-change
// @access  Private
const forcePasswordChange = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const userId = req.user.id;

  if (!newPassword) {
    res.status(400);
    throw new Error("New password is required");
  }

  // Validate new password strength
  const passwordValidation = validatePasswordStrength(newPassword);
  if (!passwordValidation.isValid) {
    res.status(400);
    throw new Error(formatPasswordErrors(passwordValidation.errors));
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Only allow this endpoint for users who must change their password
    if (!user.mustChangePassword) {
      res.status(403);
      throw new Error("Password change not required for this user");
    }

    // Ensure new password is different from current password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      res.status(400);
      throw new Error(
        "New password must be different from your current password"
      );
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update user with new password and clear flags
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        password: hashedPassword,
        mustChangePassword: false,
        isFirstLogin: false,
        lastPasswordChange: new Date(),
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      message: "Password changed successfully",
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        profilePicture: updatedUser.profilePicture,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      },
    });
  } catch (err) {
    res.status(400);
    throw new Error(err.message);
  }
});

export {
  generateToken,
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateUserProfile,
  uploadProfilePicture,
  getProfilePicture,
  deleteUserProfile,
  getUsers,
  createJudge,
  forcePasswordChange,
};
