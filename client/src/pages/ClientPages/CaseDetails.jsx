import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { casesAPI, documentsAPI } from "../../services/api";
import ClientLayout from "../../components/ClientLayout";
import DocumentViewer from "../../components/DocumentViewer";
import { ClientPageLoader } from "../../components/PageLoader";
import Spinner from "../../components/Spinner";
import {
  FaArrowLeft,
  FaCalendar,
  FaUser,
  FaGavel,
  FaExclamationTriangle,
  FaSpinner,
  FaUpload,
  FaFile,
} from "react-icons/fa";

const CaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchCaseDetails();
  }, [id]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const response = await casesAPI.getCaseById(id);
      setCaseData(response.data);
    } catch (err) {
      console.error("Error fetching case details:", err);
      setError("Failed to load case details");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("documents", file);
    });
    formData.append("type", "Evidence");
    formData.append("description", "Additional case document");

    try {
      setUploadLoading(true);
      await documentsAPI.uploadDocuments(id, formData);
      // Refresh the document viewer
      window.location.reload();
    } catch (err) {
      console.error("Error uploading documents:", err);
      setError("Failed to upload documents");
    } finally {
      setUploadLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Urgent":
        return "text-red-600 bg-red-100";
      case "High":
        return "text-orange-600 bg-orange-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "Low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Open":
        return "text-blue-600 bg-blue-100";
      case "In Progress":
        return "text-yellow-600 bg-yellow-100";
      case "Closed":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <ClientLayout>
        <ClientPageLoader message="Loading case details..." />
      </ClientLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <ClientLayout>
        <div className="px-4 md:px-7 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3 min-w-0">
                <h3 className="text-sm font-medium">Error Loading Case</h3>
                <p className="text-sm mt-1 break-words">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  if (!caseData) {
    return (
      <ClientLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Case not found</p>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="px-4 md:px-7 py-4">
        <button
          onClick={() => navigate("/client/mycases")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4 text-sm md:text-base"
        >
          <FaArrowLeft className="mr-2 flex-shrink-0" />
          Back to My Cases
        </button>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 break-words">
              {caseData.title}
            </h1>
            <p className="text-gray-600 mt-1 text-sm md:text-base break-words">
              Case ID: {caseData._id}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getPriorityColor(
                caseData.priority
              )}`}
            >
              {caseData.priority} Priority
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs md:text-sm font-medium ${getStatusColor(
                caseData.status
              )}`}
            >
              {caseData.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mx-4 md:mx-7 mb-4 md:mb-6 max-w-full md:w-[390px] bg-tertiary bg-opacity-15 rounded-md shadow-md">
        <nav className="-mb-px flex p-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-3 md:py-5 px-3 md:px-4 text-center text-sm md:text-base ${
              activeTab === "overview"
                ? "bg-white rounded-lg text-green-600 font-medium"
                : " border-transparent text-gray-500"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 py-3 md:py-5 px-3 md:px-4 text-center text-sm md:text-base ${
              activeTab === "documents"
                ? "bg-white rounded-lg text-green-600 font-medium"
                : " border-transparent text-gray-500"
            }`}
          >
            Documents
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="px-4 md:px-7 py-4 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Case Information */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Case Information
            </h2>
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-500">
                  Case Type
                </label>
                <p className="text-gray-900 capitalize text-sm md:text-base break-words">
                  {caseData.caseType}
                </p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-500">
                  Court
                </label>
                <p className="text-gray-900 capitalize text-sm md:text-base break-words">
                  {caseData.court}
                </p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-500">
                  Report Date
                </label>
                <p className="text-gray-900 text-sm md:text-base">
                  {formatDate(caseData.reportDate)}
                </p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-500">
                  Filed Date
                </label>
                <p className="text-gray-900 text-sm md:text-base">
                  {formatDate(caseData.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-xs md:text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="text-gray-900 text-sm md:text-base break-words">
                  {caseData.description}
                </p>
              </div>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
              Parties Involved
            </h2>
            <div className="space-y-4 md:space-y-6">
              <div>
                <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-2">
                  Plaintiff
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-900 text-sm md:text-base break-words">
                    {caseData.plaintiff?.name || "Not specified"}
                  </p>
                  {caseData.plaintiff?.email && (
                    <p className="text-xs md:text-sm text-gray-600 break-words">
                      {caseData.plaintiff.email}
                    </p>
                  )}
                  {caseData.plaintiff?.phone && (
                    <p className="text-xs md:text-sm text-gray-600">
                      {caseData.plaintiff.phone}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-2">
                  Defendant
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-900 text-sm md:text-base break-words">
                    {caseData.defendant?.name}
                  </p>
                  {caseData.defendant?.email && (
                    <p className="text-xs md:text-sm text-gray-600 break-words">
                      {caseData.defendant.email}
                    </p>
                  )}
                  {caseData.defendant?.phone && (
                    <p className="text-xs md:text-sm text-gray-600">
                      {caseData.defendant.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Details */}
          {caseData.reliefSought && (
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 lg:col-span-2">
              <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4">
                Legal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-2">
                    Relief Sought
                  </h3>
                  <p className="text-gray-900 text-sm md:text-base break-words">
                    {caseData.reliefSought.detailedRequest}
                  </p>
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-medium text-gray-500 mb-2">
                    Legal Representation
                  </h3>
                  <p className="text-gray-900 text-sm md:text-base break-words">
                    {caseData.representation?.hasLawyer
                      ? `Represented by ${caseData.representation.lawyerName}`
                      : "Self-represented"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "documents" && (
        <div className="space-y-4 md:space-y-6 px-4 md:px-7 py-4">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4">
              <h2 className="text-base md:text-lg font-semibold text-gray-900">
                Upload Additional Documents
              </h2>
              <label
                className={`cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm md:text-base ${
                  uploadLoading ? "opacity-75 cursor-not-allowed" : ""
                }`}
              >
                {uploadLoading ? (
                  <Spinner size="sm" color="white" className="mr-2" />
                ) : (
                  <FaUpload className="mr-2 flex-shrink-0" />
                )}
                {uploadLoading ? "Uploading..." : "Upload Files"}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.txt"
                  disabled={uploadLoading}
                />
              </label>
            </div>
            <p className="text-xs md:text-sm text-gray-600">
              Upload additional evidence, documents, or files related to your
              case. Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT (Max
              10MB each)
            </p>
          </div>

          {/* Document Viewer */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <DocumentViewer
              caseId={id}
              canDelete={true}
              onDocumentDeleted={() => {
                // Optionally refresh or update state
              }}
            />
          </div>
        </div>
      )}
    </ClientLayout>
  );
};

export default CaseDetails;
