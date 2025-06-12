/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { casesAPI, authAPI } from "../../services/api";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import AdminLayout from "../../components/AdminLayout";
import {
  FaEllipsisV,
  FaSearch,
  FaUserPlus,
  FaEdit,
  FaCalendarAlt,
} from "react-icons/fa";

const AdminCases = () => {
  const [cases, setCases] = useState([]);
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedJudge, setSelectedJudge] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [assignLoading, setAssignLoading] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState(null);

  // Judges data from backend
  const [judges, setJudges] = useState([]);

  // Helper functions
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleActionMenu = (caseId, event) => {
    if (actionMenuOpen === caseId) {
      setActionMenuOpen(null);
      setDropdownPosition(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        right: window.innerWidth - rect.right,
      });
      setActionMenuOpen(caseId);
    }
  };

  // Fetch data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch cases
        const casesResponse = await casesAPI.getCases();
        const casesData = casesResponse.data;

        // Transform cases data for display
        const transformedCases = casesData.map((caseItem) => ({
          id: caseItem._id,
          title: caseItem.title,
          client: caseItem.client?.username || "Unknown Client",
          type: "General", // Backend doesn't have type field
          date: new Date(caseItem.createdAt).toLocaleDateString(),
          status: caseItem.status, // Use status as-is from backend
        }));

        setCases(transformedCases);
        console.log("Admin Cases - Loaded cases:", transformedCases);

        // Fetch users to get judges
        const usersResponse = await authAPI.getUsers();
        const users = usersResponse.data;
        const judgeUsers = users.filter((user) => user.role === "Judge");

        const transformedJudges = judgeUsers.map((judge) => ({
          id: judge._id,
          name: judge.username,
        }));

        setJudges(transformedJudges);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cases data:", err);
        setError("Failed to load cases data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter and pagination logic
  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || caseItem.status === statusFilter;
    const matchesType =
      typeFilter === "All Types" || caseItem.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredCases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCases = filteredCases.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Open assign judge modal
  const openAssignModal = (caseItem) => {
    // Check if case is closed
    if (caseItem.status === "Closed") {
      showError(
        "Cannot assign judge to closed case. Only open or in-progress cases can be assigned to judges."
      );
      setActionMenuOpen(null);
      return;
    }

    setSelectedCase(caseItem);
    setSelectedJudge(""); // Reset selected judge
    setShowAssignModal(true);
    setActionMenuOpen(null);
  };

  // Close assign modal
  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedCase(null);
    setSelectedJudge("");
  };

  // Handle judge assignment
  const handleAssignJudge = async () => {
    if (!selectedCase || !selectedJudge) {
      showError("Please select a judge before assigning.");
      return;
    }

    try {
      setAssignLoading(true);

      // Find the judge ID from the selected judge name
      const judge = judges.find((j) => j.name === selectedJudge);
      if (!judge) {
        showError("Selected judge not found. Please try again.");
        return;
      }

      // Make API call to assign judge
      await casesAPI.assignCase(selectedCase.id, judge.id);

      // Update the case with the assigned judge
      const updatedCases = cases.map((caseItem) => {
        if (caseItem.id === selectedCase.id) {
          return {
            ...caseItem,
            assignedJudge: selectedJudge,
            status: "In Progress", // Update status when judge is assigned
          };
        }
        return caseItem;
      });

      setCases(updatedCases);
      closeAssignModal();

      // Show success message
      showSuccess(
        `Judge ${selectedJudge} has been successfully assigned to case "${selectedCase.title}"`
      );
    } catch (error) {
      console.error("Error assigning judge:", error);

      // Handle specific error types
      if (
        error.response?.status === 400 &&
        error.response.data.error?.includes("closed case")
      ) {
        showError(
          error.response.data.details ||
            error.response.data.error ||
            "Cannot assign judge to closed case. Only open or in-progress cases can be assigned to judges.",
          6000
        );
      } else {
        const errorMessage =
          error.response?.data?.error ||
          "Failed to assign judge. Please try again.";
        showError(errorMessage);
      }
    } finally {
      setAssignLoading(false);
    }
  };

  // Open status change modal
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

  // Close status modal
  const closeStatusModal = () => {
    setShowStatusModal(false);
    setSelectedCase(null);
    setNewStatus("");
  };

  // Handle status change
  const handleStatusChange = async () => {
    if (!selectedCase || !newStatus) {
      showError("Please select a status before updating.");
      return;
    }

    try {
      // Make API call to update status
      await casesAPI.updateCaseStatus(selectedCase.id, newStatus);

      // Update the case status in local state
      const updatedCases = cases.map((caseItem) => {
        if (caseItem.id === selectedCase.id) {
          return { ...caseItem, status: newStatus };
        }
        return caseItem;
      });

      setCases(updatedCases);
      closeStatusModal();

      // Show success message
      showSuccess(`Case status updated to "${newStatus}" successfully!`);
    } catch (error) {
      console.error("Error updating case status:", error);

      // Handle specific error types
      if (
        error.response?.status === 400 &&
        error.response.data.error?.includes("closed case")
      ) {
        showError(
          error.response.data.details ||
            error.response.data.error ||
            "Cannot change status of closed case. Closed cases are final and cannot be reopened.",
          6000
        );
      } else {
        const errorMessage =
          error.response?.data?.error ||
          "Failed to update case status. Please try again.";
        showError(errorMessage);
      }
    }
  };

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
        if (showAssignModal && !assignLoading) {
          closeAssignModal();
        }
        if (showStatusModal) {
          closeStatusModal();
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
  }, [showAssignModal, assignLoading, showStatusModal]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-lg">Loading cases...</p>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <section>
      <AdminLayout>
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Cases</h1>
          <p className="text-gray-600 font-light">
            Manage and track all your legal cases in one place.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search Cases..."
              className="pl-10 pr-4 py-4 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Closed</option>
            <option>Urgent</option>
          </select>

          <select
            className="border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All Types</option>
            <option>Civil</option>
            <option>Criminal</option>
            <option>Family</option>
            <option>Traffic</option>
          </select>
        </div>

        {/* Cases Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Case ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentCases.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No cases found.{" "}
                    {cases.length === 0
                      ? "Loading..."
                      : "Try adjusting your filters."}
                  </td>
                </tr>
              ) : (
                currentCases.map((caseItem) => (
                  <tr key={caseItem.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {caseItem.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          caseItem.status
                        )}`}
                      >
                        {caseItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <button
                          data-action-button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleActionMenu(caseItem.id, e);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
                          title="Actions"
                        >
                          <FaEllipsisV />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Dropdown Menu - Rendered outside table to avoid overflow issues */}
          {actionMenuOpen && dropdownPosition && (
            <div
              data-dropdown-menu
              className="fixed bg-white rounded-md shadow-xl border border-gray-200 overflow-hidden"
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
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    if (selectedCase) openAssignModal(selectedCase);
                  }}
                  disabled={(() => {
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    return selectedCase?.status === "Closed";
                  })()}
                  className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${(() => {
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    return selectedCase?.status === "Closed"
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "text-gray-700 hover:bg-gray-100";
                  })()}`}
                  title={(() => {
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    return selectedCase?.status === "Closed"
                      ? "Cannot assign judge to closed case"
                      : "Assign a judge to this case";
                  })()}
                >
                  <FaUserPlus
                    className={`mr-2 ${(() => {
                      const selectedCase = currentCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      return selectedCase?.status === "Closed"
                        ? "text-gray-400"
                        : "text-green-600";
                    })()}`}
                  />
                  Assign to Judge
                  {(() => {
                    const selectedCase = currentCases.find(
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
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    if (selectedCase) openStatusModal(selectedCase);
                  }}
                  disabled={(() => {
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    return selectedCase?.status === "Closed";
                  })()}
                  className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${(() => {
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    return selectedCase?.status === "Closed"
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "text-gray-700 hover:bg-gray-100";
                  })()}`}
                  title={(() => {
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    return selectedCase?.status === "Closed"
                      ? "Cannot change status of closed case"
                      : "Change the status of this case";
                  })()}
                >
                  <FaEdit
                    className={`mr-2 ${(() => {
                      const selectedCase = currentCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      return selectedCase?.status === "Closed"
                        ? "text-gray-400"
                        : "text-blue-600";
                    })()}`}
                  />
                  Change Status
                  {(() => {
                    const selectedCase = currentCases.find(
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
                    // TODO: Implement schedule hearing functionality
                    setActionMenuOpen(null);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <FaCalendarAlt className="mr-2 text-purple-600" />
                  Schedule Hearing
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } border border-gray-300`}
            >
              Previous
            </button>

            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              // Show current page and adjacent pages
              let pageToShow;
              if (totalPages <= 3) {
                pageToShow = i + 1;
              } else if (currentPage === 1) {
                pageToShow = i + 1;
              } else if (currentPage === totalPages) {
                pageToShow = totalPages - 2 + i;
              } else {
                pageToShow = currentPage - 1 + i;
              }

              return (
                <button
                  key={pageToShow}
                  onClick={() => setCurrentPage(pageToShow)}
                  className={`w-10 h-10 rounded-md ${
                    currentPage === pageToShow
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  } border border-gray-300`}
                >
                  {pageToShow}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } border border-gray-300`}
            >
              Next
            </button>
          </div>
        )}

        {/* Assign Judge Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Assign Judge to Case
                </h2>
                <button
                  onClick={closeAssignModal}
                  disabled={assignLoading}
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
                <p className="text-xs text-gray-500">ID: {selectedCase?.id}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Judge *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
                  value={selectedJudge}
                  onChange={(e) => setSelectedJudge(e.target.value)}
                  disabled={assignLoading}
                >
                  <option value="">-- Select a Judge --</option>
                  {judges.map((judge) => (
                    <option key={judge.id} value={judge.name}>
                      {judge.name}
                    </option>
                  ))}
                </select>
                {judges.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    No judges available
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeAssignModal}
                  disabled={assignLoading}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ease-in-out duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignJudge}
                  disabled={!selectedJudge || assignLoading}
                  className={`px-4 py-2 rounded-md ease-in-out duration-300 flex items-center ${
                    !selectedJudge || assignLoading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-tertiary text-white hover:bg-green-700"
                  }`}
                >
                  {assignLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Assigning...
                    </>
                  ) : (
                    "Assign Judge"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Change Status Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Change Case Status
                </h2>
                <button
                  onClick={closeStatusModal}
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
                <p className="text-xs text-gray-500">ID: {selectedCase?.id}</p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Status *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">-- Select Status --</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeStatusModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={!newStatus}
                  className={`px-4 py-2 rounded-md ease-in-out duration-300 ${
                    !newStatus
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-tertiary text-white hover:bg-green-700"
                  }`}
                >
                  Update Status
                </button>
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
      </AdminLayout>
    </section>
  );
};

export default AdminCases;
