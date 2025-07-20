import asyncHandler from "express-async-handler";
import Case from "../models/caseModel.js";
import Notification from "../models/notificationModel.js";

// Helper function to calculate similarity between two strings
const calculateSimilarity = (str1, str2) => {
  if (!str1 || !str2) return 0;

  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1;

  // Simple word-based similarity
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  const commonWords = words1.filter((word) =>
    words2.some((w) => w.includes(word) || word.includes(w))
  );

  const similarity = (commonWords.length * 2) / (words1.length + words2.length);
  return similarity;
};

// Function to check for duplicate cases
const checkForDuplicates = async (userId, caseData) => {
  try {
    // Get all cases for this user that are not closed
    const userCases = await Case.find({
      client: userId,
      status: { $ne: "Closed" },
    });

    const duplicates = [];
    const threshold = 0.7; // 70% similarity threshold

    for (const existingCase of userCases) {
      let similarityScore = 0;
      let matchingFactors = [];

      // Check title similarity (weighted heavily)
      const titleSimilarity = calculateSimilarity(
        caseData.title,
        existingCase.title
      );
      if (titleSimilarity > 0.6) {
        similarityScore += titleSimilarity * 0.4;
        matchingFactors.push(
          `Similar title (${Math.round(titleSimilarity * 100)}% match)`
        );
      }

      // Check description similarity
      const descSimilarity = calculateSimilarity(
        caseData.description,
        existingCase.description
      );
      if (descSimilarity > 0.5) {
        similarityScore += descSimilarity * 0.3;
        matchingFactors.push(
          `Similar description (${Math.round(descSimilarity * 100)}% match)`
        );
      }

      // Check defendant name similarity
      if (caseData.defendant?.name && existingCase.defendant?.name) {
        const defendantSimilarity = calculateSimilarity(
          caseData.defendant.name,
          existingCase.defendant.name
        );
        if (defendantSimilarity > 0.8) {
          similarityScore += defendantSimilarity * 0.2;
          matchingFactors.push(
            `Same defendant (${Math.round(defendantSimilarity * 100)}% match)`
          );
        }
      }

      // Check case type match
      if (caseData.caseType === existingCase.caseType) {
        similarityScore += 0.1;
        matchingFactors.push("Same case type");
      }

      // Check court match (only if both cases have court assigned)
      if (
        caseData.court &&
        existingCase.court &&
        caseData.court === existingCase.court
      ) {
        similarityScore += 0.05;
        matchingFactors.push("Same court");
      }

      // If similarity is above threshold, consider it a potential duplicate
      if (similarityScore >= threshold && matchingFactors.length > 0) {
        duplicates.push({
          caseId: existingCase._id,
          title: existingCase.title,
          status: existingCase.status,
          createdAt: existingCase.createdAt,
          similarityScore: Math.round(similarityScore * 100),
          matchingFactors: matchingFactors,
        });
      }
    }

    return duplicates;
  } catch (error) {
    console.error("Error checking for duplicates:", error);
    return [];
  }
};

// @desc    Check for duplicate cases
// @route   POST api/case/check-duplicates
// @access  Private
const checkDuplicates = asyncHandler(async (req, res) => {
  if (req.user.role !== "Client") {
    return res
      .status(403)
      .json({ error: "Only clients can check for duplicates" });
  }

  const { title, description, defendant, caseType, court } = req.body;

  // Validate required fields for duplicate checking
  if (!title || !title.trim()) {
    return res
      .status(400)
      .json({ error: "Case title is required for duplicate checking" });
  }

  if (!description || !description.trim()) {
    return res
      .status(400)
      .json({ error: "Case description is required for duplicate checking" });
  }

  try {
    const duplicates = await checkForDuplicates(req.user.id, {
      title: title.trim(),
      description: description.trim(),
      defendant,
      caseType,
      court,
    });

    res.json({
      hasDuplicates: duplicates.length > 0,
      duplicates: duplicates,
      message:
        duplicates.length > 0
          ? `Found ${duplicates.length} potentially similar case${
              duplicates.length > 1 ? "s" : ""
            }`
          : "No similar cases found",
    });
  } catch (error) {
    console.error("Error checking duplicates:", error);
    res.status(500).json({ error: "Failed to check for duplicates" });
  }
});

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
    court, // Optional field - can be assigned later by admin
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
    return res.status(400).json({ error: "Defendant name is required" });
  }

  if (!defendant.phone || !defendant.phone.trim()) {
    return res
      .status(400)
      .json({ error: "Defendant phone number is required" });
  }

  // Validate phone number format
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  const cleanPhone = defendant.phone.replace(/[\s\-\(\)]/g, "");
  if (!phoneRegex.test(cleanPhone)) {
    return res
      .status(400)
      .json({ error: "Please provide a valid defendant phone number" });
  }

  // Validate email format if provided (optional)
  if (defendant.email && defendant.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(defendant.email.trim())) {
      return res
        .status(400)
        .json({ error: "Please provide a valid defendant email address" });
    }
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
    // Check for potential duplicates before filing
    const duplicates = await checkForDuplicates(req.user.id, {
      title: title.trim(),
      description: description.trim(),
      defendant,
      caseType,
      court,
    });

    // If duplicates found, return warning (but still allow filing with confirmation)
    if (duplicates.length > 0 && !req.body.confirmDuplicate) {
      return res.status(409).json({
        error: "Potential duplicate case detected",
        duplicates: duplicates,
        message: `We found ${duplicates.length} similar case${
          duplicates.length > 1 ? "s" : ""
        } that you have already filed. Please review them before proceeding.`,
        requiresConfirmation: true,
      });
    }

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
      court: court || null, // Court can be assigned later by admin
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
      {
        judge: judgeId,
        status: "In Progress", // Automatically set status to "In Progress" when judge is assigned
      },
      { new: true }
    ).populate("client judge courtRef");

    if (!updatedCase) {
      return res.status(404).json({ error: "Case not found" });
    }

    console.log(
      `Case ${caseId} assigned to judge ${judgeId} and status updated to "In Progress"`
    );

    // Create notification for case assignment
    try {
      await Notification.create({
        user: updatedCase.client._id,
        title: "Judge Assigned - Case In Progress",
        message: `Judge ${updatedCase.judge.username} has been assigned to your case "${updatedCase.title}". Your case status has been updated to "In Progress" and will now be reviewed.`,
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
      .populate("client", "username email firstName lastName")
      .populate("judge", "username email firstName lastName")
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
  checkDuplicates,
};
