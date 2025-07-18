import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import JudgeLayout from "../../components/JudgeLayout";
import { JudgePageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import { courtsAPI } from "../../services/api";
import {
  FaSearch,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUserTie,
  FaGavel,
  FaEllipsisH,
  FaEdit,
  FaTrashAlt,
  FaFileAlt,
} from "react-icons/fa";

const JudgeHearingsPage = () => {
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [hearings, setHearings] = useState([]);
  const [filteredHearings, setFilteredHearings] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHearing, setSelectedHearing] = useState(null);
  const [hearingDate, setHearingDate] = useState("");
  const [hearingTime, setHearingTime] = useState("");
  const [hearingLocation, setHearingLocation] = useState("");
  const [hearingNotes, setHearingNotes] = useState("");
  const [availableCourts, setAvailableCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filter hearings based on search term and active tab
  useEffect(() => {
    let filtered = [...hearings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (hearing) =>
          hearing.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hearing.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hearing.parties.some((party) =>
            party.toLowerCase().includes(searchTerm.toLowerCase())
          )
      );
    }

    // Apply tab filter
    if (activeTab !== "all") {
      if (activeTab === "upcoming") {
        filtered = filtered.filter((hearing) => hearing.status === "Upcoming");
      } else if (activeTab === "today") {
        const today = new Date().toISOString().split("T")[0];
        filtered = filtered.filter((hearing) => hearing.date === today);
      } else if (activeTab === "completed") {
        filtered = filtered.filter((hearing) => hearing.status === "Completed");
      }
    }

    // Sort hearings by date (upcoming first)
    filtered.sort((a, b) => {
      if (a.status === "Upcoming" && b.status !== "Upcoming") return -1;
      if (a.status !== "Upcoming" && b.status === "Upcoming") return 1;
      return new Date(a.date) - new Date(b.date);
    });

    setFilteredHearings(filtered);
  }, [hearings, searchTerm, activeTab]);

  // Initial load
  useEffect(() => {
    const fetchHearings = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch hearings from the API
        const response = await axios.get("http://localhost:3001/api/hearings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Transform hearings data for the UI with enhanced status logic
        const transformedHearings = response.data.map((hearing) => {
          const hearingDate = new Date(hearing.date);
          const hearingTime = hearing.time;
          const now = new Date();

          // Create a combined date-time for accurate comparison
          const [hours, minutes] = hearingTime.split(":");
          const hearingDateTime = new Date(hearingDate);
          hearingDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

          // Determine status based on date/time and case status
          let status = "Upcoming";
          if (hearing.case?.status === "Closed") {
            status = "Completed";
          } else if (hearingDateTime < now) {
            // If hearing time has passed but case is still open
            const timeDiff = now - hearingDateTime;
            const hoursDiff = timeDiff / (1000 * 60 * 60);

            if (hoursDiff > 2) {
              // More than 2 hours past - likely completed
              status = "Completed";
            } else {
              // Within 2 hours - might still be in progress
              status = "In Progress";
            }
          }

          return {
            id: hearing._id,
            caseTitle: hearing.case?.title || "Unknown Case",
            caseNumber: hearing._id.slice(-8).toUpperCase(),
            caseId: hearing.case?._id || "",
            caseStatus: hearing.case?.status || "Open",
            date: hearing.date.split("T")[0], // Convert to YYYY-MM-DD format
            time: hearing.time,
            location: hearing.court?.name || "TBD",
            status: status,
            parties: [], // Backend doesn't store parties separately
            notes: hearing.notes || "",
            type: hearing.case?.caseType
              ? hearing.case.caseType === "smallClaims"
                ? "SmallClaims"
                : hearing.case.caseType.charAt(0).toUpperCase() +
                  hearing.case.caseType.slice(1)
              : "General",
            hearingDateTime: hearingDateTime, // Store for sorting
          };
        });

        setHearings(transformedHearings);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hearings:", err);
        showError("Failed to load hearings. Please try again later.");
        setLoading(false);
      }
    };

    fetchHearings();
    fetchCourts();
  }, []);

  // Fetch available courts
  const fetchCourts = async () => {
    try {
      const response = await courtsAPI.getCourts();
      setAvailableCourts(response.data);
    } catch (err) {
      console.error("Error fetching courts:", err);
      showError("Failed to load courts. Please try again later.");
    }
  };

  const handleActionClick = (hearingId) => {
    if (actionMenuOpen === hearingId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(hearingId);
    }
  };

  const openEditModal = (hearing) => {
    // Check if case is closed
    if (hearing.caseStatus === "Closed") {
      showError(
        "Cannot edit hearing for closed case. Only open or in-progress cases can have their hearings modified."
      );
      setActionMenuOpen(null);
      return;
    }

    setSelectedHearing(hearing);
    setHearingDate(hearing.date);
    setHearingTime(hearing.time);
    setHearingLocation(hearing.location);
    setHearingNotes(hearing.notes || "");

    // Find the court ID for this hearing
    const court = availableCourts.find((c) => c.name === hearing.location);
    setSelectedCourt(court?._id || "");

    setShowEditModal(true);
    setActionMenuOpen(null);
  };

  const openDeleteModal = (hearing) => {
    // Check if case is closed
    if (hearing.caseStatus === "Closed") {
      showError(
        "Cannot delete hearing for closed case. Only open or in-progress cases can have their hearings modified."
      );
      setActionMenuOpen(null);
      return;
    }

    setSelectedHearing(hearing);
    setShowDeleteModal(true);
    setActionMenuOpen(null);
  };

  const handleEditHearing = async () => {
    if (!selectedHearing || !hearingDate || !hearingTime || !selectedCourt)
      return;

    try {
      setEditLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found");
        return;
      }

      const updateData = {
        date: hearingDate,
        time: hearingTime,
        notes: hearingNotes,
        courtId: selectedCourt,
      };

      await axios.put(
        `http://localhost:3001/api/hearings/update/${selectedHearing.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the hearing in local state
      const selectedCourtData = availableCourts.find(
        (c) => c._id === selectedCourt
      );
      const updatedHearings = hearings.map((hearing) => {
        if (hearing.id === selectedHearing.id) {
          return {
            ...hearing,
            date: hearingDate,
            time: hearingTime,
            location: selectedCourtData?.name || hearingLocation,
            notes: hearingNotes,
          };
        }
        return hearing;
      });

      setHearings(updatedHearings);
      setShowEditModal(false);
      showSuccess("Hearing updated successfully!");
    } catch (err) {
      console.error("Error updating hearing:", err);

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
            "Cannot update hearing for closed case. Only open or in-progress cases can have their hearings updated.",
          6000
        );
      } else {
        showError(
          err.response?.data?.error ||
            "Failed to update hearing. Please try again."
        );
      }
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteHearing = async () => {
    if (!selectedHearing) return;

    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Authentication token not found");
        return;
      }

      await axios.delete(
        `http://localhost:3001/api/hearings/${selectedHearing.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Delete the hearing from local state
      const updatedHearings = hearings.filter(
        (hearing) => hearing.id !== selectedHearing.id
      );

      setHearings(updatedHearings);
      setShowDeleteModal(false);
      showSuccess("Hearing deleted successfully!");
    } catch (err) {
      console.error("Error deleting hearing:", err);

      // Handle specific error types
      if (
        err.response?.status === 400 &&
        err.response.data.error?.includes("closed case")
      ) {
        showError(
          err.response.data.details ||
            err.response.data.error ||
            "Cannot delete hearing for closed case. Only open or in-progress cases can have their hearings modified.",
          6000
        );
      } else {
        showError(
          err.response?.data?.error ||
            "Failed to delete hearing. Please try again."
        );
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filter hearings based on active tab and search term
  useEffect(() => {
    let filtered = [...hearings];

    // Filter by tab
    const today = new Date().toDateString();
    switch (activeTab) {
      case "today":
        filtered = filtered.filter(
          (hearing) => new Date(hearing.date).toDateString() === today
        );
        break;
      case "upcoming":
        filtered = filtered.filter((hearing) => hearing.status === "Upcoming");
        break;
      case "inprogress":
        filtered = filtered.filter(
          (hearing) => hearing.status === "In Progress"
        );
        break;
      case "completed":
        filtered = filtered.filter((hearing) => hearing.status === "Completed");
        break;
      default:
        // "all" - no additional filtering
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (hearing) =>
          hearing.caseTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hearing.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          hearing.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort by date and time (upcoming first, then by date/time)
    filtered.sort((a, b) => {
      // First sort by status priority (Upcoming > In Progress > Completed)
      const statusPriority = { Upcoming: 3, "In Progress": 2, Completed: 1 };
      const statusDiff =
        (statusPriority[b.status] || 0) - (statusPriority[a.status] || 0);

      if (statusDiff !== 0) return statusDiff;

      // Then sort by date/time
      return a.hearingDateTime - b.hearingDateTime;
    });

    setFilteredHearings(filtered);
  }, [hearings, activeTab, searchTerm]);

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <JudgeLayout>
        <JudgePageLoader message="Loading hearings..." />
      </JudgeLayout>
    );
  }

  if (error) {
    return (
      <JudgeLayout>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-3 md:px-4 py-3 rounded relative mx-4 md:mx-0"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </JudgeLayout>
    );
  }

  return (
    <JudgeLayout>
      <div className="mb-4 md:mb-6 px-4 md:px-0">
        <h1 className="text-lg md:text-xl font-semibold text-gray-800">
          Hearings
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          View and manage all scheduled court hearings
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-4 md:mb-6 mx-4 md:mx-0 max-w-full md:w-[640px] rounded-lg shadow-md bg-tertiary bg-opacity-15 overflow-x-auto">
        <div className="flex p-2 min-w-full md:min-w-0">
          <button
            className={`py-2 md:py-3 px-4 md:px-8 text-center font-medium transition-all text-sm md:text-base whitespace-nowrap ${
              activeTab === "all"
                ? "bg-white rounded-lg"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("all")}
          >
            <span className="hidden sm:inline">All Hearings</span>
            <span className="sm:hidden">All</span>
          </button>
          <button
            className={`py-2 md:py-3 px-4 md:px-8 text-center font-medium transition-all text-sm md:text-base whitespace-nowrap ${
              activeTab === "today"
                ? "bg-white rounded-lg"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("today")}
          >
            Today
          </button>
          <button
            className={`py-2 md:py-3 px-4 md:px-8 text-center font-medium transition-all text-sm md:text-base whitespace-nowrap ${
              activeTab === "upcoming"
                ? "bg-white rounded-lg"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("upcoming")}
          >
            <span className="hidden sm:inline">
              Upcoming ({hearings.filter((h) => h.status === "Upcoming").length}
              )
            </span>
            <span className="sm:hidden">
              Up ({hearings.filter((h) => h.status === "Upcoming").length})
            </span>
          </button>
          <button
            className={`py-2 md:py-3 px-4 md:px-8 text-center font-medium transition-all text-sm md:text-base whitespace-nowrap ${
              activeTab === "completed"
                ? "bg-white rounded-lg"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setActiveTab("completed")}
          >
            <span className="hidden sm:inline">
              Completed (
              {hearings.filter((h) => h.status === "Completed").length})
            </span>
            <span className="sm:hidden">
              Done ({hearings.filter((h) => h.status === "Completed").length})
            </span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4 md:mb-6 px-4 md:px-0">
        <div className="relative">
          <FaSearch className="absolute left-3 top-3 md:top-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Hearings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 md:py-4 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Hearings List */}
      {filteredHearings.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-6 md:p-8 text-center mx-4 md:mx-0">
          <h2 className="text-lg md:text-xl font-medium text-gray-700 mb-2">
            No Hearings Found
          </h2>
          <p className="text-gray-500 mb-4 md:mb-6 text-sm md:text-base">
            No hearings match your search criteria.
          </p>
          <button
            onClick={() => {
              setActiveTab("all");
              setSearchTerm("");
            }}
            className="bg-green-600 text-white px-4 md:px-6 py-2 rounded-md hover:bg-green-700 transition-colors inline-block text-sm md:text-base"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4 px-4 md:px-0">
          {filteredHearings.map((hearing) => (
            <div
              key={hearing.id}
              className="bg-white rounded-lg shadow-md p-3 md:p-4"
            >
              <div className="flex flex-col md:flex-row md:justify-between gap-3 md:gap-0">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                    <h3 className="font-medium text-gray-900 text-base md:text-lg break-words">
                      {hearing.caseTitle}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full font-medium self-start sm:self-auto flex-shrink-0 ${
                        hearing.status === "Upcoming"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {hearing.status}
                    </span>
                  </div>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 break-words">
                    {hearing.caseNumber}
                  </p>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div className="flex items-center text-xs md:text-sm text-gray-500">
                      <FaCalendarAlt className="text-gray-400 mr-2 flex-shrink-0" />
                      <span className="break-words">
                        {formatDate(hearing.date)}
                      </span>
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-gray-500">
                      <FaClock className="text-gray-400 mr-2 flex-shrink-0" />
                      <span>{hearing.time}</span>
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-gray-500">
                      <FaMapMarkerAlt className="text-gray-400 mr-2 flex-shrink-0" />
                      <span className="break-words">{hearing.location}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="text-xs md:text-sm text-gray-500 font-medium">
                      Parties:
                    </div>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {hearing.parties.map((party, index) => (
                        <div
                          key={index}
                          className="flex items-center text-xs md:text-sm bg-gray-100 px-2 py-1 rounded"
                        >
                          <FaUserTie className="text-gray-400 mr-1 flex-shrink-0" />
                          <span className="break-words">{party}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {hearing.notes && (
                    <div className="mt-3">
                      <div className="text-xs md:text-sm text-gray-500 font-medium">
                        Notes:
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                        {hearing.notes}
                      </p>
                    </div>
                  )}
                </div>

                <div className="md:ml-4 relative flex-shrink-0">
                  <button
                    onClick={() => handleActionClick(hearing.id)}
                    className="text-gray-400 hover:text-gray-600 p-2"
                  >
                    <FaEllipsisH />
                  </button>

                  {actionMenuOpen === hearing.id && (
                    <div className="absolute right-0 mt-2 w-44 md:w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <div className="py-1">
                        <button
                          onClick={() => openEditModal(hearing)}
                          disabled={hearing.caseStatus === "Closed"}
                          className={`flex items-center w-full text-left px-3 md:px-4 py-2 text-xs md:text-sm transition-colors ${
                            hearing.caseStatus === "Closed"
                              ? "text-gray-400 cursor-not-allowed bg-gray-50"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          title={
                            hearing.caseStatus === "Closed"
                              ? "Cannot edit hearing for closed case"
                              : "Edit this hearing"
                          }
                        >
                          <FaEdit
                            className={`mr-2 flex-shrink-0 ${
                              hearing.caseStatus === "Closed"
                                ? "text-gray-400"
                                : ""
                            }`}
                          />
                          <span className="break-words">Edit Hearing</span>
                          {hearing.caseStatus === "Closed" && (
                            <span className="ml-2 text-xs text-gray-400 hidden md:inline">
                              (Case Closed)
                            </span>
                          )}
                        </button>
                        <button
                          onClick={() => openDeleteModal(hearing)}
                          disabled={hearing.caseStatus === "Closed"}
                          className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${
                            hearing.caseStatus === "Closed"
                              ? "text-gray-400 cursor-not-allowed bg-gray-50"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                          title={
                            hearing.caseStatus === "Closed"
                              ? "Cannot delete hearing for closed case"
                              : "Delete this hearing"
                          }
                        >
                          <FaTrashAlt
                            className={`mr-2 ${
                              hearing.caseStatus === "Closed"
                                ? "text-gray-400"
                                : ""
                            }`}
                          />
                          Delete Hearing
                          {hearing.caseStatus === "Closed" && (
                            <span className="ml-2 text-xs text-gray-400">
                              (Case Closed)
                            </span>
                          )}
                        </button>
                        <Link
                          to={`/judge/hearings/${hearing.id}`}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaGavel className="mr-2" /> View Hearing Details
                        </Link>
                        <Link
                          to={`/judge/cases/${hearing.caseId}`}
                          className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <FaFileAlt className="mr-2" /> View Case
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Hearing Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Edit Hearing
            </h2>
            <p className="mb-4 text-gray-600 text-sm md:text-base break-words">
              Update hearing details for case:{" "}
              <span className="font-medium">{selectedHearing?.caseTitle}</span>
            </p>

            <div className="mb-3 md:mb-4">
              <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">
                Date
              </label>
              <input
                type="date"
                value={hearingDate}
                onChange={(e) => setHearingDate(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
              />
            </div>

            <div className="mb-3 md:mb-4">
              <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">
                Time
              </label>
              <input
                type="time"
                value={hearingTime}
                onChange={(e) => setHearingTime(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
              />
            </div>

            <div className="mb-3 md:mb-4">
              <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">
                Courtroom *
              </label>
              <select
                value={selectedCourt}
                onChange={(e) => setSelectedCourt(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
              >
                <option value="">-- Select Courtroom --</option>
                {availableCourts.map((court) => (
                  <option key={court._id} value={court._id}>
                    {court.name} - {court.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4 md:mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">
                Notes
              </label>
              <textarea
                placeholder="Add any notes about this hearing"
                value={hearingNotes}
                onChange={(e) => setHearingNotes(e.target.value)}
                rows="3"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base resize-y"
              ></textarea>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm md:text-base order-2 md:order-1"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleEditHearing}
                loading={editLoading}
                loadingText="Updating..."
                disabled={!hearingDate || !hearingTime || !selectedCourt}
                className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center text-sm md:text-base order-1 md:order-2"
              >
                <FaEdit className="mr-2" />
                Update Hearing
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      {/* Delete Hearing Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Delete Hearing
            </h2>
            <p className="mb-4 text-gray-600 text-sm md:text-base break-words">
              Are you sure you want to delete this hearing for case:{" "}
              <span className="font-medium">{selectedHearing?.caseTitle}</span>?
            </p>
            <p className="mb-4 md:mb-6 text-gray-600 text-sm md:text-base">
              This action cannot be undone.
            </p>

            <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm md:text-base order-2 md:order-1"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleDeleteHearing}
                loading={deleteLoading}
                loadingText="Deleting..."
                className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center text-sm md:text-base order-1 md:order-2"
              >
                <FaTrashAlt className="mr-2" />
                Delete
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

export default JudgeHearingsPage;
