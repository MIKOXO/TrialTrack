import Case from "../models/caseModel.js";
import Court from "../models/courtModel.js";
import Hearing from "../models/hearingModel.js";
import Notification from "../models/notificationModel.js";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";

// Helper function to check for hearing conflicts
const checkHearingConflict = async (
  courtId,
  date,
  time,
  excludeHearingId = null
) => {
  try {
    // Convert date to start and end of day for proper comparison
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find existing hearings for the same court and date
    const query = {
      court: courtId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      time: time,
    };

    // Exclude current hearing if updating
    if (excludeHearingId) {
      query._id = { $ne: excludeHearingId };
    }

    const conflictingHearing = await Hearing.findOne(query)
      .populate("case", "title")
      .populate("judge", "username");

    return conflictingHearing;
  } catch (error) {
    console.error("Error checking hearing conflict:", error);
    return null;
  }
};

// @desc    Create a new hearing
// @route   POST api/hearings/create
// @access  Private
const createHearing = asyncHandler(async (req, res) => {
  try {
    const { caseId } = req.params;
    const { date, time, notes, courtId } = req.body;

    // Court Validation
    const foundCourt = await Court.findById(courtId);
    if (!foundCourt) {
      return res.status(404).json({ error: "Court not found" });
    }

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

    // Check if case is closed
    if (courtCase.status === "Closed") {
      return res.status(400).json({
        error: "Cannot schedule hearing for closed case",
        details: `Case "${courtCase.title}" is closed and cannot have new hearings scheduled. Only open or in-progress cases can have hearings scheduled.`,
      });
    }

    // Check for scheduling conflicts
    const conflictingHearing = await checkHearingConflict(courtId, date, time);
    if (conflictingHearing) {
      return res.status(409).json({
        error: "Scheduling conflict detected",
        details: `${foundCourt.name} is already booked at ${time} on ${new Date(
          date
        ).toLocaleDateString()} for case "${
          conflictingHearing.case.title
        }" by Judge ${
          conflictingHearing.judge.username
        }. Please choose a different time or courtroom.`,
      });
    }

    // Create hearing
    const hearing = new Hearing({
      case: caseId,
      date,
      time,
      notes,
      court: foundCourt._id,
      judge: req.user.id,
    });

    await hearing.save();

    // Add hearing to case
    courtCase.hearings.push(hearing._id);
    await courtCase.save();

    // Create notification for the client
    try {
      const hearingDate = new Date(date).toLocaleDateString();
      const notificationMessage = `A hearing has been scheduled for your case "${courtCase.title}" on ${hearingDate} at ${time} in ${foundCourt.name} - ${foundCourt.location}. Please make sure to attend on time.`;

      await Notification.create({
        user: courtCase.client,
        title: "Hearing Scheduled",
        message: notificationMessage,
        type: "hearing_scheduled",
      });
    } catch (notificationError) {
      console.error("Error creating hearing notification:", notificationError);
      // Don't fail the hearing creation if notification fails
    }

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
    const { date, time, notes, courtId } = req.body;

    // Court Validation if court is being changed
    let foundCourt = null;
    if (courtId) {
      foundCourt = await Court.findById(courtId);
      if (!foundCourt) {
        return res.status(404).json({ error: "Court not found" });
      }
    }

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

    // Check if case is closed
    if (hearing.case.status === "Closed") {
      return res.status(400).json({
        error: "Cannot update hearing for closed case",
        details: `Case "${hearing.case.title}" is closed and its hearings cannot be modified. Only open or in-progress cases can have their hearings updated.`,
      });
    }

    // Check for scheduling conflicts if date, time, or court is being changed
    const newDate = date || hearing.date;
    const newTime = time || hearing.time;
    const newCourtId = foundCourt ? foundCourt._id : hearing.court;

    // Only check for conflicts if scheduling details are changing
    if (date || time || foundCourt) {
      const conflictingHearing = await checkHearingConflict(
        newCourtId,
        newDate,
        newTime,
        hearing._id
      );
      if (conflictingHearing) {
        const courtName = foundCourt
          ? foundCourt.name
          : "the selected courtroom";
        return res.status(409).json({
          error: "Scheduling conflict detected",
          details: `${courtName} is already booked at ${newTime} on ${new Date(
            newDate
          ).toLocaleDateString()} for case "${
            conflictingHearing.case.title
          }" by Judge ${
            conflictingHearing.judge.username
          }. Please choose a different time or courtroom.`,
        });
      }
    }

    // Update hearing
    hearing.date = date || hearing.date;
    hearing.time = time || hearing.time;
    hearing.notes = notes || hearing.notes;

    // Update court if provided
    if (foundCourt) {
      hearing.court = foundCourt._id;
    }

    await hearing.save();

    // Create notification for hearing update
    try {
      const hearingDate = new Date(hearing.date).toLocaleDateString();
      const courtInfo = foundCourt
        ? `${foundCourt.name} - ${foundCourt.location}`
        : "the assigned courtroom";
      const notificationMessage = `Your hearing for case "${hearing.case.title}" has been updated. New details: ${hearingDate} at ${hearing.time} in ${courtInfo}. Please note the changes.`;

      await Notification.create({
        user: hearing.case.client,
        title: "Hearing Updated",
        message: notificationMessage,
        type: "hearing_scheduled",
      });
    } catch (notificationError) {
      console.error(
        "Error creating hearing update notification:",
        notificationError
      );
      // Don't fail the hearing update if notification fails
    }

    res.json(hearing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get hearings for logged in judge or all hearings for admin
// @route   GET api/hearings
// @access  Private
const getHearings = asyncHandler(async (req, res) => {
  try {
    let hearings;

    if (req.user.role === "Judge") {
      // Find hearings for this judge
      hearings = await Hearing.find({ judge: req.user.id })
        .populate("case", "title")
        .populate("court", "name location")
        .populate("judge", "username firstName lastName")
        .sort({ date: 1 });
    } else if (req.user.role === "Admin") {
      // Admin can see all hearings
      hearings = await Hearing.find({})
        .populate("case", "title")
        .populate("court", "name location")
        .populate("judge", "username firstName lastName")
        .sort({ date: 1 });
    } else {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(hearings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get hearings for logged in client
// @route   GET api/hearings/client
// @access  Private (Client only)
const getClientHearings = asyncHandler(async (req, res) => {
  try {
    // Verify Client role
    if (req.user.role !== "Client") {
      return res
        .status(403)
        .json({ error: "Only clients can view their hearings" });
    }

    // Find all cases for this client
    const clientCases = await Case.find({ client: req.user.id }).select("_id");
    const caseIds = clientCases.map((c) => c._id);

    // Find hearings for client's cases
    const hearings = await Hearing.find({
      case: { $in: caseIds },
      date: { $gte: new Date() }, // Only upcoming hearings
    })
      .populate("case", "title")
      .populate("court", "name location")
      .populate("judge", "username")
      .sort({ date: 1 })
      .limit(10); // Limit to 10 most recent upcoming hearings

    res.json(hearings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get hearing by ID
// @route   GET api/hearings/:id
// @access  Private
const getHearingById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Find hearing
    const hearing = await Hearing.findById(id)
      .populate("case", "title description client defendant")
      .populate("court", "name location")
      .populate("judge", "username email");

    if (!hearing) {
      return res.status(404).json({ error: "Hearing not found" });
    }

    // Verify access (Judge assigned to case or Admin)
    const isJudgeAssigned =
      req.user.role === "Judge" && hearing.judge._id.equals(req.user.id);
    const isAdmin = req.user.role === "Admin";
    const isClient =
      req.user.role === "Client" && hearing.case.client.equals(req.user.id);

    if (!isJudgeAssigned && !isAdmin && !isClient) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(hearing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Delete hearing
// @route   DELETE api/hearings/:id
// @access  Private
const deleteHearing = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;

    // Verify Judge role
    if (req.user.role !== "Judge") {
      return res.status(403).json({ error: "Only judges can delete hearings" });
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

    // Check if case is closed
    if (hearing.case.status === "Closed") {
      return res.status(400).json({
        error: "Cannot delete hearing for closed case",
        details: `Case "${hearing.case.title}" is closed and its hearings cannot be deleted. Only open or in-progress cases can have their hearings modified.`,
      });
    }

    // Create notification for hearing cancellation before deletion
    try {
      const notificationMessage = `The hearing scheduled for your case "${hearing.case.title}" has been cancelled. You will be notified when a new hearing is scheduled.`;

      await Notification.create({
        user: hearing.case.client,
        title: "Hearing Cancelled",
        message: notificationMessage,
        type: "hearing_scheduled",
      });
    } catch (notificationError) {
      console.error(
        "Error creating hearing cancellation notification:",
        notificationError
      );
      // Don't fail the hearing deletion if notification fails
    }

    // Remove hearing from case
    await Case.findByIdAndUpdate(hearing.case._id, {
      $pull: { hearings: hearing._id },
    });

    // Delete hearing
    await Hearing.findByIdAndDelete(id);

    res.json({ message: "Hearing deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get available time slots for a court on a specific date
// @route   GET api/hearings/available-slots/:courtId/:date
// @access  Private
const getAvailableTimeSlots = asyncHandler(async (req, res) => {
  try {
    const { courtId, date } = req.params;

    console.log("getAvailableTimeSlots called with:", {
      courtId,
      date,
      userRole: req.user.role,
    });

    // Validate parameters
    if (!courtId || !date) {
      return res.status(400).json({ error: "Court ID and date are required" });
    }

    // Validate courtId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(courtId)) {
      return res.status(400).json({ error: "Invalid court ID format" });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD" });
    }

    // Verify Judge role
    if (req.user.role !== "Judge") {
      return res
        .status(403)
        .json({ error: "Only judges can check available slots" });
    }

    // Validate court exists
    console.log("Looking for court with ID:", courtId);
    const court = await Court.findById(courtId);
    console.log("Found court:", court);
    if (!court) {
      return res.status(404).json({ error: "Court not found" });
    }

    // Define standard court hours (9 AM to 5 PM)
    const standardTimeSlots = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "13:00",
      "13:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
    ];

    // Get existing hearings for the date
    console.log("Processing date:", date);

    // Parse date more carefully
    const inputDate = new Date(date + "T00:00:00.000Z"); // Ensure UTC
    if (isNaN(inputDate.getTime())) {
      return res.status(400).json({ error: "Invalid date provided" });
    }

    const startOfDay = new Date(inputDate);
    startOfDay.setUTCHours(0, 0, 0, 0);

    const endOfDay = new Date(inputDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    console.log("Date range:", { startOfDay, endOfDay, inputDate });

    console.log("Querying hearings for court:", courtId);
    const existingHearings = await Hearing.find({
      court: courtId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    })
      .populate("case", "title")
      .populate("judge", "username");

    console.log("Found existing hearings:", existingHearings.length);

    // Get booked time slots
    const bookedSlots = existingHearings.map((hearing) => hearing.time);

    // Calculate available slots
    const availableSlots = standardTimeSlots.filter(
      (slot) => !bookedSlots.includes(slot)
    );

    // Return both available and booked slots with details
    const bookedSlotsWithDetails = existingHearings.map((hearing) => ({
      time: hearing.time,
      caseTitle: hearing.case.title,
      judgeName: hearing.judge.username,
    }));

    res.json({
      court: {
        id: court._id,
        name: court.name,
        location: court.location,
      },
      date: date,
      availableSlots,
      bookedSlots: bookedSlotsWithDetails,
      totalSlots: standardTimeSlots.length,
      availableCount: availableSlots.length,
      bookedCount: bookedSlots.length,
    });
  } catch (err) {
    console.error("Error in getAvailableTimeSlots:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

export {
  createHearing,
  updateHearing,
  getHearings,
  getClientHearings,
  getHearingById,
  deleteHearing,
  getAvailableTimeSlots,
};
