import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { casesAPI, documentsAPI } from "../../services/api";
import ClientLayout from "../../components/ClientLayout";
import DocumentViewer from "../../components/DocumentViewer";
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

  //   if (loading) {
  //     return (
  //       <ClientLayout>
  //         <div className="flex items-center justify-center py-12">
  //           <FaSpinner className="animate-spin text-3xl text-gray-400" />
  //           <span className="ml-3 text-gray-600">Loading case details...</span>
  //         </div>
  //       </ClientLayout>
  //     );
  //   }

  if (error) {
    return (
      <ClientLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
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
      <div className="px-7 py-4">
        <button
          onClick={() => navigate("/client/mycases")}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
        >
          <FaArrowLeft className="mr-2" />
          Back to My Cases
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {caseData.title}
            </h1>
            <p className="text-gray-600 mt-1">Case ID: {caseData._id}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                caseData.priority
              )}`}
            >
              {caseData.priority} Priority
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                caseData.status
              )}`}
            >
              {caseData.status}
            </span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mx-7 mb-6 w-[390px] bg-tertiary bg-opacity-15 rounded-md shadow-md">
        <nav className="-mb-px flex space-x-8 p-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 py-5 px-4 text-center ${
              activeTab === "overview"
                ? "bg-white rounded-lg text-green-600 font-medium"
                : " border-transparent text-gray-500"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("documents")}
            className={`flex-1 py-5 px-4 text-center ${
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
        <div className="px-7 py-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Case Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Case Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Case Type
                </label>
                <p className="text-gray-900 capitalize">{caseData.caseType}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Court
                </label>
                <p className="text-gray-900 capitalize">{caseData.court}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Report Date
                </label>
                <p className="text-gray-900">
                  {formatDate(caseData.reportDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Filed Date
                </label>
                <p className="text-gray-900">
                  {formatDate(caseData.createdAt)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Description
                </label>
                <p className="text-gray-900">{caseData.description}</p>
              </div>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Parties Involved
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Plaintiff
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-900">
                    {caseData.plaintiff?.name || "Not specified"}
                  </p>
                  {caseData.plaintiff?.email && (
                    <p className="text-sm text-gray-600">
                      {caseData.plaintiff.email}
                    </p>
                  )}
                  {caseData.plaintiff?.phone && (
                    <p className="text-sm text-gray-600">
                      {caseData.plaintiff.phone}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Defendant
                </h3>
                <div className="space-y-1">
                  <p className="text-gray-900">{caseData.defendant?.name}</p>
                  {caseData.defendant?.email && (
                    <p className="text-sm text-gray-600">
                      {caseData.defendant.email}
                    </p>
                  )}
                  {caseData.defendant?.phone && (
                    <p className="text-sm text-gray-600">
                      {caseData.defendant.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Legal Details */}
          {caseData.reliefSought && (
            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Legal Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Relief Sought
                  </h3>
                  <p className="text-gray-900">
                    {caseData.reliefSought.detailedRequest}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Legal Representation
                  </h3>
                  <p className="text-gray-900">
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
        <div className="space-y-6 px-7 py-4">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Upload Additional Documents
              </h2>
              <label className="cursor-pointer bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center">
                {uploadLoading ? (
                  <FaSpinner className="animate-spin mr-2" />
                ) : (
                  <FaUpload className="mr-2" />
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
            <p className="text-sm text-gray-600">
              Upload additional evidence, documents, or files related to your
              case. Supported formats: PDF, DOC, DOCX, JPG, PNG, GIF, TXT (Max
              10MB each)
            </p>
          </div>

          {/* Document Viewer */}
          <div className="bg-white rounded-lg shadow-md p-6">
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
