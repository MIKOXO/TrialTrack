import Case from "../models/caseModel.js";
import Hearing from "../models/hearingModel.js";
import asyncHandler from "express-async-handler";

// @desc    Create a new hearing
// @route   POST api/hearings/create
// @access  Private
const createHearing = asyncHandler(async (req, res) => {
  try {
    const { caseId } = req.params;
    const { date, location, notes } = req.body;

    // Verify Judge role
    if (req.user.role !== "Judge") {
      return res
        .status(403)
        .json({ error: "Only judges can schedule hearings" });
    }

    // Verify case exists and judge is assigned
    const courtCase = await Case.findById(caseId);
    if (!courtCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    if (!courtCase.judge || courtCase.judge.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not assigned to this case" });
    }

    // Create hearing
    const hearing = new Hearing({
      case: caseId,
      date,
      location,
      notes,
      createdBy: req.user.id,
    });

    await hearing.save();

    // Add hearing to case
    courtCase.hearings.push(hearing._id);
    await courtCase.save();

    res.status(201).json(hearing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Update hearing
// @route   PUT api/hearings/update/:hearingId
// @access  Private
const updateHearing = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { date, location, notes } = req.body;

    // Verify Judge role
    if (req.user.role !== "Judge") {
      return res.status(403).json({ error: "Only judges can update hearings" });
    }

    // Find hearing
    const hearing = await Hearing.findById(id).populate("case");
    if (!hearing) {
      return res.status(404).json({ error: "Hearing not found" });
    }

    // Verify judge is assigned to the case
    if (!hearing.case.judge || hearing.case.judge.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ error: "You are not assigned to this case" });
    }

    // Update hearing
    hearing.date = date || hearing.date;
    hearing.location = location || hearing.location;
    hearing.notes = notes || hearing.notes;

    await hearing.save();

    res.json(hearing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { createHearing, updateHearing };
