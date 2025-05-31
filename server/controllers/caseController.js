import asyncHandler from "express-async-handler";
import Case from "../models/caseModel.js";
import Notification from "../models/notificationModel.js";

// @desc    File a new case
// @route   POST api/case/file
// @access  Private
const fileCase = asyncHandler(async (req, res) => {
  if (req.user.role !== "Client") {
    return res.status(403).json({ error: "Only clients can file cases" });
  }

  const {
    title,
    description,
    defendant,
    plaintiff,
    caseType,
    court,
    reportDate,
    evidence,
    // Phase 1 - Essential Fields
    priority,
    urgencyReason,
    representation,
    reliefSought,
    compliance,
  } = req.body;

  // Validate required fields
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Case title is required" });
  }

  if (!description || !description.trim()) {
    return res.status(400).json({ error: "Case description is required" });
  }

  if (!defendant || !defendant.name || !defendant.name.trim()) {
    return res.status(400).json({ error: "Defendant information is required" });
  }

  // Validate compliance fields (required for legal filing)
  if (!compliance || !compliance.verificationStatement) {
    return res
      .status(400)
      .json({ error: "Verification statement is required" });
  }

  if (!compliance.perjuryAcknowledgment) {
    return res
      .status(400)
      .json({ error: "Perjury acknowledgment is required" });
  }

  if (!compliance.courtRulesAcknowledgment) {
    return res
      .status(400)
      .json({ error: "Court rules acknowledgment is required" });
  }

  try {
    const courtCase = new Case({
      title: title.trim(),
      description: description.trim(),
      defendant: {
        name: defendant.name.trim(),
        email: defendant.email || "",
        phone: defendant.phone || "",
        address: defendant.address || "",
      },
      plaintiff:
        plaintiff && plaintiff.name
          ? {
              name: plaintiff.name.trim(),
              email: plaintiff.email || "",
              phone: plaintiff.phone || "",
              address: plaintiff.address || "",
            }
          : undefined,
      caseType: caseType || "",
      court: court || "",
      reportDate: reportDate || null,
      evidence: evidence || "",
      // Phase 1 - Essential Fields
      priority: priority || "Medium",
      urgencyReason: urgencyReason || "",
      representation: representation || {
        hasLawyer: false,
        selfRepresented: true,
      },
      reliefSought: reliefSought || {},
      compliance: {
        verificationStatement: compliance.verificationStatement,
        perjuryAcknowledgment: compliance.perjuryAcknowledgment,
        courtRulesAcknowledgment: compliance.courtRulesAcknowledgment,
        signatureDate: new Date(),
        electronicSignature:
          compliance.electronicSignature || req.user.username,
      },
      client: req.user.id,
      status: "Open", // Fixed: Use capitalized status to match schema enum
    });

    const savedCase = await courtCase.save();

    // Create notification for successful case filing
    try {
      await Notification.create({
        user: req.user.id,
        title: "Case Filed Successfully",
        message: `Your case "${savedCase.title}" has been filed successfully and is now under review.`,
        type: "case_update",
      });
    } catch (notificationError) {
      console.error("Error creating notification:", notificationError);
      // Don't fail the case filing if notification fails
    }

    res.status(201).json({
      _id: savedCase._id,
      title: savedCase.title,
      description: savedCase.description,
      status: savedCase.status,
      caseType: savedCase.caseType,
      court: savedCase.court,
      reportDate: savedCase.reportDate,
      createdAt: savedCase.createdAt,
      client: req.user.id,
      defendant: savedCase.defendant,
      plaintiff: savedCase.plaintiff,
      evidence: savedCase.evidence,
      priority: savedCase.priority,
      urgencyReason: savedCase.urgencyReason,
      representation: savedCase.representation,
      reliefSought: savedCase.reliefSought,
      compliance: savedCase.compliance,
      message: "Case filed successfully",
    });
  } catch (error) {
    console.error("Error filing case:", error);
    res.status(400).json({
      error: "Case filing failed",
      details: error.message,
    });
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

    // First, find the case to check its status
    const existingCase = await Case.findById(caseId);
    if (!existingCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Check if case is closed
    if (existingCase.status === "Closed") {
      return res.status(400).json({
        error: "Cannot assign judge to closed case",
        details: `Case "${existingCase.title}" is closed and cannot be assigned to a judge. Only open or in-progress cases can be assigned to judges.`,
      });
    }

    const updatedCase = await Case.findByIdAndUpdate(
      caseId,
      { judge: judgeId },
      { new: true }
    ).populate("client judge courtRef");

    if (!updatedCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Create notification for case assignment
    try {
      await Notification.create({
        user: updatedCase.client._id,
        title: "Judge Assigned to Your Case",
        message: `Judge ${updatedCase.judge.username} has been assigned to your case "${updatedCase.title}". Your case will now be reviewed.`,
        type: "case_update",
      });
    } catch (notificationError) {
      console.error(
        "Error creating assignment notification:",
        notificationError
      );
      // Don't fail the assignment if notification fails
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
      "client judge courtRef documents hearings reports"
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
    const filter = {};

    // Filter cases based on user role
    if (req.user.role === "Client") {
      filter.client = req.user.id;
    } else if (req.user.role === "Judge") {
      filter.judge = req.user.id;
    }
    // Admin can see all cases, so no filter needed

    const cases = await Case.find(filter)
      .populate("client", "username email")
      .populate("judge", "username email")
      .populate("courtRef", "name location");

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

    // Check if case is already closed
    if (courtCase.status === "Closed") {
      return res.status(400).json({
        error: "Cannot change status of closed case",
        details: `Case "${courtCase.title}" is closed and its status cannot be changed. Closed cases are final and cannot be reopened.`,
      });
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

    // Create notification for case status update
    try {
      let notificationMessage = "";
      let notificationType = "case_update";

      switch (status) {
        case "In Progress":
          notificationMessage = `Your case "${courtCase.title}" is now in progress. A judge has been assigned and will review your case.`;
          break;
        case "Closed":
          notificationMessage = `Your case "${courtCase.title}" has been closed. Please check the case details for the final decision.`;
          notificationType = "case_closed";
          break;
        default:
          notificationMessage = `Your case "${courtCase.title}" status has been updated to ${status}.`;
      }

      await Notification.create({
        user: courtCase.client._id,
        title: "Case Status Updated",
        message: notificationMessage,
        type: notificationType,
      });
    } catch (notificationError) {
      console.error(
        "Error creating status update notification:",
        notificationError
      );
      // Don't fail the status update if notification fails
    }

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
