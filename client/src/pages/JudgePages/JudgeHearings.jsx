import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JudgeLayout from "../../components/JudgeLayout";
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

const JudgeHearings = () => {
  const [hearings, setHearings] = useState([
    {
      id: 1,
      caseTitle: "Smith vs. Johnson",
      caseNumber: "C-2023-089",
      caseId: 1,
      date: "2023-11-20",
      time: "10:00",
      location: "Courtroom 302",
      status: "Upcoming",
      parties: ["John Smith", "Robert Johnson"],
      notes: "Initial hearing for criminal case",
      type: "Criminal",
    },
    {
      id: 2,
      caseTitle: "Wilson vs. Harvey",
      caseNumber: "C-2023-065",
      caseId: 2,
      date: "2023-12-05",
      time: "14:30",
      location: "Courtroom 201",
      status: "Upcoming",
      parties: ["James Wilson", "Thomas Harvey"],
      notes: "Preliminary hearing for civil dispute",
      type: "Civil",
    },
    {
      id: 3,
      caseTitle: "Lewis Dispute",
      caseNumber: "C-2023-035",
      caseId: 3,
      date: "2023-12-15",
      time: "09:00",
      location: "Courtroom 105",
      status: "Upcoming",
      parties: ["Sarah Lewis", "Michael Lewis"],
      notes: "Property division hearing",
      type: "Civil",
    },
    {
      id: 4,
      caseTitle: "State vs. Thompson",
      caseNumber: "C-2023-090",
      caseId: 4,
      date: "2023-10-15",
      time: "11:00",
      location: "Courtroom 302",
      status: "Completed",
      parties: ["State", "James Thompson"],
      notes: "Case dismissed",
      type: "Criminal",
    },
    {
      id: 5,
      caseTitle: "John vs. Jane",
      caseNumber: "C-2023-075",
      caseId: 5,
      date: "2023-11-10",
      time: "13:00",
      location: "Courtroom 201",
      status: "Completed",
      parties: ["John Doe", "Jane Doe"],
      notes: "Custody hearing",
      type: "Civil",
    },
  ]);

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
        // In a real application, we would fetch data from the API
        // For now, we're using the mock data defined above
        setFilteredHearings(hearings);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching hearings:", err);
        setError("Failed to load hearings. Please try again later.");
        setLoading(false);
      }
    };

    fetchHearings();
  }, [hearings]);

  const handleActionClick = (hearingId) => {
    if (actionMenuOpen === hearingId) {
      setActionMenuOpen(null);
    } else {
      setActionMenuOpen(hearingId);
    }
  };

  const openEditModal = (hearing) => {
    setSelectedHearing(hearing);
    setHearingDate(hearing.date);
    setHearingTime(hearing.time);
    setHearingLocation(hearing.location);
    setHearingNotes(hearing.notes || "");
    setShowEditModal(true);
    setActionMenuOpen(null);
  };

  const openDeleteModal = (hearing) => {
    setSelectedHearing(hearing);
    setShowDeleteModal(true);
    setActionMenuOpen(null);
  };

  const handleEditHearing = () => {
    if (!selectedHearing || !hearingDate || !hearingTime || !hearingLocation)
      return;

    // Update the hearing
    const updatedHearings = hearings.map((hearing) => {
      if (hearing.id === selectedHearing.id) {
        return {
          ...hearing,
          date: hearingDate,
          time: hearingTime,
          location: hearingLocation,
          notes: hearingNotes,
        };
      }
      return hearing;
    });

    setHearings(updatedHearings);
    setShowEditModal(false);

    // Show success message
    alert(`Hearing updated successfully`);
  };

  const handleDeleteHearing = () => {
    if (!selectedHearing) return;

    // Delete the hearing
    const updatedHearings = hearings.filter(
      (hearing) => hearing.id !== selectedHearing.id
    );

    setHearings(updatedHearings);
    setShowDeleteModal(false);

    // Show success message
    alert(`Hearing deleted successfully`);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <section>
      <JudgeLayout>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">Hearings</h1>
          <p className="text-gray-600">
            View and manage all scheduled court hearings
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 w-[585px] rounded-lg shadow-md bg-tertiary bg-opacity-15">
          <div className="flex border-b p-2">
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "all"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("all")}
            >
              All Hearings
            </button>
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "today"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("today")}
            >
              Today
            </button>
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "upcoming"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("upcoming")}
            >
              Upcoming
            </button>
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "completed"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("completed")}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search Hearings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-4 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Hearings List */}
        {filteredHearings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              No Hearings Found
            </h2>
            <p className="text-gray-500 mb-6">
              No hearings match your search criteria.
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
          <div className="space-y-4">
            {filteredHearings.map((hearing) => (
              <div
                key={hearing.id}
                className="bg-white rounded-lg shadow-sm p-4"
              >
                <div className="flex justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900 text-lg">
                        {hearing.caseTitle}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          hearing.status === "Upcoming"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {hearing.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {hearing.caseNumber}
                    </p>

                    <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCalendarAlt className="text-gray-400 mr-2" />
                        <span>{formatDate(hearing.date)}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="text-gray-400 mr-2" />
                        <span>{hearing.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaMapMarkerAlt className="text-gray-400 mr-2" />
                        <span>{hearing.location}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-sm text-gray-500 font-medium">
                        Parties:
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {hearing.parties.map((party, index) => (
                          <div
                            key={index}
                            className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded"
                          >
                            <FaUserTie className="text-gray-400 mr-1" />
                            <span>{party}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {hearing.notes && (
                      <div className="mt-3">
                        <div className="text-sm text-gray-500 font-medium">
                          Notes:
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {hearing.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4 relative">
                    <button
                      onClick={() => handleActionClick(hearing.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaEllipsisH />
                    </button>

                    {actionMenuOpen === hearing.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <div className="py-1">
                          <button
                            onClick={() => openEditModal(hearing)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaEdit className="mr-2" /> Edit Hearing
                          </button>
                          <button
                            onClick={() => openDeleteModal(hearing)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <FaTrashAlt className="mr-2" /> Delete Hearing
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Edit Hearing</h2>
              <p className="mb-4 text-gray-600">
                Update hearing details for case:{" "}
                <span className="font-medium">
                  {selectedHearing?.caseTitle}
                </span>
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

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Notes
                </label>
                <textarea
                  placeholder="Add any notes about this hearing"
                  value={hearingNotes}
                  onChange={(e) => setHearingNotes(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                ></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditHearing}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Update Hearing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Hearing Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Delete Hearing</h2>
              <p className="mb-4 text-gray-600">
                Are you sure you want to delete this hearing for case:{" "}
                <span className="font-medium">
                  {selectedHearing?.caseTitle}
                </span>
                ?
              </p>
              <p className="mb-4 text-gray-600">
                This action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteHearing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </JudgeLayout>
    </section>
  );
};

export default JudgeHearings;
