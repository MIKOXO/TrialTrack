import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import JudgeLayout from "../../components/JudgeLayout";
import { JudgePageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import { FormLoadingOverlay } from "../../components/LoadingOverlay";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import { courtsAPI, documentsAPI } from "../../services/api";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaFileAlt,
  FaUser,
  FaGavel,
  FaEdit,
  FaClock,
  FaMapMarkerAlt,
  FaPlus,
  FaFolder,
  FaDownload,
  FaEye,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
} from "react-icons/fa";

const JudgeCaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const [caseData, setCaseData] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [availableCourts, setAvailableCourts] = useState([]);

  // Hearing form state - updated to match calendar modal
  const [newHearing, setNewHearing] = useState({
    date: "",
    time: "",
    selectedCourt: "",
    notes: "",
    type: "Civil",
  });
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [scheduleHearingLoading, setScheduleHearingLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  useEffect(() => {
    fetchCaseDetails();
    fetchCourts();
  }, [id]);

  // Fetch available time slots for selected court and date
  const fetchAvailableTimeSlots = async (courtId, date) => {
    if (!courtId || !date) {
      setAvailableTimeSlots([]);
      return;
    }

    console.log("Fetching time slots for:", { courtId, date });

    try {
      setLoadingTimeSlots(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      const apiUrl = `http://localhost:3001/api/hearings/available-slots/${courtId}/${date}`;
      console.log("API URL:", apiUrl);

      const response = await axios.get(apiUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Time slots response:", response.data);
      setAvailableTimeSlots(response.data.availableSlots);
    } catch (err) {
      console.error("Error fetching available time slots:", err);
      console.error("Error details:", err.response?.data);
      setAvailableTimeSlots([]);
      // Don't show error for this as it's not critical
    } finally {
      setLoadingTimeSlots(false);
    }
  };

  // Fetch available time slots when court or date changes
  useEffect(() => {
    if (newHearing.selectedCourt && newHearing.date) {
      fetchAvailableTimeSlots(newHearing.selectedCourt, newHearing.date);
    }
  }, [newHearing.selectedCourt, newHearing.date]);

  const fetchCaseDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      // Fetch case details
      const caseResponse = await axios.get(
        `http://localhost:3001/api/case/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCaseData(caseResponse.data);
      setNewStatus(caseResponse.data.status);

      // Fetch hearings for this case
      const hearingsResponse = await axios.get(
        "http://localhost:3001/api/hearings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Filter hearings for this case
      const caseHearings = hearingsResponse.data.filter(
        (hearing) => hearing.case?._id === id
      );

      setHearings(caseHearings);

      // Fetch documents for this case
      await fetchDocuments();

      setLoading(false);
    } catch (err) {
      console.error("Error fetching case details:", err);
      showError("Failed to load case details. Please try again later.");
      setLoading(false);
    }
  };

  const fetchCourts = async () => {
    try {
      const response = await courtsAPI.getCourts();
      setAvailableCourts(response.data);
    } catch (err) {
      console.error("Error fetching courts:", err);
      showError("Failed to load courts. Please try again later.");
    }
  };

  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const response = await documentsAPI.getCaseDocuments(id);
      setDocuments(response.data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      // Don't show error for documents as it's not critical
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Helper function to get file icon based on mime type
  const getFileIcon = (mimeType) => {
    if (mimeType.includes("pdf")) {
      return <FaFilePdf className="text-red-500" />;
    } else if (mimeType.includes("image")) {
      return <FaFileImage className="text-green-500" />;
    } else if (mimeType.includes("word") || mimeType.includes("document")) {
      return <FaFileWord className="text-blue-500" />;
    } else {
      return <FaFileAlt className="text-gray-500" />;
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Handle document download
  const handleDocumentDownload = async (document) => {
    try {
      const response = await documentsAPI.downloadDocument(id, document.name);

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = window.document.createElement("a");
      link.href = url;
      link.setAttribute("download", document.originalName || document.name);
      window.document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      showSuccess(`Downloaded ${document.originalName || document.name}`);
    } catch (err) {
      console.error("Error downloading document:", err);

      // Show more specific error message
      if (err.response?.status === 404) {
        showError("Document not found. It may have been deleted or moved.");
      } else if (err.response?.status === 403) {
        showError(
          "Access denied. You don't have permission to download this document."
        );
      } else {
        showError(
          `Failed to download document: ${
            err.response?.data?.error || err.message
          }`
        );
      }
    }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      showError("Please select a status.");
      return;
    }

    // Check if case is already closed
    if (caseData.status === "Closed") {
      showError(
        "Cannot change status of closed case. Closed cases are final and cannot be reopened."
      );
      return;
    }

    try {
      setStatusUpdateLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      await axios.put(
        `http://localhost:3001/api/case/status/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setCaseData((prev) => ({ ...prev, status: newStatus }));
      setShowStatusModal(false);
      showSuccess("Case status updated successfully!");
    } catch (err) {
      console.error("Error updating case status:", err);

      // Handle specific error types
      if (
        err.response?.status === 400 &&
        err.response.data.error?.includes("closed case")
      ) {
        showError(
          err.response.data.details ||
            err.response.data.error ||
            "Cannot change status of closed case. Closed cases are final and cannot be reopened.",
          6000
        );
      } else {
        showError(
          err.response?.data?.error ||
            "Failed to update case status. Please try again."
        );
      }
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const handleScheduleHearing = async () => {
    if (!newHearing.date || !newHearing.time || !newHearing.selectedCourt) {
      showError("Please fill in all required fields.");
      return;
    }

    // Check if case is closed
    if (caseData.status === "Closed") {
      showError(
        "Cannot schedule hearing for closed case. Only open or in-progress cases can have hearings scheduled."
      );
      return;
    }

    try {
      setScheduleHearingLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      await axios.post(
        `http://localhost:3001/api/hearings/create/${id}`,
        {
          date: newHearing.date,
          time: newHearing.time,
          notes: newHearing.notes,
          courtId: newHearing.selectedCourt,
          type: newHearing.type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Refresh hearings
      fetchCaseDetails();
      setShowHearingModal(false);
      setNewHearing({
        date: "",
        time: "",
        selectedCourt: "",
        notes: "",
        type: "Civil",
      });
      setAvailableTimeSlots([]);
      showSuccess("Hearing scheduled successfully!");
    } catch (err) {
      console.error("Error scheduling hearing:", err);

      // Handle specific error types
      if (err.response?.status === 409) {
        showError(
          err.response.data.details ||
            err.response.data.error ||
            "Scheduling conflict detected. Please choose a different time or courtroom.",
          8000
        );
      } else if (
        err.response?.status === 400 &&
        err.response.data.error?.includes("closed case")
      ) {
        showError(
          err.response.data.details ||
            err.response.data.error ||
            "Cannot schedule hearing for closed case. Only open or in-progress cases can have hearings scheduled.",
          6000
        );
      } else {
        showError(
          err.response?.data?.error ||
            "Failed to schedule hearing. Please try again."
        );
      }
    } finally {
      setScheduleHearingLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "bg-blue-100 text-blue-800";
      case "in progress":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <JudgeLayout>
        <JudgePageLoader message="Loading case details..." />
      </JudgeLayout>
    );
  }

  if (!caseData) {
    return (
      <JudgeLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 md:px-4 py-3 rounded relative mx-4 md:mx-0">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Case not found.</span>
        </div>
      </JudgeLayout>
    );
  }

  return (
    <JudgeLayout>
      <div className="mb-4 md:mb-6 px-4 md:px-0">
        <Link
          to="/judge/cases"
          className="flex items-center text-green-600 hover:text-green-700 mb-4 text-sm md:text-base"
        >
          <FaArrowLeft className="mr-2" /> Back to Cases
        </Link>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 md:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 break-words">
              {caseData.title}
            </h1>
            <p className="text-gray-600 text-sm md:text-base break-all">
              Case ID: {caseData._id}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-3 flex-shrink-0">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium text-center ${getStatusClass(
                caseData.status
              )}`}
            >
              {caseData.status}
            </span>
            <button
              onClick={() => setShowStatusModal(true)}
              disabled={caseData.status === "Closed"}
              className={`px-3 md:px-4 py-2 rounded-md transition-colors flex items-center justify-center text-sm md:text-base ${
                caseData.status === "Closed"
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-tertiary text-white hover:bg-green-700 ease-in-out duration-300"
              }`}
              title={
                caseData.status === "Closed"
                  ? "Cannot change status of closed case"
                  : "Update the status of this case"
              }
            >
              <FaEdit className="mr-2" />
              <span className="hidden sm:inline">Update Status</span>
              <span className="sm:hidden">Update</span>
              {caseData.status === "Closed" && (
                <span className="ml-2 text-xs hidden md:inline">
                  (Case Closed)
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
        {/* Case Information */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Case Details Card */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-base md:text-lg font-medium mb-4 flex items-center">
              <FaFileAlt className="mr-2 text-green-600" />
              Case Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <p className="text-gray-900 text-sm md:text-base break-words">
                  {caseData.title}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <p className="text-gray-900 text-sm md:text-base">
                  {caseData.caseType
                    ? caseData.caseType === "smallClaims"
                      ? "SmallClaims"
                      : caseData.caseType.charAt(0).toUpperCase() +
                        caseData.caseType.slice(1)
                    : "Not specified"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(
                    caseData.status
                  )}`}
                >
                  {caseData.status}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filed Date
                </label>
                <p className="text-gray-900 text-sm md:text-base">
                  {formatDate(caseData.createdAt)}
                </p>
              </div>
            </div>
            {caseData.description && (
              <div className="mt-3 md:mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900 text-sm md:text-base break-words">
                  {caseData.description}
                </p>
              </div>
            )}
          </div>

          {/* Hearings */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
              <h2 className="text-base md:text-lg font-medium flex items-center">
                <FaGavel className="mr-2 text-green-600" />
                Hearings ({hearings.length})
              </h2>
              {caseData.status !== "Closed" && (
                <button
                  onClick={() => setShowHearingModal(true)}
                  className="w-full sm:w-auto bg-tertiary text-white px-3 md:px-4 py-2 rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center justify-center text-sm"
                >
                  <FaPlus className="mr-2" />
                  <span className="hidden sm:inline">Schedule Hearing</span>
                  <span className="sm:hidden">Schedule</span>
                </button>
              )}
            </div>

            {hearings.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <p className="text-gray-500 text-sm md:text-base">
                  No hearings scheduled for this case.
                </p>
                {caseData.status !== "Closed" && (
                  <button
                    onClick={() => setShowHearingModal(true)}
                    className="mt-2 text-green-600 hover:text-green-700 text-sm md:text-base"
                  >
                    Schedule the first hearing
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {hearings.map((hearing) => (
                  <div
                    key={hearing._id}
                    className="border border-gray-200 rounded-lg p-3 md:p-4"
                  >
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs md:text-sm text-gray-600 gap-2 sm:gap-0">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1 flex-shrink-0" />
                            <span className="break-words">
                              {formatDate(hearing.date)}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FaClock className="mr-1 flex-shrink-0" />
                            <span>{hearing.time}</span>
                          </div>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-1 flex-shrink-0" />
                            <span className="break-words">
                              {hearing.court?.name || "TBD"}
                            </span>
                          </div>
                        </div>
                        {hearing.notes && (
                          <p className="mt-2 text-xs md:text-sm text-gray-700 break-words">
                            {hearing.notes}
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/judge/hearings/${hearing._id}`}
                        className="text-green-600 hover:text-green-700 text-xs md:text-sm font-medium flex-shrink-0 self-start md:self-auto"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base md:text-lg font-medium flex items-center">
                <FaFolder className="mr-2 text-green-600" />
                Documents ({documents.length})
              </h2>
            </div>

            {documentsLoading ? (
              <div className="text-center py-6 md:py-8">
                <div className="animate-spin rounded-full h-6 md:h-8 w-6 md:w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-gray-500 mt-2 text-sm md:text-base">
                  Loading documents...
                </p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-6 md:py-8">
                <FaFolder className="mx-auto text-gray-400 text-3xl md:text-4xl mb-4" />
                <p className="text-gray-500 text-sm md:text-base">
                  No documents found for this case.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document) => (
                  <div
                    key={document._id}
                    className="border border-gray-200 rounded-lg p-3 md:p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0">
                      <div className="flex items-start md:items-center space-x-3 min-w-0 flex-1">
                        <div className="text-xl md:text-2xl flex-shrink-0">
                          {getFileIcon(document.mimeType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm md:text-base break-words">
                            {document.originalName || document.name}
                          </h4>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs md:text-sm text-gray-500 gap-1 sm:gap-0">
                            <span>{formatFileSize(document.size)}</span>
                            <span>
                              Uploaded:{" "}
                              {new Date(
                                document.uploadDate || document.createdAt
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <button
                          onClick={() => handleDocumentDownload(document)}
                          className="flex items-center px-2 md:px-3 py-1 text-xs md:text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          title="Download Document"
                        >
                          <FaDownload className="mr-1" />
                          <span className="hidden sm:inline">Download</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-base md:text-lg font-medium mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowStatusModal(true)}
                disabled={caseData.status === "Closed"}
                className={`w-full px-3 md:px-4 py-2 rounded-md flex items-center justify-center text-sm md:text-base ${
                  caseData.status === "Closed"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-tertiary text-white hover:bg-green-700 ease-in-out duration-300"
                }`}
                title={
                  caseData.status === "Closed"
                    ? "Cannot change status of closed case"
                    : "Update the status of this case"
                }
              >
                <FaEdit className="mr-2" /> Update Status
                {caseData.status === "Closed" && (
                  <span className="ml-2 text-xs">(Closed)</span>
                )}
              </button>
              {caseData.status !== "Closed" && (
                <button
                  onClick={() => setShowHearingModal(true)}
                  className="w-full bg-blue-600 text-white px-3 md:px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center ease-in-out duration-300 text-sm md:text-base"
                >
                  <FaCalendarAlt className="mr-2" /> Schedule Hearing
                </button>
              )}
              <Link
                to="/judge/calendar"
                className="w-full bg-gray-600 text-white px-3 md:px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center ease-in-out duration-300 text-sm md:text-base"
              >
                <FaCalendarAlt className="mr-2" /> View Calendar
              </Link>
            </div>
          </div>

          {/* Case Statistics */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-base md:text-lg font-medium mb-4">
              Case Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-600">Total Hearings:</span>
                <span className="font-medium">{hearings.length}</span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-600">Upcoming Hearings:</span>
                <span className="font-medium">
                  {hearings.filter((h) => new Date(h.date) > new Date()).length}
                </span>
              </div>
              <div className="flex justify-between text-sm md:text-base">
                <span className="text-gray-600">Case Age:</span>
                <span className="font-medium">
                  {Math.floor(
                    (new Date() - new Date(caseData.createdAt)) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  days
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Update Case Status
            </h2>
            <p className="mb-4 text-gray-600 text-sm md:text-base break-words">
              Change the status for case:{" "}
              <span className="font-medium">{caseData.title}</span>
            </p>

            <div className="mb-4 md:mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
              >
                <option value="">-- Select Status --</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300 text-sm md:text-base order-2 md:order-1"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleStatusUpdate}
                loading={statusUpdateLoading}
                loadingText="Updating..."
                disabled={!newStatus}
                className="w-full md:w-auto px-4 py-2 bg-tertiary text-white rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center justify-center text-sm md:text-base order-1 md:order-2"
              >
                <FaEdit className="mr-2" />
                Update Status
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Hearing Modal - Enhanced with time slot functionality */}
      {showHearingModal && (
        <FormLoadingOverlay
          isVisible={scheduleHearingLoading}
          message="Scheduling hearing..."
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto shadow-xl mx-auto my-auto">
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                Schedule Hearing
              </h2>
              <p className="mb-4 text-gray-600 text-sm md:text-base break-words">
                Schedule a hearing for case:{" "}
                <span className="font-medium">{caseData.title}</span>
              </p>

              <div className="mb-3 md:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={newHearing.date}
                  onChange={(e) =>
                    setNewHearing({ ...newHearing, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-terring-tertiary text-sm md:text-base"
                />
              </div>

              <div className="mb-3 md:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time *
                  {newHearing.selectedCourt && newHearing.date && (
                    <span className="text-xs text-gray-500 ml-2">
                      ({availableTimeSlots.length} slots available)
                    </span>
                  )}
                </label>
                {newHearing.selectedCourt &&
                newHearing.date &&
                availableTimeSlots.length > 0 ? (
                  <select
                    value={newHearing.time}
                    onChange={(e) =>
                      setNewHearing({ ...newHearing, time: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary text-sm md:text-base"
                    disabled={loadingTimeSlots}
                  >
                    <option value="">-- Select available time --</option>
                    {availableTimeSlots.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                ) : newHearing.selectedCourt &&
                  newHearing.date &&
                  availableTimeSlots.length === 0 &&
                  !loadingTimeSlots ? (
                  <div className="w-full border border-red-300 rounded-md px-3 py-2 bg-red-50 text-red-700 text-sm">
                    No available time slots for this date. Please choose a
                    different date or courtroom.
                  </div>
                ) : (
                  <input
                    type="time"
                    value={newHearing.time}
                    onChange={(e) =>
                      setNewHearing({ ...newHearing, time: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary text-sm md:text-base"
                    placeholder={
                      newHearing.selectedCourt && newHearing.date
                        ? "Loading available times..."
                        : "Select court and date first"
                    }
                    disabled={loadingTimeSlots}
                  />
                )}
                {loadingTimeSlots && (
                  <div className="text-xs text-gray-500 mt-1">
                    Loading available time slots...
                  </div>
                )}
              </div>

              <div className="mb-3 md:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Courtroom *
                </label>
                <select
                  value={newHearing.selectedCourt}
                  onChange={(e) =>
                    setNewHearing({
                      ...newHearing,
                      selectedCourt: e.target.value,
                      time: "",
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary text-sm md:text-base"
                >
                  <option value="">-- Select Courtroom --</option>
                  {availableCourts.map((court) => (
                    <option key={court._id} value={court._id}>
                      {court.name} - {court.location}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3 md:mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hearing Type
                </label>
                <select
                  value={newHearing.type}
                  onChange={(e) =>
                    setNewHearing({ ...newHearing, type: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary text-sm md:text-base"
                >
                  <option value="Civil">Civil</option>
                  <option value="Criminal">Criminal</option>
                  <option value="Family">Family</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Administrative">Administrative</option>
                </select>
              </div>

              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={newHearing.notes}
                  onChange={(e) =>
                    setNewHearing({ ...newHearing, notes: e.target.value })
                  }
                  rows="3"
                  placeholder="Add any notes about this hearing..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary text-sm md:text-base resize-y"
                />
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3">
                <button
                  onClick={() => setShowHearingModal(false)}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300 text-sm md:text-base order-2 md:order-1"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleScheduleHearing}
                  loading={scheduleHearingLoading}
                  loadingText="Scheduling..."
                  disabled={
                    !newHearing.date ||
                    !newHearing.time ||
                    !newHearing.selectedCourt
                  }
                  className="w-full md:w-auto px-4 py-2 bg-tertiary text-white rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center justify-center text-sm md:text-base order-1 md:order-2"
                >
                  <FaCalendarAlt className="mr-2" />
                  Schedule
                </LoadingButton>
              </div>
            </div>
          </div>
        </FormLoadingOverlay>
      )}

      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
        position="top-right"
      />
    </JudgeLayout>
  );
};

export default JudgeCaseDetailPage;
