import asyncHandler from "express-async-handler";
import Court from "../models/courtModel.js";

// @desc    Create Court
// @route   POST api/court/create
// @access  Private
const createCourt = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin")
    return res.status(403).json({ error: "Only admins can create courts" });

  const { name, location, capacity } = req.body;

  try {
    const court = new Court({ name, location, capacity });
    await court.save();
    res.status(201).json(court);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get all Courts
// @route   GET api/court/courts
// @access  Private
const getAllCourts = asyncHandler(async (req, res) => {
  if (!["Admin", "Judge"].includes(req.user.role))
    return res.status(403).json({ error: "Unauthorized" });

  try {
    const courts = await Court.find();
    res.json(courts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { createCourt, getAllCourts };
