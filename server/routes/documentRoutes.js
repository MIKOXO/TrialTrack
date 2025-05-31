import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  upload,
  uploadDocuments,
  getCaseDocuments,
  viewDocument,
  deleteDocument,
} from "../controllers/documentController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Upload documents to a case
router.post("/upload/:caseId", upload.array("documents", 10), uploadDocuments);

// Get all documents for a case
router.get("/case/:caseId", getCaseDocuments);

// View or download a document
router.get("/view/:caseId/:filename", viewDocument);

// Delete a document
router.delete("/:documentId", deleteDocument);

export default router;
