import asyncHandler from "express-async-handler";
import Case from "../models/caseModel.js";

// @desc    File a new case
// @route   POST api/case/file
// @access  Private
const fileCase = asyncHandler(async (req, res) => {
  if (req.user.role !== "Client") {
    return res.status(403).json({ error: "Only clients can file cases" });
  }

  const { title, description, defendant } = req.body;

  if (!defendant || !defendant.name) {
    return res.status(400).json({ error: "Defendant information is required" });
  }

  const courtCase = new Case({
    title,
    description,
    defendant,
    client: req.user.id,
    status: "open",
  });

  await courtCase.save();

  if (courtCase) {
    res.status(201).json({
      _id: courtCase._id,
      title: courtCase.title,
      description: courtCase.description,
      status: courtCase.status,
      createdAt: courtCase.createdAt,
      client: req.user.id,
      defendant: courtCase.defendant,
    });
  } else {
    res.status(400);
    throw new Error("Case filing failed");
  }
});

// @desc    Assign a case to a judge
// @route   PUT api/case/assign
// @access  Private
const assignCase = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res.status(403).json({ error: "Only admins can assign cases" });
    }

    const { caseId } = req.params;
    const { judgeId } = req.body;

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { judge: judgeId },
      { new: true }
    ).populate("client judge court");

    if (!updatedCase) {
      res.status(404).json({ error: "Case not found" });
    }

    res.status(200).json(updatedCase);
  } catch (error) {
    res.status(400).json({ error: "Error assigning case" });
  }
});

// @desc    Get case by ID
// @route   GET api/case/:caseId
// @access  Private
const getCaseById = asyncHandler(async (req, res) => {
  try {
    const courtCase = await Case.findById(req.params.id).populate(
      "client judge court documents hearings reports"
    );

    if (!courtCase) return res.status(404).json({ error: "Case not found" });

    const isRelated =
      req.user.role === "Admin" ||
      (req.user.role === "Client" &&
        courtCase.client._id.equals(req.user.id)) ||
      (req.user.role === "Judge" &&
        courtCase.judge &&
        courtCase.judge._id.equals(req.user.id));

    if (!isRelated) return res.status(403).json({ error: "Access denied" });

    res.json(courtCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Get Cases for Logged In User
// @route   GET api/case
// @access  Private
const getCases = asyncHandler(async (req, res) => {
  try {
    // const filter = {};

    // if (req.user.role === "Client") {
    //   filter.client = req.user.id;
    // } else if (req.user.role === "Judge") {
    //   filter.judge = req.user.id;
    // }

    const cases = await Case.find();

    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Delete a case
// @route   DELETE api/case
// @access  Private
const deleteCase = asyncHandler(async (req, res) => {
  try {
    if (req.user.role !== "Admin") {
      return res
        .status(403)
        .json({ error: "You have no permission for this action" });
    }

    const deletedCase = await Case.findByIdAndDelete(req.params.id);
    if (!deletedCase) return res.status(404).json({ error: "Case not found" });

    res.json({ message: "Case deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// @desc    Update case status
// @route   PUT api/case/status/:caseId
// @access  Private
const updateCaseStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ["Open", "In Progress", "Closed"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const courtCase = await Case.findById(id).populate("judge client");

    if (!courtCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Authorization: Only Admin or assigned Judge can update status
    const isAdmin = req.user.role === "Admin";
    const isAssignedJudge =
      req.user.role === "Judge" &&
      courtCase.judge &&
      courtCase.judge._id.equals(req.user.id);

    if (!isAdmin && !isAssignedJudge) {
      return res
        .status(403)
        .json({ error: "Unauthorized to update case status" });
    }

    courtCase.status = status;
    await courtCase.save();

    res.json({ message: "Case status updated successfully", case: courtCase });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export {
  fileCase,
  assignCase,
  getCaseById,
  getCases,
  deleteCase,
  updateCaseStatus,
};
