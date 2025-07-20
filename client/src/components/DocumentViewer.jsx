import React, { useState, useEffect } from "react";
import { documentsAPI } from "../services/api";
import { InlineLoader } from "./PageLoader";
import Spinner from "./Spinner";
import {
  FaFile,
  FaDownload,
  FaTrash,
  FaSpinner,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileAlt,
} from "react-icons/fa";

const DocumentViewer = ({ caseId, onDocumentDeleted, canDelete = false }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteLoading, setDeleteLoading] = useState(null);

  useEffect(() => {
    if (caseId) {
      fetchDocuments();
    }
  }, [caseId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentsAPI.getCaseDocuments(caseId);
      setDocuments(response.data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType === "application/pdf") {
      return <FaFilePdf className="text-red-500" />;
    } else if (mimeType.includes("word")) {
      return <FaFileWord className="text-blue-500" />;
    } else if (mimeType.startsWith("image/")) {
      return <FaFileImage className="text-green-500" />;
    } else {
      return <FaFileAlt className="text-gray-500" />;
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDownload = async (document) => {
    try {
      console.log("Attempting to download document:", {
        caseId,
        documentName: document.name,
        originalName: document.originalName,
      });

      const response = await documentsAPI.downloadDocument(
        caseId,
        document.name
      );
      console.log("Download document response:", response);

      const blob = new Blob([response.data], { type: document.mimeType });
      const url = URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading document:", err);
      console.error("Download error details:", err.response?.data);
      setError(
        `Failed to download document: ${
          err.response?.data?.error || err.message
        }`
      );
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setDeleteLoading(documentId);
      await documentsAPI.deleteDocument(documentId);
      setDocuments(documents.filter((doc) => doc._id !== documentId));
      if (onDocumentDeleted) {
        onDocumentDeleted(documentId);
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      setError("Failed to delete document");
    } finally {
      setDeleteLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="py-8">
        <InlineLoader message="Loading documents..." color="tertiary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FaFile className="text-4xl mx-auto mb-2 text-gray-300" />
        <p>No documents uploaded for this case</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900">
        Case Documents ({documents.length})
      </h3>

      <div className="grid gap-4">
        {documents.map((document) => (
          <div
            key={document._id}
            className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
          >
            <div className="flex items-center flex-1">
              <div className="mr-4 text-2xl">
                {getFileIcon(document.mimeType)}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {document.originalName}
                </h4>
                <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                  <span>{formatFileSize(document.size)}</span>
                  <span className="capitalize">{document.type}</span>
                  <span>Uploaded {formatDate(document.uploadDate)}</span>
                  <span>by {document.uploadedBy?.username || "Unknown"}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDownload(document)}
                className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded"
                title="Download Document"
              >
                <FaDownload />
              </button>
              {canDelete && (
                <button
                  onClick={() => handleDelete(document._id)}
                  disabled={deleteLoading === document._id}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded disabled:opacity-50"
                  title="Delete Document"
                >
                  {deleteLoading === document._id ? (
                    <Spinner size="xs" color="tertiary" />
                  ) : (
                    <FaTrash />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentViewer;
