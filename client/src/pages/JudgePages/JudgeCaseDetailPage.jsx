import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import JudgeLayout from "../../components/JudgeLayout";
import { JudgePageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import { courtsAPI } from "../../services/api";
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
} from "react-icons/fa";

const JudgeCaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const [caseData, setCaseData] = useState(null);
  const [hearings, setHearings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [availableCourts, setAvailableCourts] = useState([]);

  // Hearing form state
  const [hearingDate, setHearingDate] = useState("");
  const [hearingTime, setHearingTime] = useState("");
  const [selectedCourt, setSelectedCourt] = useState("");
  const [hearingNotes, setHearingNotes] = useState("");
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [scheduleHearingLoading, setScheduleHearingLoading] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  useEffect(() => {
    fetchCaseDetails();
    fetchCourts();
  }, [id]);

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

  // Fetch available time slots for selected court and date
  const fetchAvailableTimeSlots = async (courtId, date) => {
    if (!courtId || !date) {
      setAvailableTimeSlots([]);
      return;
    }

    try {
      setLoadingTimeSlots(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      const response = await axios.get(
        `http://localhost:3001/api/hearings/available-slots/${courtId}/${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAvailableTimeSlots(response.data.availableSlots);
    } catch (err) {
      console.error("Error fetching available time slots:", err);
      setAvailableTimeSlots([]);
      // Don't show error for this as it's not critical
    } finally {
      setLoadingTimeSlots(false);
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
    if (!hearingDate || !hearingTime || !selectedCourt) {
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
          date: hearingDate,
          time: hearingTime,
          notes: hearingNotes,
          courtId: selectedCourt,
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
      setHearingDate("");
      setHearingTime("");
      setSelectedCourt("");
      setHearingNotes("");
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> Case not found.</span>
        </div>
      </JudgeLayout>
    );
  }

  return (
    <JudgeLayout>
      <div className="mb-6">
        <Link
          to="/judge/cases"
          className="flex items-center text-green-600 hover:text-green-700 mb-4"
        >
          <FaArrowLeft className="mr-2" /> Back to Cases
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {caseData.title}
            </h1>
            <p className="text-gray-600">Case ID: {caseData._id}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                caseData.status
              )}`}
            >
              {caseData.status}
            </span>
            <button
              onClick={() => setShowStatusModal(true)}
              disabled={caseData.status === "Closed"}
              className={`px-4 py-2 rounded-md transition-colors flex items-center ${
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
                <span className="ml-2 text-xs">(Case Closed)</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Case Details Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center">
              <FaFileAlt className="mr-2 text-green-600" />
              Case Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <p className="text-gray-900">{caseData.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <p className="text-gray-900">
                  {caseData.type || "Not specified"}
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
                <p className="text-gray-900">
                  {formatDate(caseData.createdAt)}
                </p>
              </div>
            </div>
            {caseData.description && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <p className="text-gray-900">{caseData.description}</p>
              </div>
            )}
          </div>

          {/* Hearings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium flex items-center">
                <FaGavel className="mr-2 text-green-600" />
                Hearings ({hearings.length})
              </h2>
              {caseData.status !== "Closed" && (
                <button
                  onClick={() => setShowHearingModal(true)}
                  className="bg-tertiary text-white px-4 py-2 rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center text-sm"
                >
                  <FaPlus className="mr-2" /> Schedule Hearing
                </button>
              )}
            </div>

            {hearings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">
                  No hearings scheduled for this case.
                </p>
                {caseData.status !== "Closed" && (
                  <button
                    onClick={() => setShowHearingModal(true)}
                    className="mt-2 text-green-600 hover:text-green-700"
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
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <FaCalendarAlt className="mr-1" />
                            {formatDate(hearing.date)}
                          </div>
                          <div className="flex items-center">
                            <FaClock className="mr-1" />
                            {hearing.time}
                          </div>
                          <div className="flex items-center">
                            <FaMapMarkerAlt className="mr-1" />
                            {hearing.court?.name || "TBD"}
                          </div>
                        </div>
                        {hearing.notes && (
                          <p className="mt-2 text-sm text-gray-700">
                            {hearing.notes}
                          </p>
                        )}
                      </div>
                      <Link
                        to={`/judge/hearings/${hearing._id}`}
                        className="text-green-600 hover:text-green-700 text-sm font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setShowStatusModal(true)}
                disabled={caseData.status === "Closed"}
                className={`w-full px-4 py-2 rounded-md flex items-center justify-center ${
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
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center ease-in-out duration-300"
                >
                  <FaCalendarAlt className="mr-2" /> Schedule Hearing
                </button>
              )}
              <Link
                to="/judge/calendar"
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 flex items-center justify-center ease-in-out duration-300"
              >
                <FaCalendarAlt className="mr-2" /> View Calendar
              </Link>
            </div>
          </div>

          {/* Case Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium mb-4">Case Statistics</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Hearings:</span>
                <span className="font-medium">{hearings.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Upcoming Hearings:</span>
                <span className="font-medium">
                  {hearings.filter((h) => new Date(h.date) > new Date()).length}
                </span>
              </div>
              <div className="flex justify-between">
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Update Case Status</h2>
            <p className="mb-4 text-gray-600">
              Change the status for case:{" "}
              <span className="font-medium">{caseData.title}</span>
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
              >
                <option value="">-- Select Status --</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleStatusUpdate}
                loading={statusUpdateLoading}
                loadingText="Updating..."
                disabled={!newStatus}
                className="px-4 py-2 bg-tertiary text-white rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center"
              >
                <FaEdit className="mr-2" />
                Update Status
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Hearing Modal */}
      {showHearingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Schedule Hearing</h2>
            <p className="mb-4 text-gray-600">
              Schedule a hearing for case:{" "}
              <span className="font-medium">{caseData.title}</span>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-terring-tertiary"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={hearingTime}
                onChange={(e) => setHearingTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-terring-tertiary"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Courtroom *
              </label>
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-terring-tertiary"
              >
                <option value="">-- Select Courtroom --</option>
                {availableCourts.map((court) => (
                  <option key={court._id} value={court._id}>
                    {court.name} - {court.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={hearingNotes}
                onChange={(e) => setHearingNotes(e.target.value)}
                rows="3"
                placeholder="Add any notes about this hearing..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-terring-tertiary"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowHearingModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleScheduleHearing}
                loading={scheduleHearingLoading}
                loadingText="Scheduling..."
                disabled={!hearingDate || !hearingTime || !selectedCourt}
                className="px-4 py-2 bg-tertiary text-white rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center"
              >
                <FaCalendarAlt className="mr-2" />
                Schedule
              </LoadingButton>
            </div>
          </div>
        </div>
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
