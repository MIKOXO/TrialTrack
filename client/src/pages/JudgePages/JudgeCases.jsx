/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import JudgeLayout from "../../components/JudgeLayout";
import { FaSearch, FaEllipsisH } from "react-icons/fa";
import { Link } from "react-router-dom";

const JudgeCases = () => {
  const [cases, setCases] = useState([
    {
      id: 1,
      title: "Smith vs. Johnson",
      caseNumber: "C-2023-089",
      type: "Criminal",
      status: "Active",
      date: "Oct 15, 2023",
      scheduledHearing: null,
    },
    {
      id: 2,
      title: "Wilson vs. Harvey",
      caseNumber: "C-2023-065",
      type: "Civil",
      status: "Pending",
      date: "Dec 25, 2023",
      scheduledHearing: null,
    },
    {
      id: 3,
      title: "Lewis Dispute",
      caseNumber: "C-2023-035",
      type: "Civil",
      status: "Urgent",
      date: "Dec 12, 2023",
      scheduledHearing: {
        date: "2023-12-15",
        time: "10:00",
        location: "Courtroom 302",
      },
    },
    {
      id: 4,
      title: "State vs. Thompson",
      caseNumber: "C-2023-090",
      type: "Criminal",
      status: "Closed",
      date: "Feb 05, 2023",
      scheduledHearing: null,
    },
    {
      id: 5,
      title: "John vs. Jane",
      caseNumber: "C-2023-075",
      type: "Civil",
      status: "Urgent",
      date: "Feb 05, 2023",
      scheduledHearing: {
        date: "2023-11-20",
        time: "14:30",
        location: "Courtroom 201",
      },
    },
    {
      id: 6,
      title: "Alison vs. Miles",
      caseNumber: "C-2023-085",
      type: "Criminal",
      status: "Active",
      date: "May 25, 2023",
      scheduledHearing: null,
    },
  ]);

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
  const [hearingLocation, setHearingLocation] = useState("");

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
          caseItem.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply tab filter
    if (activeTab !== "all") {
      if (activeTab === "scheduled") {
        // Show cases with scheduled hearings
        filtered = filtered.filter(
          (caseItem) => caseItem.scheduledHearing !== null
        );
      } else if (activeTab === "open") {
        // Show active and pending cases
        filtered = filtered.filter(
          (caseItem) =>
            caseItem.status.toLowerCase() === "active" ||
            caseItem.status.toLowerCase() === "pending" ||
            caseItem.status.toLowerCase() === "urgent"
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

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        // In a real application, we would fetch data from the API
        // For now, we're using the mock data defined above
        setFilteredCases(cases);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError("Failed to load cases. Please try again later.");
        setLoading(false);
      }
    };

    fetchCases();
  }, [cases]);

  const handleActionClick = (caseId) => {
    if (actionMenuOpen === caseId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(caseId);
    }
  };

  const openStatusModal = (caseItem) => {
    setSelectedCase(caseItem);
    setNewStatus(caseItem.status);
    setShowStatusModal(true);
    setActionMenuOpen(null);
  };

  const openHearingModal = (caseItem) => {
    setSelectedCase(caseItem);
    setHearingDate("");
    setHearingTime("");
    setHearingLocation("");
    setShowHearingModal(true);
    setActionMenuOpen(null);
  };

  const handleStatusChange = () => {
    if (!selectedCase || !newStatus) return;

    // Update the case status
    const updatedCases = cases.map((caseItem) => {
      if (caseItem.id === selectedCase.id) {
        return { ...caseItem, status: newStatus };
      }
      return caseItem;
    });

    setCases(updatedCases);
    setShowStatusModal(false);
  };

  const handleScheduleHearing = () => {
    if (!selectedCase || !hearingDate || !hearingTime || !hearingLocation)
      return;

    // Update the case with the scheduled hearing
    const updatedCases = cases.map((caseItem) => {
      if (caseItem.id === selectedCase.id) {
        return {
          ...caseItem,
          scheduledHearing: {
            date: hearingDate,
            time: hearingTime,
            location: hearingLocation,
          },
        };
      }
      return caseItem;
    });

    setCases(updatedCases);

    // Show success message
    alert(
      `Hearing scheduled for ${selectedCase.title} on ${hearingDate} at ${hearingTime} in ${hearingLocation}`
    );

    setShowHearingModal(false);

    // Switch to the scheduled tab to show the newly scheduled case
    setActiveTab("scheduled");
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "urgent":
        return "bg-red-100 text-red-800";
      case "closed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <section>
      <JudgeLayout>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Cases</h1>
          <p className="text-gray-600">View and Manage all your court cases</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 w-[523px] rounded-lg shadow-md bg-tertiary bg-opacity-15">
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
              No Cases Found
            </h2>
            <p className="text-gray-500 mb-6">
              No cases match your search criteria.
            </p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSearchTerm("");
              }}
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors inline-block"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Case ID
                  </th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {caseItem.caseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        {caseItem.title}
                        {caseItem.scheduledHearing && (
                          <span
                            className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full cursor-help"
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
                      <button
                        onClick={() => handleActionClick(caseItem.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <FaEllipsisH />
                      </button>

                      {actionMenuOpen === caseItem.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                          <div className="py-1">
                            <button
                              onClick={() => openStatusModal(caseItem)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Change Status
                            </button>
                            <button
                              onClick={() => openHearingModal(caseItem)}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              Schedule Hearing
                            </button>
                            <Link
                              to={`/judge/cases/${caseItem.id}`}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              View Details
                            </Link>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Status Change Modal */}
        {showStatusModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Change Case Status</h2>
              <p className="mb-4 text-gray-600">
                Update the status for case:{" "}
                <span className="font-medium">{selectedCase?.title}</span>
              </p>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Update Status
                </button>
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
                <span className="font-medium">{selectedCase?.title}</span>
              </p>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={hearingDate}
                  onChange={(e) => setHearingDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Time
                </label>
                <input
                  type="time"
                  value={hearingTime}
                  onChange={(e) => setHearingTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., Courtroom 302"
                  value={hearingLocation}
                  onChange={(e) => setHearingLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowHearingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScheduleHearing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </JudgeLayout>
    </section>
  );
};

export default JudgeCases;
