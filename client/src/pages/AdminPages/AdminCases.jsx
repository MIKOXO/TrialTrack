/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
// import axios from "axios";
import AdminLayout from "../../components/AdminLayout";
import { FaEllipsisV, FaSearch, FaUserPlus } from "react-icons/fa";

const AdminCases = () => {
  const [cases, setCases] = useState([
    {
      id: "C-2025-089",
      title: "Smith vs. Johnson",
      client: "Alice Smith",
      type: "Criminal",
      date: "Oct 15, 2025",
      status: "Active",
    },
    {
      id: "C-2025-065",
      title: "Wilson vs. Harvey",
      client: "Harvey Specter",
      type: "Civil",
      date: "Dec 25, 2025",
      status: "Pending",
    },
    {
      id: "C-2025-035",
      title: "Lewis Dispute",
      client: "David Lewis",
      type: "Civil",
      date: "Dec 12, 2025",
      status: "Urgent",
    },
    {
      id: "C-2025-090",
      title: "State vs. Thompson",
      client: "Dean T.",
      type: "Criminal",
      date: "Feb 05, 2025",
      status: "Closed",
    },
    {
      id: "C-2025-075",
      title: "John vs. Jane",
      client: "Jane Doe",
      type: "Civil",
      date: "Feb 05, 2025",
      status: "Urgent",
    },
    {
      id: "C-2025-085",
      title: "Alison vs. Miles",
      client: "Lewis Alison",
      type: "Criminal",
      date: "May 25, 2025",
      status: "Active",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [currentPage, setCurrentPage] = useState(1);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedCase, setSelectedCase] = useState(null);

  // Mock judges data
  const [judges, setJudges] = useState([
    { id: 1, name: "Hon. Reynolds" },
    { id: 2, name: "Hon. Thompson" },
    { id: 3, name: "Hon. Williams" },
    { id: 4, name: "Hon. Johnson" },
  ]);

  const [selectedJudge, setSelectedJudge] = useState("");

  // Filter cases based on search query, status, and type
  const filteredCases = cases.filter((caseItem) => {
    const matchesSearch =
      caseItem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "All Status" || caseItem.status === statusFilter;

    const matchesType =
      typeFilter === "All Types" || caseItem.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Pagination
  const casesPerPage = 10;
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);
  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);

  // Handle status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Closed":
        return "bg-green-100 text-green-800";
      case "Urgent":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Toggle action menu
  const toggleActionMenu = (caseId) => {
    if (actionMenuOpen === caseId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(caseId);
    }
  };

  // Open assign judge modal
  const openAssignModal = (caseItem) => {
    setSelectedCase(caseItem);
    setShowAssignModal(true);
    setActionMenuOpen(null);
  };

  // Handle judge assignment
  const handleAssignJudge = () => {
    if (!selectedCase || !selectedJudge) return;

    // In a real app, you would make an API call here
    console.log(`Assigning ${selectedJudge} to case ${selectedCase.id}`);

    // Update the case with the assigned judge
    const updatedCases = cases.map((caseItem) => {
      if (caseItem.id === selectedCase.id) {
        return {
          ...caseItem,
          assignedJudge: selectedJudge,
        };
      }
      return caseItem;
    });

    setCases(updatedCases);
    setShowAssignModal(false);
    setSelectedCase(null);
    setSelectedJudge("");
  };

  // Close any open menus when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActionMenuOpen(null);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

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
              {currentCases.map((caseItem) => (
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActionMenu(caseItem.id);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <FaEllipsisV />
                    </button>

                    {actionMenuOpen === caseItem.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openAssignModal(caseItem);
                            }}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaUserPlus className="mr-2" /> Assign to Judge
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Change Status
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Schedule Hearing
                          </button>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">
                Assign Judge to Case
              </h2>
              <p className="mb-4">
                Case: <span className="font-medium">{selectedCase?.title}</span>{" "}
                ({selectedCase?.id})
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Judge
                </label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={selectedJudge}
                  onChange={(e) => setSelectedJudge(e.target.value)}
                >
                  <option value="">-- Select a Judge --</option>
                  {judges.map((judge) => (
                    <option key={judge.id} value={judge.name}>
                      {judge.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignJudge}
                  disabled={!selectedJudge}
                  className={`px-4 py-2 rounded-md ${
                    !selectedJudge
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  Assign Judge
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </section>
  );
};

export default AdminCases;
