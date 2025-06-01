import React, { useState, useEffect } from "react";
import { documentsAPI } from "../services/api";
import {
  FaFile,
  FaDownload,
  FaEye,
  FaTrash,
  FaSpinner,
  FaTimes,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
  FaFileAlt,
} from "react-icons/fa";

const DocumentViewer = ({ caseId, onDocumentDeleted, canDelete = false }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
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

  const handleView = async (document) => {
    try {
      const response = await documentsAPI.viewDocument(caseId, document.name);
      const blob = new Blob([response.data], { type: document.mimeType });
      const url = URL.createObjectURL(blob);

      if (
        document.mimeType === "application/pdf" ||
        document.mimeType.startsWith("image/")
      ) {
        setSelectedDocument({ ...document, url });
        setViewerOpen(true);
      } else {
        // For other file types, open in new tab
        window.open(url, "_blank");
      }
    } catch (err) {
      console.error("Error viewing document:", err);
      setError("Failed to view document");
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await documentsAPI.downloadDocument(
        caseId,
        document.name
      );
      const blob = new Blob([response.data], { type: document.mimeType });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = document.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading document:", err);
      setError("Failed to download document");
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

  const closeViewer = () => {
    setViewerOpen(false);
    if (selectedDocument?.url) {
      URL.revokeObjectURL(selectedDocument.url);
    }
    setSelectedDocument(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin text-2xl text-gray-400" />
        <span className="ml-2 text-gray-600">Loading documents...</span>
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
                onClick={() => handleView(document)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                title="View Document"
              >
                <FaEye />
              </button>
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
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTrash />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Document Viewer Modal */}
      {viewerOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium">
                {selectedDocument.originalName}
              </h3>
              <button
                onClick={closeViewer}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              {selectedDocument.mimeType === "application/pdf" ? (
                <iframe
                  src={selectedDocument.url}
                  className="w-full h-full"
                  title={selectedDocument.originalName}
                />
              ) : selectedDocument.mimeType.startsWith("image/") ? (
                <div className="flex items-center justify-center h-full p-4">
                  <img
                    src={selectedDocument.url}
                    alt={selectedDocument.originalName}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">
                    Preview not available for this file type
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;
