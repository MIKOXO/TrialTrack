/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import JudgeLayout from "../../components/JudgeLayout";
import { JudgePageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import { FormLoadingOverlay } from "../../components/LoadingOverlay";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import { courtsAPI, documentsAPI } from "../../services/api";
import {
  FaSearch,
  FaEllipsisV,
  FaEdit,
  FaCalendarAlt,
  FaEye,
  FaClock,
  FaMapMarkerAlt,
  FaFolder,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const JudgeCases = () => {
  const [cases, setCases] = useState([]);
  const dropdownRef = useRef(null);
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const [filteredCases, setFilteredCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showHearingModal, setShowHearingModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [hearingDate, setHearingDate] = useState("");
  const [hearingTime, setHearingTime] = useState("");
  const [selectedCourt, setSelectedCourt] = useState("");
  const [availableCourts, setAvailableCourts] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);
  const [scheduleHearingLoading, setScheduleHearingLoading] = useState(false);
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedCaseForDocs, setSelectedCaseForDocs] = useState(null);

  // Dropdown positioning
  const [dropdownPosition, setDropdownPosition] = useState(null);

  useEffect(() => {
    // Filter cases based on search term and active tab
    let filtered = [...cases];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (caseItem) =>
          caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          caseItem.caseNumber
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          caseItem.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          caseItem.client.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab !== "all") {
      if (activeTab === "scheduled") {
        // Show cases with upcoming scheduled hearings (past hearings are automatically filtered out)
        filtered = filtered.filter(
          (caseItem) => caseItem.scheduledHearing !== null
        );
      } else if (activeTab === "open") {
        // Show only open cases
        filtered = filtered.filter(
          (caseItem) => caseItem.status.toLowerCase() === "open"
        );
      } else {
        // Filter by status for other tabs
        filtered = filtered.filter(
          (caseItem) =>
            caseItem.status.toLowerCase() === activeTab.toLowerCase()
        );
      }
    }

    setFilteredCases(filtered);
  }, [cases, searchTerm, activeTab]);

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

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch cases from the API
        const response = await axios.get("http://localhost:3001/api/case", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Fetch hearings for the judge
        const hearingsResponse = await axios.get(
          "http://localhost:3001/api/hearings",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Create a map of case ID to hearing data
        const hearingsMap = {};
        hearingsResponse.data.forEach((hearing) => {
          const caseId = hearing.case?._id || hearing.case;
          if (caseId) {
            hearingsMap[caseId] = {
              date: hearing.date.split("T")[0], // Convert to YYYY-MM-DD format
              time: hearing.time,
              location: hearing.court?.name || "TBD",
              court: hearing.court,
              hearingId: hearing._id,
            };
          }
        });

        // Fetch document counts for each case
        const casesWithDocCounts = await Promise.all(
          response.data.map(async (caseItem) => {
            let documentCount = 0;
            try {
              const docsResponse = await documentsAPI.getCaseDocuments(
                caseItem._id
              );
              documentCount = docsResponse.data.length;
            } catch (error) {
              console.warn(
                `Could not fetch documents for case ${caseItem._id}:`,
                error
              );
            }
            return { ...caseItem, documentCount };
          })
        );

        // Transform backend data to match frontend structure
        const transformedCases = casesWithDocCounts.map((caseItem) => {
          const hearing = hearingsMap[caseItem._id];
          let scheduledHearing = null;

          // Check if hearing is still upcoming (not passed)
          if (hearing) {
            const hearingDateTime = new Date(`${hearing.date}T${hearing.time}`);
            const now = new Date();

            // Only show as scheduled if the hearing is in the future
            if (hearingDateTime > now) {
              scheduledHearing = hearing;
            }
          }

          return {
            id: caseItem._id,
            title: caseItem.title,
            caseNumber: caseItem._id.slice(-8).toUpperCase(),
            type: caseItem.caseType
              ? caseItem.caseType.charAt(0).toUpperCase() +
                caseItem.caseType.slice(1)
              : "General",
            status: caseItem.status,
            date: new Date(caseItem.createdAt).toLocaleDateString(),
            client:
              caseItem.client?.username ||
              (caseItem.client?.firstName && caseItem.client?.lastName
                ? `${caseItem.client.firstName} ${caseItem.client.lastName}`
                : "Unknown Client"),
            clientData: caseItem.client,
            documentCount: caseItem.documentCount || 0,
            scheduledHearing: scheduledHearing,
          };
        });

        setCases(transformedCases);
        console.log("Judge Cases - Loaded cases:", transformedCases);

        // Add test data if no cases are loaded
        if (transformedCases.length === 0) {
          const testCases = [
            {
              id: "JUDGE001",
              title: "Judge Test Case 1",
              caseNumber: "JTC001",
              type: "Civil",
              date: "2024-01-15",
              status: "Open",
              scheduledHearing: null,
            },
            {
              id: "JUDGE002",
              title: "Judge Test Case 2",
              caseNumber: "JTC002",
              type: "Criminal",
              date: "2024-01-16",
              status: "In Progress",
              scheduledHearing: null,
            },
          ];
          setCases(testCases);
          console.log("Judge Cases - Using test data:", testCases);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError("Failed to load cases. Please try again later.");
        setLoading(false);
      }
    };

    fetchCases();
    fetchCourts();
  }, []);

  // Fetch available time slots when court or date changes
  useEffect(() => {
    if (selectedCourt && hearingDate) {
      fetchAvailableTimeSlots(selectedCourt, hearingDate);
    }
  }, [selectedCourt, hearingDate]);

  // Close any open menus when clicking outside and handle escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Simple approach: only close if clicking outside the table
      const table = document.querySelector("table");
      if (table && !table.contains(event.target)) {
        setActionMenuOpen(null);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === "Escape") {
        setActionMenuOpen(null);
        if (showStatusModal) {
          setShowStatusModal(false);
        }
        if (showHearingModal) {
          setShowHearingModal(false);
        }
      }
    };

    // Add a small delay to prevent immediate closing
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [showStatusModal, showHearingModal]);

  const handleActionClick = (caseId, event) => {
    console.log(
      "Judge page - Toggle action menu for case:",
      caseId,
      "Current open:",
      actionMenuOpen
    );
    if (actionMenuOpen === caseId) {
      setActionMenuOpen(null);
      setDropdownPosition(null);
    } else {
      setActionMenuOpen(caseId);
      // Calculate position relative to the button
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const openStatusModal = (caseItem) => {
    // Check if case is closed
    if (caseItem.status === "Closed") {
      showError(
        "Cannot change status of closed case. Closed cases are final and cannot be reopened."
      );
      setActionMenuOpen(null);
      return;
    }

    setSelectedCase(caseItem);
    setNewStatus(caseItem.status);
    setShowStatusModal(true);
    setActionMenuOpen(null);
  };

  const openHearingModal = (caseItem) => {
    // Check if case is closed
    if (caseItem.status === "Closed") {
      showError(
        "Cannot schedule hearing for closed case. Only open or in-progress cases can have hearings scheduled."
      );
      setActionMenuOpen(null);
      return;
    }

    setSelectedCase(caseItem);
    setHearingDate("");
    setHearingTime("");
    setSelectedCourt("");
    setShowHearingModal(true);
    setActionMenuOpen(null);
  };

  const handleStatusChange = async () => {
    if (!selectedCase || !newStatus) return;

    try {
      setStatusUpdateLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      await axios.put(
        `http://localhost:3001/api/case/status/${selectedCase.id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the case status in local state
      const updatedCases = cases.map((caseItem) => {
        if (caseItem.id === selectedCase.id) {
          return { ...caseItem, status: newStatus };
        }
        return caseItem;
      });

      setCases(updatedCases);
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
    if (!selectedCase || !hearingDate || !hearingTime || !selectedCourt) return;

    try {
      setScheduleHearingLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      // Find the selected court details
      const selectedCourtData = availableCourts.find(
        (court) => court._id === selectedCourt
      );

      const hearingData = {
        date: hearingDate,
        time: hearingTime,
        notes: `Hearing scheduled in ${
          selectedCourtData?.name || "Selected Court"
        }`,
        courtId: selectedCourt,
      };

      await axios.post(
        `http://localhost:3001/api/hearings/create/${selectedCase.id}`,
        hearingData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the case with the scheduled hearing in local state
      const updatedCases = cases.map((caseItem) => {
        if (caseItem.id === selectedCase.id) {
          return {
            ...caseItem,
            scheduledHearing: {
              date: hearingDate,
              time: hearingTime,
              location: selectedCourtData?.name || "Selected Court",
              court: selectedCourtData,
            },
          };
        }
        return caseItem;
      });

      setCases(updatedCases);

      // Show success message
      showSuccess(
        `Hearing successfully scheduled for "${
          selectedCase.title
        }" on ${new Date(
          hearingDate
        ).toLocaleDateString()} at ${hearingTime} in ${
          selectedCourtData?.name || "Selected Court"
        }`,
        6000 // Show for 6 seconds since it's a longer message
      );

      setShowHearingModal(false);

      // Switch to the scheduled tab to show the newly scheduled case
      setActiveTab("scheduled");
    } catch (err) {
      console.error("Error scheduling hearing:", err);

      // Handle specific error types
      if (err.response?.status === 409) {
        showError(
          err.response.data.details ||
            err.response.data.error ||
            "Scheduling conflict detected. Please choose a different time or courtroom.",
          8000 // Show longer for conflict messages
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

  // Open documents modal
  const openDocumentsModal = (caseItem) => {
    setSelectedCaseForDocs(caseItem);
    setShowDocumentsModal(true);
    setActionMenuOpen(null);
  };

  // Close documents modal
  const closeDocumentsModal = () => {
    setShowDocumentsModal(false);
    setSelectedCaseForDocs(null);
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
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

  if (loading) {
    return (
      <JudgeLayout>
        <JudgePageLoader message="Loading cases..." />
      </JudgeLayout>
    );
  }

  if (error) {
    return (
      <JudgeLayout>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </JudgeLayout>
    );
  }

  return (
    <section>
      <JudgeLayout>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Cases</h1>
          <p className="text-gray-600">View and Manage all your court cases</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 w-[680px] rounded-lg shadow-md bg-tertiary bg-opacity-15">
          <div className="flex border-b p-2">
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "all"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Cases
            </button>
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "open"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("open")}
            >
              Open
            </button>
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "in progress"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("in progress")}
            >
              In Progress
            </button>
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "scheduled"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("scheduled")}
            >
              Scheduled
            </button>
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "closed"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("closed")}
            >
              Closed
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Cases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-4 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              {activeTab === "scheduled"
                ? "No Upcoming Scheduled Cases"
                : "No Cases Found"}
            </h2>
            <p className="text-gray-500 mb-6">
              {activeTab === "scheduled"
                ? "No cases have upcoming hearings scheduled. Schedule a hearing for your cases or check if past hearings have been completed."
                : "No cases match your search criteria."}
            </p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSearchTerm("");
              }}
              className="bg-tertiary text-white px-6 py-2 rounded-md hover:scale-95 shadow-400 ease-in-out duration-300 inline-block"
            >
              {activeTab === "scheduled" ? "View All Cases" : "Clear Filters"}
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documents
                  </th>
                  {activeTab === "scheduled" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hearing Details
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span>{caseItem.title}</span>
                        <Link
                          to={`/judge/cases/${caseItem.id}`}
                          className="text-green-600 hover:text-green-800 text-xs underline"
                          title="View Details"
                        >
                          View
                        </Link>
                        {caseItem.scheduledHearing && (
                          <span
                            className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full cursor-help"
                            title={`Hearing on ${new Date(
                              caseItem.scheduledHearing.date
                            ).toLocaleDateString()} at ${
                              caseItem.scheduledHearing.time
                            } in ${caseItem.scheduledHearing.location}`}
                          >
                            Scheduled
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.client}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => openDocumentsModal(caseItem)}
                        className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors"
                        title="View Documents"
                      >
                        <FaFolder className="w-4 h-4" />
                        <span className="font-medium">
                          {caseItem.documentCount}
                        </span>
                        <span className="text-xs">docs</span>
                      </button>
                    </td>
                    {activeTab === "scheduled" && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.scheduledHearing ? (
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <FaCalendarAlt className="mr-1 text-green-600" />
                              <span className="font-medium">
                                {new Date(
                                  caseItem.scheduledHearing.date
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <FaClock className="mr-1 text-blue-600" />
                              <span>{caseItem.scheduledHearing.time}</span>
                            </div>
                            <div className="flex items-center">
                              <FaMapMarkerAlt className="mr-1 text-purple-600" />
                              <span className="text-xs">
                                {caseItem.scheduledHearing.location}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">
                            No hearing scheduled
                          </span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(
                          caseItem.status
                        )}`}
                      >
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                      <div className="relative inline-block text-left">
                        <button
                          data-action-button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(caseItem.id, e);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                          title="Actions"
                        >
                          <FaEllipsisV />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Dropdown Menu - Rendered outside table to avoid overflow issues */}
            {actionMenuOpen && dropdownPosition && (
              <div
                data-dropdown-menu
                className="fixed bg-white rounded-md shadow-xl border-2 border-red-500 overflow-hidden"
                style={{
                  zIndex: 9999,
                  width: "192px",
                  top: `${dropdownPosition.top}px`,
                  right: `${dropdownPosition.right}px`,
                }}
              >
                <div className="py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const selectedCase = filteredCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      if (selectedCase) openStatusModal(selectedCase);
                    }}
                    disabled={(() => {
                      const selectedCase = filteredCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      return selectedCase?.status === "Closed";
                    })()}
                    className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${(() => {
                      const selectedCase = filteredCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      return selectedCase?.status === "Closed"
                        ? "text-gray-400 cursor-not-allowed bg-gray-50"
                        : "text-gray-700 hover:bg-gray-100";
                    })()}`}
                    title={(() => {
                      const selectedCase = filteredCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      return selectedCase?.status === "Closed"
                        ? "Cannot change status of closed case"
                        : "Change the status of this case";
                    })()}
                  >
                    <FaEdit
                      className={`mr-2 ${(() => {
                        const selectedCase = filteredCases.find(
                          (c) => c.id === actionMenuOpen
                        );
                        return selectedCase?.status === "Closed"
                          ? "text-gray-400"
                          : "text-blue-600";
                      })()}`}
                    />
                    Change Status
                    {(() => {
                      const selectedCase = filteredCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      return selectedCase?.status === "Closed" ? (
                        <span className="ml-2 text-xs text-gray-400">
                          (Case Closed)
                        </span>
                      ) : null;
                    })()}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const selectedCase = filteredCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      if (selectedCase) openHearingModal(selectedCase);
                    }}
                    disabled={(() => {
                      const selectedCase = filteredCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      return selectedCase?.status === "Closed";
                    })()}
                    className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${(() => {
                      const selectedCase = filteredCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      return selectedCase?.status === "Closed"
                        ? "text-gray-400 cursor-not-allowed bg-gray-50"
                        : "text-gray-700 hover:bg-gray-100";
                    })()}`}
                    title={(() => {
                      const selectedCase = filteredCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      return selectedCase?.status === "Closed"
                        ? "Cannot schedule hearing for closed case"
                        : "Schedule a hearing for this case";
                    })()}
                  >
                    <FaCalendarAlt
                      className={`mr-2 ${(() => {
                        const selectedCase = filteredCases.find(
                          (c) => c.id === actionMenuOpen
                        );
                        return selectedCase?.status === "Closed"
                          ? "text-gray-400"
                          : "text-purple-600";
                      })()}`}
                    />
                    Schedule Hearing
                    {(() => {
                      const selectedCase = filteredCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      return selectedCase?.status === "Closed" ? (
                        <span className="ml-2 text-xs text-gray-400">
                          (Case Closed)
                        </span>
                      ) : null;
                    })()}
                  </button>
                  <Link
                    to={`/judge/cases/${actionMenuOpen}`}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <FaEye className="mr-2 text-green-600" />
                    View Details
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && (
          <FormLoadingOverlay
            isVisible={statusUpdateLoading}
            message="Updating status..."
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Change Case Status
                  </h2>
                  <button
                    onClick={() => setShowStatusModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Case:</p>
                  <p className="font-medium text-gray-900">
                    {selectedCase?.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {selectedCase?.caseNumber}
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    onClick={handleStatusChange}
                    loading={statusUpdateLoading}
                    loadingText="Updating..."
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FaEdit className="mr-2" />
                    Update Status
                  </LoadingButton>
                </div>
              </div>
            </div>
          </FormLoadingOverlay>
        )}

        {/* Schedule Hearing Modal */}
        {showHearingModal && (
          <FormLoadingOverlay
            isVisible={scheduleHearingLoading}
            message="Scheduling hearing..."
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Schedule Hearing
                  </h2>
                  <button
                    onClick={() => setShowHearingModal(false)}
                    className="text-gray-400 hover:text-gray-600 text-xl"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Case:</p>
                  <p className="font-medium text-gray-900">
                    {selectedCase?.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {selectedCase?.caseNumber}
                  </p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={hearingDate}
                    onChange={(e) => setHearingDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time *
                    {selectedCourt && hearingDate && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({availableTimeSlots.length} slots available)
                      </span>
                    )}
                  </label>
                  {selectedCourt &&
                  hearingDate &&
                  availableTimeSlots.length > 0 ? (
                    <select
                      value={hearingTime}
                      onChange={(e) => setHearingTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      disabled={loadingTimeSlots}
                    >
                      <option value="">-- Select available time --</option>
                      {availableTimeSlots.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  ) : selectedCourt &&
                    hearingDate &&
                    availableTimeSlots.length === 0 &&
                    !loadingTimeSlots ? (
                    <div className="w-full border border-red-300 rounded-md px-3 py-2 bg-red-50 text-red-700 text-sm">
                      No available time slots for this date. Please choose a
                      different date or courtroom.
                    </div>
                  ) : (
                    <input
                      type="time"
                      value={hearingTime}
                      onChange={(e) => setHearingTime(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder={
                        selectedCourt && hearingDate
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

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Courtroom *
                  </label>
                  <select
                    value={selectedCourt}
                    onChange={(e) => setSelectedCourt(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="">-- Select a courtroom --</option>
                    {availableCourts.map((court) => (
                      <option key={court._id} value={court._id}>
                        {court.name} - {court.location} ({court.type})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowHearingModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    onClick={handleScheduleHearing}
                    loading={scheduleHearingLoading}
                    loadingText="Scheduling..."
                    disabled={!hearingDate || !hearingTime || !selectedCourt}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Schedule
                  </LoadingButton>
                </div>
              </div>
            </div>
          </FormLoadingOverlay>
        )}

        {/* Documents Modal */}
        {showDocumentsModal && selectedCaseForDocs && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Documents for Case: {selectedCaseForDocs.title}
                </h2>
                <button
                  onClick={closeDocumentsModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="border-t pt-4">
                <p className="text-gray-600 mb-4">
                  Client: {selectedCaseForDocs.client} | Total Documents:{" "}
                  {selectedCaseForDocs.documentCount}
                </p>

                {selectedCaseForDocs.documentCount === 0 ? (
                  <div className="text-center py-8">
                    <FaFolder className="mx-auto text-gray-400 text-4xl mb-4" />
                    <p className="text-gray-500">
                      No documents found for this case.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      This case has {selectedCaseForDocs.documentCount}{" "}
                      document(s). Click "View Case Details" to access and
                      manage documents.
                    </p>
                    <Link
                      to={`/judge/cases/${selectedCaseForDocs.id}`}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      onClick={closeDocumentsModal}
                    >
                      <FaEye className="mr-2" />
                      View Case Details
                    </Link>
                  </div>
                )}
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
    </section>
  );
};

export default JudgeCases;
