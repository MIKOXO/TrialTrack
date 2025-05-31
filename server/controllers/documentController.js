import asyncHandler from "express-async-handler";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Document from "../models/documentModel.js";
import Case from "../models/caseModel.js";
import Notification from "../models/notificationModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const caseId = req.params.caseId || req.body.caseId;
    const caseDir = path.join(uploadsDir, caseId);

    // Create case-specific directory
    if (!fs.existsSync(caseDir)) {
      fs.mkdirSync(caseDir, { recursive: true });
    }

    cb(null, caseDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  },
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "text/plain",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only PDF, DOC, DOCX, JPG, PNG, GIF, TXT, XLS, XLSX files are allowed."
      ),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// @desc    Upload documents for a case
// @route   POST /api/documents/upload/:caseId
// @access  Private
const uploadDocuments = asyncHandler(async (req, res) => {
  try {
    const { caseId } = req.params;
    const { type, description } = req.body;

    // Verify case exists and user has access
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Check if user has permission to upload to this case
    const isOwner = caseDoc.client.toString() === req.user.id;
    const isJudge =
      req.user.role === "Judge" &&
      caseDoc.judge &&
      caseDoc.judge.toString() === req.user.id;
    const isAdmin = req.user.role === "Admin";

    if (!isOwner && !isJudge && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedDocuments = [];

    for (const file of req.files) {
      // Create document record
      const document = await Document.create({
        name: file.filename,
        originalName: file.originalname,
        case: caseId,
        uploadedBy: req.user.id,
        type: type || "Other",
        mimeType: file.mimetype,
        size: file.size,
        fileUrl: `/api/documents/view/${caseId}/${file.filename}`,
        filePath: file.path,
        description: description || "",
      });

      // Add document to case
      caseDoc.documents.push(document._id);

      uploadedDocuments.push(document);
    }

    await caseDoc.save();

    // Create notification for case owner (if uploaded by someone else)
    if (req.user.id !== caseDoc.client.toString()) {
      try {
        await Notification.create({
          user: caseDoc.client,
          title: "New Document Uploaded",
          message: `${req.user.username} uploaded ${uploadedDocuments.length} document(s) to your case "${caseDoc.title}".`,
          type: "document_uploaded",
        });
      } catch (notificationError) {
        console.error(
          "Error creating document upload notification:",
          notificationError
        );
      }
    }

    res.status(201).json({
      message: "Documents uploaded successfully",
      documents: uploadedDocuments,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ error: "Failed to upload documents" });
  }
});

// @desc    Get documents for a case
// @route   GET /api/documents/case/:caseId
// @access  Private
const getCaseDocuments = asyncHandler(async (req, res) => {
  try {
    const { caseId } = req.params;

    // Verify case exists and user has access
    const caseDoc = await Case.findById(caseId);
    if (!caseDoc) {
      return res.status(404).json({ error: "Case not found" });
    }

    // Check permissions
    const isOwner = caseDoc.client.toString() === req.user.id;
    const isJudge =
      req.user.role === "Judge" &&
      caseDoc.judge &&
      caseDoc.judge.toString() === req.user.id;
    const isAdmin = req.user.role === "Admin";

    if (!isOwner && !isJudge && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    const documents = await Document.find({ case: caseId })
      .populate("uploadedBy", "username email")
      .sort({ uploadDate: -1 });

    res.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

// @desc    View/Download a document
// @route   GET /api/documents/view/:caseId/:filename
// @access  Private
const viewDocument = asyncHandler(async (req, res) => {
  try {
    const { caseId, filename } = req.params;
    const { download } = req.query;

    // Find document
    const document = await Document.findOne({
      case: caseId,
      name: filename,
    }).populate("case");

    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Check permissions
    const caseDoc = document.case;
    const isOwner = caseDoc.client.toString() === req.user.id;
    const isJudge =
      req.user.role === "Judge" &&
      caseDoc.judge &&
      caseDoc.judge.toString() === req.user.id;
    const isAdmin = req.user.role === "Admin";

    if (!isOwner && !isJudge && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: "File not found on server" });
    }

    // Update access tracking
    document.lastAccessed = new Date();
    if (download === "true") {
      document.downloadCount += 1;
    }
    await document.save();

    // Set appropriate headers
    const stat = fs.statSync(document.filePath);

    res.setHeader("Content-Type", document.mimeType);
    res.setHeader("Content-Length", stat.size);

    if (download === "true") {
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${document.originalName}"`
      );
    } else {
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${document.originalName}"`
      );
    }

    // Stream the file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Error viewing document:", error);
    res.status(500).json({ error: "Failed to access document" });
  }
});

// @desc    Delete a document
// @route   DELETE /api/documents/:documentId
// @access  Private
const deleteDocument = asyncHandler(async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId).populate("case");
    if (!document) {
      return res.status(404).json({ error: "Document not found" });
    }

    // Check permissions (only uploader, case owner, or admin can delete)
    const isUploader = document.uploadedBy.toString() === req.user.id;
    const isOwner = document.case.client.toString() === req.user.id;
    const isAdmin = req.user.role === "Admin";

    if (!isUploader && !isOwner && !isAdmin) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Delete file from filesystem
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    // Remove document from case
    await Case.findByIdAndUpdate(document.case._id, {
      $pull: { documents: documentId },
    });

    // Delete document record
    await Document.findByIdAndDelete(documentId);

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Failed to delete document" });
  }
});

export {
  upload,
  uploadDocuments,
  getCaseDocuments,
  viewDocument,
  deleteDocument,
};
