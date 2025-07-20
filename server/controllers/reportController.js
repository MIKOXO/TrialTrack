import asyncHandler from "express-async-handler";
import Report from "../models/reportModel.js";

// @desc    Create a new report
// @route   POST api/report/create
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin")
    return res
      .status(403)
      .json({ error: "You have no authorization for this action!" });

  const { title, type, priority, department, description, date, data } =
    req.body;

  try {
    const report = new Report({
      title,
      type,
      priority,
      department,
      description,
      date: date || new Date(),
      data,
      createdBy: req.user._id,
    });

    await report.save();
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get all reports
// @route   GET api/report/reports
// @access  Private
const getAllReports = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin")
    return res.status(403).json({ error: "Only admins can view reports" });

  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get a report by ID
// @route   GET api/report/report/:id
// @access  Private
const getReportById = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin")
    return res.status(403).json({ error: "Only admins can view reports" });

  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Delete a report
// @route   DELETE api/report/delete/:id
// @access  Private
const deleteReport = asyncHandler(async (req, res) => {
  if (req.user.role !== "Admin")
    return res.status(403).json({ error: "Only admins can delete reports" });

  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ error: "Report not found" });

    await report.deleteOne();
    res.json({ message: "Report deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export { createReport, getAllReports, getReportById, deleteReport };
