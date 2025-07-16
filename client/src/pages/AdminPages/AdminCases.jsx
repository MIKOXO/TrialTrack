/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { casesAPI, authAPI, documentsAPI } from "../../services/api";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import AdminLayout from "../../components/AdminLayout";
import { AdminPageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import { FormLoadingOverlay } from "../../components/LoadingOverlay";
import ResponsiveTable from "../../components/ResponsiveTable";
import {
  FaEllipsisV,
  FaSearch,
  FaUserPlus,
  FaEdit,
  FaCalendarAlt,
  FaUser,
  FaGavel,
  FaFileAlt,
  FaMapMarkerAlt,
  FaClock,
  FaExclamationTriangle,
  FaPhone,
  FaEnvelope,
  FaTimes,
  FaFolder,
  FaFolderOpen,
  FaDownload,
  FaEye,
  FaUpload,
  FaTrash,
  FaFilePdf,
  FaFileImage,
  FaFileWord,
} from "react-icons/fa";

const AdminCases = () => {
  const [cases, setCases] = useState([]);
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const dropdownRef = useRef(null);

  const [loading, setLoading] = useState(true);
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

  // Case Details Modal state
  const [showCaseDetailsModal, setShowCaseDetailsModal] = useState(false);
  const [selectedCaseDetails, setSelectedCaseDetails] = useState(null);

  // Documents Modal state
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [selectedCaseForDocs, setSelectedCaseForDocs] = useState(null);
  const [caseDocuments, setCaseDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Judges data from backend
  const [judges, setJudges] = useState([]);

  // Helper functions
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Open":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Table columns configuration
  const tableColumns = [
    {
      key: "title",
      header: "Title",
      mobileLabel: "Case",
      render: (value, row) => (
        <div className="flex flex-col md:flex-row md:items-center md:space-x-2 space-y-1 md:space-y-0">
          <span>{value}</span>
          <button
            onClick={() => openCaseDetailsModal(row)}
            className="text-green-600 hover:text-green-800 text-xs underline self-start"
            title="View Details"
          >
            View
          </button>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      mobileLabel: "Type",
    },
    {
      key: "date",
      header: "Date",
      mobileLabel: "Filed",
    },
    {
      key: "assignedJudge",
      header: "Assigned Judge",
      mobileLabel: "Judge",
      render: (value) => (
        <span
          className={`${
            value === "Not Assigned" ? "text-red-500 italic" : "text-gray-900"
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "documentCount",
      header: "Documents",
      mobileLabel: "Documents",
      render: (value, row) => (
        <button
          onClick={() => openDocumentsModal(row)}
          className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors"
          title="View Documents"
        >
          <FaFolder className="w-4 h-4" />
          <span className="font-medium">{value}</span>
          <span className="text-xs">docs</span>
        </button>
      ),
    },
    {
      key: "status",
      header: "Status",
      mobileLabel: "Status",
      render: (value) => (
        <span
          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
            value
          )}`}
        >
          {value}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      hideOnMobile: true,
      render: (value, row) => (
        <div className="relative inline-block text-left">
          <button
            data-action-button
            onClick={(e) => {
              e.stopPropagation();
              toggleActionMenu(row.id, e);
            }}
            className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200"
            title="Actions"
          >
            <FaEllipsisV />
          </button>
        </div>
      ),
    },
  ];

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

  // Case Details Modal functions
  const openCaseDetailsModal = (caseItem) => {
    setSelectedCaseDetails(caseItem);
    setShowCaseDetailsModal(true);
    setActionMenuOpen(null);
  };

  const closeCaseDetailsModal = () => {
    setShowCaseDetailsModal(false);
    setSelectedCaseDetails(null);
  };

  // Documents Modal functions
  const openDocumentsModal = async (caseItem) => {
    setSelectedCaseForDocs(caseItem);
    setShowDocumentsModal(true);
    setActionMenuOpen(null);

    // Fetch documents for this case
    try {
      setDocumentsLoading(true);
      const response = await documentsAPI.getCaseDocuments(caseItem.id);
      setCaseDocuments(response.data);
    } catch (error) {
      console.error("Error fetching case documents:", error);
      showError("Failed to load documents. Please try again.");
      setCaseDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const closeDocumentsModal = () => {
    setShowDocumentsModal(false);
    setSelectedCaseForDocs(null);
    setCaseDocuments([]);
  };

  // Handle document download
  const handleDownloadDocument = async (document) => {
    try {
      const response = await documentsAPI.downloadDocument(
        selectedCaseForDocs.id,
        document.name
      );

      // Create blob and download
      const blob = new Blob([response.data], { type: document.mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = document.originalName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(`Downloaded ${document.originalName}`);
    } catch (error) {
      console.error("Error downloading document:", error);
      showError("Failed to download document. Please try again.");
    }
  };

  // Handle document view
  const handleViewDocument = async (document) => {
    try {
      const response = await documentsAPI.viewDocument(
        selectedCaseForDocs.id,
        document.name
      );

      // Create blob URL and open in new tab
      const blob = new Blob([response.data], { type: document.mimeType });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");

      // Clean up the URL after a delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (error) {
      console.error("Error viewing document:", error);
      showError("Failed to view document. Please try again.");
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadLoading(true);
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append("documents", files[i]);
      }

      await documentsAPI.uploadDocuments(selectedCaseForDocs.id, formData);

      // Refresh documents list
      const response = await documentsAPI.getCaseDocuments(
        selectedCaseForDocs.id
      );
      setCaseDocuments(response.data);

      // Update document count in cases list
      const updatedCases = cases.map((c) =>
        c.id === selectedCaseForDocs.id
          ? { ...c, documentCount: response.data.length }
          : c
      );
      setCases(updatedCases);

      showSuccess(`Successfully uploaded ${files.length} document(s)`);

      // Reset file input
      event.target.value = "";
    } catch (error) {
      console.error("Error uploading documents:", error);
      showError("Failed to upload documents. Please try again.");
    } finally {
      setUploadLoading(false);
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

        // Fetch document counts for each case
        const casesWithDocCounts = await Promise.all(
          casesData.map(async (caseItem) => {
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

        // Transform cases data for display
        const transformedCases = casesWithDocCounts.map((caseItem) => ({
          id: caseItem._id,
          title: caseItem.title,
          description: caseItem.description,
          client: caseItem.client?.username || "Unknown Client",
          clientData: caseItem.client,
          type: caseItem.caseType
            ? caseItem.caseType === "smallClaims"
              ? "SmallClaims"
              : caseItem.caseType.charAt(0).toUpperCase() +
                caseItem.caseType.slice(1)
            : "General",
          date: new Date(caseItem.createdAt).toLocaleDateString(),
          status: caseItem.status,
          assignedJudge: caseItem.judge?.username || "Not Assigned",
          judgeData: caseItem.judge,
          priority: caseItem.priority || "Medium",
          court: caseItem.court || "Not Assigned",
          defendant: caseItem.defendant,
          plaintiff: caseItem.plaintiff,
          evidence: caseItem.evidence,
          reportDate: caseItem.reportDate,
          createdAt: caseItem.createdAt,
          documentCount: caseItem.documentCount || 0,
          rawData: caseItem, // Keep full case data for details view
        }));

        setCases(transformedCases);

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

    // Check if case already has a judge assigned
    if (caseItem.assignedJudge && caseItem.assignedJudge !== "Not Assigned") {
      showError(
        `This case is already assigned to Judge ${caseItem.assignedJudge}. Cases cannot be reassigned to a different judge.`
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
        if (showCaseDetailsModal) {
          closeCaseDetailsModal();
        }
        if (showDocumentsModal) {
          closeDocumentsModal();
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
  }, [
    showAssignModal,
    assignLoading,
    showStatusModal,
    showCaseDetailsModal,
    showDocumentsModal,
  ]);

  if (loading) {
    return (
      <AdminLayout>
        <AdminPageLoader message="Loading cases..." />
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
            <option>Open</option>
            <option>In Progress</option>
            <option>Closed</option>
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
            <option>SmallClaims</option>
            <option>Other</option>
          </select>
        </div>

        <div>
          {/* Cases Table */}
          <ResponsiveTable
            columns={tableColumns}
            data={currentCases}
            emptyMessage={
              cases.length === 0
                ? "Loading..."
                : "No cases found. Try adjusting your filters."
            }
            loading={false}
          />

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
                    return (
                      selectedCase?.status === "Closed" ||
                      (selectedCase?.assignedJudge &&
                        selectedCase?.assignedJudge !== "Not Assigned")
                    );
                  })()}
                  className={`flex items-center w-full text-left px-4 py-2 text-sm transition-colors ${(() => {
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    const isDisabled =
                      selectedCase?.status === "Closed" ||
                      (selectedCase?.assignedJudge &&
                        selectedCase?.assignedJudge !== "Not Assigned");
                    return isDisabled
                      ? "text-gray-400 cursor-not-allowed bg-gray-50"
                      : "text-gray-700 hover:bg-gray-100";
                  })()}`}
                  title={(() => {
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    if (selectedCase?.status === "Closed") {
                      return "Cannot assign judge to closed case";
                    }
                    if (
                      selectedCase?.assignedJudge &&
                      selectedCase?.assignedJudge !== "Not Assigned"
                    ) {
                      return `Case already assigned to ${selectedCase.assignedJudge}`;
                    }
                    return "Assign a judge to this case";
                  })()}
                >
                  <FaUserPlus
                    className={`mr-2 ${(() => {
                      const selectedCase = currentCases.find(
                        (c) => c.id === actionMenuOpen
                      );
                      const isDisabled =
                        selectedCase?.status === "Closed" ||
                        (selectedCase?.assignedJudge &&
                          selectedCase?.assignedJudge !== "Not Assigned");
                      return isDisabled ? "text-gray-400" : "text-green-600";
                    })()}`}
                  />
                  Assign to Judge
                  {(() => {
                    const selectedCase = currentCases.find(
                      (c) => c.id === actionMenuOpen
                    );
                    if (selectedCase?.status === "Closed") {
                      return (
                        <span className="ml-2 text-xs text-gray-400">
                          (Case Closed)
                        </span>
                      );
                    }
                    if (
                      selectedCase?.assignedJudge &&
                      selectedCase?.assignedJudge !== "Not Assigned"
                    ) {
                      return (
                        <span className="ml-2 text-xs text-gray-400">
                          (Already Assigned)
                        </span>
                      );
                    }
                    return null;
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
                        : "text-green-600";
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
          <FormLoadingOverlay
            isVisible={assignLoading}
            message="Assigning judge..."
          >
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                    Assign Judge to Case
                  </h2>
                  <button
                    onClick={closeAssignModal}
                    disabled={assignLoading}
                    className="text-gray-400 hover:text-gray-600 text-xl p-1"
                  >
                    ×
                  </button>
                </div>

                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">Case:</p>
                  <p className="font-medium text-gray-900 text-sm md:text-base break-words">
                    {selectedCase?.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {selectedCase?.id}
                  </p>
                </div>

                <div className="mb-4 md:mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Judge *
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
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

                <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3">
                  <button
                    onClick={closeAssignModal}
                    disabled={assignLoading}
                    className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed ease-in-out duration-300 text-sm md:text-base order-2 md:order-1"
                  >
                    Cancel
                  </button>
                  <LoadingButton
                    onClick={handleAssignJudge}
                    loading={assignLoading}
                    loadingText="Assigning..."
                    disabled={!selectedJudge}
                    className="w-full md:w-auto bg-tertiary text-white px-4 py-2 rounded-md text-sm md:text-base order-1 md:order-2"
                  >
                    Assign Judge
                  </LoadingButton>
                </div>
              </div>
            </div>
          </FormLoadingOverlay>
        )}

        {/* Change Status Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900">
                  Change Case Status
                </h2>
                <button
                  onClick={closeStatusModal}
                  className="text-gray-400 hover:text-gray-600 text-xl p-1"
                >
                  ×
                </button>
              </div>

              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">Case:</p>
                <p className="font-medium text-gray-900 text-sm md:text-base break-words">
                  {selectedCase?.title}
                </p>
                <p className="text-xs text-gray-500">ID: {selectedCase?.id}</p>
              </div>

              <div className="mb-4 md:mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Status *
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-tertiary focus:border-tertiary"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">-- Select Status --</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3">
                <button
                  onClick={closeStatusModal}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300 text-sm md:text-base order-2 md:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={!newStatus}
                  className={`w-full md:w-auto px-4 py-2 rounded-md ease-in-out duration-300 text-sm md:text-base order-1 md:order-2 ${
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

        {/* Case Details Modal */}
        {showCaseDetailsModal && selectedCaseDetails && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                <div className="min-w-0">
                  <h2 className="text-lg md:text-2xl font-semibold text-gray-900 break-words">
                    Case Details
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 break-words">
                    Case ID: {selectedCaseDetails.id}
                  </p>
                </div>
                <button
                  onClick={closeCaseDetailsModal}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 self-end md:self-auto flex-shrink-0"
                  title="Close"
                >
                  <FaTimes className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                {/* Basic Information */}
                <div className="bg-gray-50 rounded-lg p-3 md:p-4">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4 flex items-center">
                    <FaFileAlt className="mr-2 text-green-600 flex-shrink-0" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <p className="mt-1 text-sm text-gray-900 break-words">
                        {selectedCaseDetails.title}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCaseDetails.type}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <span
                        className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeClass(
                          selectedCaseDetails.status
                        )}`}
                      >
                        {selectedCaseDetails.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <span
                        className={`mt-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedCaseDetails.priority === "Urgent"
                            ? "bg-red-100 text-red-800"
                            : selectedCaseDetails.priority === "High"
                            ? "bg-orange-100 text-orange-800"
                            : selectedCaseDetails.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {selectedCaseDetails.priority}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Created Date
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCaseDetails.date}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Court
                      </label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedCaseDetails.court}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <p className="mt-1 text-sm text-gray-900 bg-white p-3 rounded border">
                      {selectedCaseDetails.description ||
                        "No description provided"}
                    </p>
                  </div>
                </div>

                {/* Parties Involved */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaUser className="mr-2 text-green-600" />
                    Parties Involved
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Information */}
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-3">Client</h4>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Name
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedCaseDetails.client}
                          </p>
                        </div>
                        {selectedCaseDetails.clientData?.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaEnvelope className="mr-2 w-3 h-3" />
                            {selectedCaseDetails.clientData.email}
                          </div>
                        )}
                        {selectedCaseDetails.clientData?.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaPhone className="mr-2 w-3 h-3" />
                            {selectedCaseDetails.clientData.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Defendant Information */}
                    <div className="bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Defendant
                      </h4>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Name
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedCaseDetails.defendant?.name ||
                              "Not specified"}
                          </p>
                        </div>
                        {selectedCaseDetails.defendant?.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaEnvelope className="mr-2 w-3 h-3" />
                            {selectedCaseDetails.defendant.email}
                          </div>
                        )}
                        {selectedCaseDetails.defendant?.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaPhone className="mr-2 w-3 h-3" />
                            {selectedCaseDetails.defendant.phone}
                          </div>
                        )}
                        {selectedCaseDetails.defendant?.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaMapMarkerAlt className="mr-2 w-3 h-3" />
                            {selectedCaseDetails.defendant.address}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Plaintiff Information (if exists) */}
                  {selectedCaseDetails.plaintiff?.name && (
                    <div className="mt-4 bg-white p-4 rounded border">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Plaintiff
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-500">
                            Name
                          </label>
                          <p className="text-sm text-gray-900">
                            {selectedCaseDetails.plaintiff.name}
                          </p>
                        </div>
                        {selectedCaseDetails.plaintiff.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaEnvelope className="mr-2 w-3 h-3" />
                            {selectedCaseDetails.plaintiff.email}
                          </div>
                        )}
                        {selectedCaseDetails.plaintiff.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaPhone className="mr-2 w-3 h-3" />
                            {selectedCaseDetails.plaintiff.phone}
                          </div>
                        )}
                        {selectedCaseDetails.plaintiff.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <FaMapMarkerAlt className="mr-2 w-3 h-3" />
                            {selectedCaseDetails.plaintiff.address}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Assignment Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <FaGavel className="mr-2 text-purple-600" />
                    Assignment Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Assigned Judge
                      </label>
                      <div className="mt-1 flex items-center space-x-2">
                        <p
                          className={`text-sm ${
                            selectedCaseDetails.assignedJudge === "Not Assigned"
                              ? "text-red-500 italic"
                              : "text-gray-900 font-medium"
                          }`}
                        >
                          {selectedCaseDetails.assignedJudge}
                        </p>
                        {selectedCaseDetails.assignedJudge &&
                          selectedCaseDetails.assignedJudge !==
                            "Not Assigned" && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FaGavel className="mr-1 w-3 h-3" />
                              Assigned
                            </span>
                          )}
                      </div>
                      {selectedCaseDetails.assignedJudge &&
                        selectedCaseDetails.assignedJudge !==
                          "Not Assigned" && (
                          <p className="mt-1 text-xs text-gray-500">
                            This case cannot be reassigned to another judge
                          </p>
                        )}
                    </div>
                    {selectedCaseDetails.judgeData?.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <FaEnvelope className="mr-2 w-3 h-3" />
                        {selectedCaseDetails.judgeData.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Evidence */}
                {selectedCaseDetails.evidence && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaExclamationTriangle className="mr-2 text-yellow-600" />
                      Evidence
                    </h3>
                    <div className="bg-white p-3 rounded border">
                      <p className="text-sm text-gray-900">
                        {selectedCaseDetails.evidence}
                      </p>
                    </div>
                  </div>
                )}

                {/* Report Date */}
                {selectedCaseDetails.reportDate && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaClock className="mr-2 text-green-600" />
                      Report Date
                    </h3>
                    <p className="text-sm text-gray-900">
                      {new Date(
                        selectedCaseDetails.reportDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-end gap-3 md:gap-3">
                <button
                  onClick={closeCaseDetailsModal}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-sm md:text-base order-3 md:order-1"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeCaseDetailsModal();
                    openAssignModal(selectedCaseDetails);
                  }}
                  disabled={
                    selectedCaseDetails.status === "Closed" ||
                    (selectedCaseDetails.assignedJudge &&
                      selectedCaseDetails.assignedJudge !== "Not Assigned")
                  }
                  className={`w-full md:w-auto px-4 py-2 rounded-md transition-colors text-sm md:text-base order-2 md:order-2 ${
                    selectedCaseDetails.status === "Closed" ||
                    (selectedCaseDetails.assignedJudge &&
                      selectedCaseDetails.assignedJudge !== "Not Assigned")
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                  title={
                    selectedCaseDetails.status === "Closed"
                      ? "Cannot assign judge to closed case"
                      : selectedCaseDetails.assignedJudge &&
                        selectedCaseDetails.assignedJudge !== "Not Assigned"
                      ? `Case already assigned to ${selectedCaseDetails.assignedJudge}`
                      : "Assign a judge to this case"
                  }
                >
                  {selectedCaseDetails.assignedJudge &&
                  selectedCaseDetails.assignedJudge !== "Not Assigned"
                    ? "Already Assigned"
                    : "Assign Judge"}
                </button>
                <button
                  onClick={() => {
                    closeCaseDetailsModal();
                    openStatusModal(selectedCaseDetails);
                  }}
                  disabled={selectedCaseDetails.status === "Closed"}
                  className={`w-full md:w-auto px-4 py-2 rounded-md transition-colors text-sm md:text-base order-1 md:order-3 ${
                    selectedCaseDetails.status === "Closed"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Change Status
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Documents Modal */}
        {showDocumentsModal && selectedCaseForDocs && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl">
              {/* Modal Header */}
              <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                <div className="min-w-0">
                  <h2 className="text-lg md:text-2xl font-semibold text-gray-900 flex items-center">
                    <FaFolderOpen className="mr-2 md:mr-3 text-green-600 flex-shrink-0" />
                    <span className="break-words">Case Documents</span>
                  </h2>
                  <p className="text-xs md:text-sm text-gray-600 mt-1 break-words">
                    {selectedCaseForDocs.title} - {caseDocuments.length}{" "}
                    document(s)
                  </p>
                </div>
                <button
                  onClick={closeDocumentsModal}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 self-end md:self-auto flex-shrink-0"
                  title="Close"
                >
                  <FaTimes className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              {/* Upload Section */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    Upload Documents
                  </h3>
                  <div className="flex items-center space-x-3">
                    <input
                      type="file"
                      multiple
                      onChange={handleDocumentUpload}
                      className="hidden"
                      id="document-upload"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                      disabled={uploadLoading}
                    />
                    <label
                      htmlFor="document-upload"
                      className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                        uploadLoading
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      <FaUpload className="mr-2 w-4 h-4" />
                      {uploadLoading ? "Uploading..." : "Upload Files"}
                    </label>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG, TXT
                </p>
              </div>

              {/* Documents List */}
              <div className="flex-1 overflow-y-auto p-6">
                {documentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                      <p className="text-gray-500 mt-4">Loading documents...</p>
                    </div>
                  </div>
                ) : caseDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FaFolder className="mx-auto w-16 h-16 text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">
                      No documents found
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Upload documents using the button above
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {caseDocuments.map((document) => (
                      <div
                        key={document._id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              {getFileIcon(document.mimeType)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {document.originalName}
                              </h4>
                              <p className="text-xs text-gray-500">
                                {document.type || "Document"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-gray-500">
                          <div className="flex justify-between">
                            <span>Size:</span>
                            <span>{formatFileSize(document.size)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Uploaded:</span>
                            <span>
                              {new Date(
                                document.uploadDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>By:</span>
                            <span>
                              {document.uploadedBy?.username || "Unknown"}
                            </span>
                          </div>
                        </div>

                        {document.description && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-600">
                              {document.description}
                            </p>
                          </div>
                        )}

                        <div className="mt-4 flex space-x-2">
                          <button
                            onClick={() => handleViewDocument(document)}
                            className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                          >
                            <FaEye className="mr-1 w-3 h-3" />
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadDocument(document)}
                            className="flex-1 flex items-center justify-center px-3 py-2 text-xs font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                          >
                            <FaDownload className="mr-1 w-3 h-3" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 border-t border-gray-200 px-4 md:px-6 py-4 flex justify-end">
                <button
                  onClick={closeDocumentsModal}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors text-sm md:text-base"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>

      {/* Toast Container */}
      <ToastContainer
        toasts={toasts}
        onRemoveToast={removeToast}
        position="admin-top-right"
      />
    </section>
  );
};

export default AdminCases;
