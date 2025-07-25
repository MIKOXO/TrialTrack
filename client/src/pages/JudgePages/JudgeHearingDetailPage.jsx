import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import JudgeLayout from "../../components/JudgeLayout";
import { JudgePageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUserTie,
  FaGavel,
  FaEdit,
  FaTrashAlt,
  FaFileAlt,
  FaStickyNote,
  FaExclamationTriangle,
} from "react-icons/fa";

const JudgeHearingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [hearing, setHearing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hearingDate, setHearingDate] = useState("");
  const [hearingTime, setHearingTime] = useState("");
  const [hearingLocation, setHearingLocation] = useState("");
  const [hearingNotes, setHearingNotes] = useState("");
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [addNoteLoading, setAddNoteLoading] = useState(false);

  // Fetch hearing data
  useEffect(() => {
    const fetchHearing = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch hearing details from the API
        const response = await axios.get(
          `http://localhost:3001/api/hearings/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const hearingData = response.data;

        // Transform backend data to match frontend structure
        const transformedHearing = {
          id: hearingData._id,
          caseTitle: hearingData.case?.title || "Unknown Case",
          caseNumber: hearingData._id.slice(-8).toUpperCase(),
          caseId: hearingData.case?._id || "",
          date: hearingData.date.split("T")[0], // Convert to YYYY-MM-DD format
          time: hearingData.time,
          location: hearingData.court?.name || "TBD",
          status:
            new Date(hearingData.date) > new Date() ? "Upcoming" : "Completed",
          parties: [], // Backend doesn't store parties separately
          notes: hearingData.notes || "",
          type: hearingData.case?.caseType
            ? hearingData.case.caseType === "smallClaims"
              ? "SmallClaims"
              : hearingData.case.caseType.charAt(0).toUpperCase() +
                hearingData.case.caseType.slice(1)
            : "General",
          documents: [], // TODO: Add when document system is implemented
          history: [], // TODO: Add when activity history is implemented
        };

        setHearing(transformedHearing);
        setHearingDate(transformedHearing.date);
        setHearingTime(transformedHearing.time);
        setHearingLocation(transformedHearing.location);
        setHearingNotes(transformedHearing.notes || "");

        setLoading(false);
      } catch (err) {
        console.error("Error fetching hearing:", err);
        if (err.response?.status === 404) {
          setError("Hearing not found");
        } else {
          setError("Failed to load hearing details. Please try again later.");
        }
        setLoading(false);
      }
    };

    fetchHearing();
  }, [id]);

  const handleEditHearing = async () => {
    if (!hearingDate || !hearingTime || !hearingLocation) return;

    try {
      setEditLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      const updateData = {
        date: hearingDate,
        time: hearingTime,
        notes: hearingNotes,
      };

      await axios.put(
        `http://localhost:3001/api/hearings/update/${hearing.id}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the hearing in local state
      setHearing({
        ...hearing,
        date: hearingDate,
        time: hearingTime,
        location: hearingLocation,
        notes: hearingNotes,
      });

      setShowEditModal(false);
      showSuccess("Hearing updated successfully!");
    } catch (err) {
      console.error("Error updating hearing:", err);
      showError(
        err.response?.data?.error ||
          "Failed to update hearing. Please try again."
      );
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteHearing = async () => {
    try {
      setDeleteLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        showError("Authentication token not found. Please sign in again.");
        return;
      }

      await axios.delete(`http://localhost:3001/api/hearings/${hearing.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setShowDeleteModal(false);
      showSuccess("Hearing deleted successfully!");

      // Navigate back to hearings list
      navigate("/judge/hearings");
    } catch (err) {
      console.error("Error deleting hearing:", err);
      showError(
        err.response?.data?.error ||
          "Failed to delete hearing. Please try again."
      );
      setShowDeleteModal(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    try {
      setAddNoteLoading(true);

      // Add note to hearing
      const updatedNotes = hearing.notes
        ? `${hearing.notes}\n\n${new Date().toLocaleDateString()}: ${newNote}`
        : `${new Date().toLocaleDateString()}: ${newNote}`;

      setHearing({
        ...hearing,
        notes: updatedNotes,
      });

      setHearingNotes(updatedNotes);
      setNewNote("");
      setShowAddNoteModal(false);

      // Show success message
      showSuccess("Note added successfully!");
    } catch (err) {
      showError("Failed to add note. Please try again.");
    } finally {
      setAddNoteLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <JudgeLayout>
        <JudgePageLoader message="Loading hearing details..." />
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

  if (!hearing) {
    return (
      <JudgeLayout>
        <div
          className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-3 md:px-4 py-3 rounded relative mx-4 md:mx-0"
          role="alert"
        >
          <strong className="font-bold">Not Found!</strong>
          <span className="block sm:inline">
            {" "}
            The requested hearing could not be found.
          </span>
        </div>
      </JudgeLayout>
    );
  }

  return (
    <JudgeLayout>
      <div className="mb-4 md:mb-6 px-4 md:px-0">
        <Link
          to="/judge/hearings"
          className="flex items-center text-green-600 hover:text-green-700 mb-4 text-sm md:text-base"
        >
          <FaArrowLeft className="mr-2" /> Back to Hearings
        </Link>
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-0">
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-semibold text-gray-800 break-words">
              {hearing.caseTitle}
            </h1>
            <p className="text-gray-600 text-sm md:text-base break-words">
              Case Number: {hearing.caseNumber}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium self-start md:self-auto flex-shrink-0 ${
              hearing.status === "Upcoming"
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-800"
            }`}
          >
            {hearing.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
        {/* Main Hearing Information */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-base md:text-lg font-medium mb-4">
              Hearing Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
              <div className="flex items-start md:items-center">
                <FaCalendarAlt className="text-gray-400 mr-2 md:mr-3 mt-1 md:mt-0 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-500">Date</p>
                  <p className="font-medium text-sm md:text-base break-words">
                    {formatDate(hearing.date)}
                  </p>
                </div>
              </div>

              <div className="flex items-start md:items-center">
                <FaClock className="text-gray-400 mr-2 md:mr-3 mt-1 md:mt-0 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-500">Time</p>
                  <p className="font-medium text-sm md:text-base">
                    {hearing.time}
                  </p>
                </div>
              </div>

              <div className="flex items-start md:items-center">
                <FaMapMarkerAlt className="text-gray-400 mr-2 md:mr-3 mt-1 md:mt-0 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs md:text-sm text-gray-500">Location</p>
                  <p className="font-medium text-sm md:text-base break-words">
                    {hearing.location}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 md:pt-4">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2 gap-2 sm:gap-0">
                <h3 className="font-medium text-sm md:text-base">Notes</h3>
                <button
                  onClick={() => setShowAddNoteModal(true)}
                  className="text-xs md:text-sm text-green-600 hover:text-green-700 flex items-center self-start sm:self-auto"
                >
                  <FaStickyNote className="mr-1" /> Add Note
                </button>
              </div>
              {hearing.notes ? (
                <p className="text-gray-600 whitespace-pre-line text-sm md:text-base break-words">
                  {hearing.notes}
                </p>
              ) : (
                <p className="text-gray-500 italic text-sm md:text-base">
                  No notes available
                </p>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-base md:text-lg font-medium mb-4">
              Related Documents
            </h2>

            {hearing.documents && hearing.documents.length > 0 ? (
              <div className="divide-y">
                {hearing.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0"
                  >
                    <div className="flex items-start sm:items-center min-w-0 flex-1">
                      <FaFileAlt className="text-gray-400 mr-2 md:mr-3 mt-1 sm:mt-0 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm md:text-base break-words">
                          {doc.name}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 break-words">
                          Uploaded by {doc.uploadedBy} on {doc.date}
                        </p>
                      </div>
                    </div>
                    <button className="text-green-600 hover:text-green-700 text-xs md:text-sm self-start sm:self-auto flex-shrink-0">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm md:text-base">
                No documents available
              </p>
            )}
          </div>

          {/* Activity History */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-base md:text-lg font-medium mb-4">
              Activity History
            </h2>

            {hearing.history && hearing.history.length > 0 ? (
              <div className="space-y-3 md:space-y-4">
                {hearing.history.map((item, index) => (
                  <div key={index} className="flex">
                    <div className="mr-3 md:mr-4 flex-shrink-0">
                      <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-green-500 mt-2 md:mt-1.5"></div>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm md:text-base break-words">
                        {item.action}
                      </p>
                      <p className="text-xs md:text-sm text-gray-500 break-words">
                        {item.date} by {item.by}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm md:text-base">
                No activity history available
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Actions */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h2 className="text-base md:text-lg font-medium mb-4">Actions</h2>

            <div className="space-y-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="w-full flex items-center justify-center px-3 md:px-4 py-2 bg-tertiary text-white rounded-md hover:bg-green-700 ease-in-out duration-300 text-sm md:text-base"
              >
                <FaEdit className="mr-2" /> Edit Hearing
              </button>

              <Link
                to={`/judge/cases/${hearing.caseId}`}
                className="w-full flex items-center justify-center px-3 md:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ease-in-out duration-300 text-sm md:text-base"
              >
                <FaFileAlt className="mr-2" /> View Case
              </Link>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full flex items-center justify-center px-3 md:px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ease-in-out duration-300 text-sm md:text-base"
              >
                <FaTrashAlt className="mr-2" /> Delete Hearing
              </button>
            </div>
          </div>

          {/* Parties */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Parties</h2>

            {hearing.parties && hearing.parties.length > 0 ? (
              <div className="space-y-3">
                {hearing.parties.map((party, index) => (
                  <div key={index} className="flex items-center">
                    <FaUserTie className="text-gray-400 mr-3" />
                    <span>{party}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 italic">No parties listed</p>
            )}
          </div>

          {/* Case Type */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-medium mb-4">Case Information</h2>

            <div className="space-y-3">
              <div className="flex items-center">
                <FaGavel className="text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Case Type</p>
                  <p className="font-medium">{hearing.type}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Hearing Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Edit Hearing
            </h2>
            <p className="mb-4 text-gray-600 text-sm md:text-base break-words">
              Update hearing details for case:{" "}
              <span className="font-medium">{hearing.caseTitle}</span>
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
                Location
              </label>
              <input
                type="text"
                placeholder="e.g., Courtroom 302"
                value={hearingLocation}
                onChange={(e) => setHearingLocation(e.target.value)}
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base"
              />
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
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ease-in-out duration-300 text-sm md:text-base order-2 md:order-1"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleEditHearing}
                loading={editLoading}
                loadingText="Updating..."
                className="w-full md:w-auto px-4 py-2 bg-tertiary text-white rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center justify-center text-sm md:text-base order-1 md:order-2"
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
            <div className="flex items-center mb-4 text-red-600">
              <FaExclamationTriangle className="text-lg md:text-2xl mr-2 flex-shrink-0" />
              <h2 className="text-lg md:text-xl font-semibold">
                Delete Hearing
              </h2>
            </div>
            <p className="mb-4 text-gray-600 text-sm md:text-base break-words">
              Are you sure you want to delete this hearing for case:{" "}
              <span className="font-medium">{hearing.caseTitle}</span>?
            </p>
            <p className="mb-4 md:mb-6 text-gray-600 text-sm md:text-base">
              This action cannot be undone.
            </p>

            <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ease-in-out duration-300 text-sm md:text-base order-2 md:order-1"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleDeleteHearing}
                loading={deleteLoading}
                loadingText="Deleting..."
                className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 ease-in-out duration-300 flex items-center justify-center text-sm md:text-base order-1 md:order-2"
              >
                <FaTrashAlt className="mr-2" />
                Delete
              </LoadingButton>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showAddNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Add Note</h2>
            <p className="mb-4 text-gray-600 text-sm md:text-base break-words">
              Add a note to this hearing for case:{" "}
              <span className="font-medium">{hearing.caseTitle}</span>
            </p>

            <div className="mb-4 md:mb-6">
              <label className="block text-gray-700 font-medium mb-2 text-sm md:text-base">
                Note
              </label>
              <textarea
                placeholder="Enter your note here..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows="4"
                className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 text-sm md:text-base resize-y"
              ></textarea>
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3">
              <button
                onClick={() => setShowAddNoteModal(false)}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 ease-in-out duration-300 text-sm md:text-base order-2 md:order-1"
              >
                Cancel
              </button>
              <LoadingButton
                onClick={handleAddNote}
                loading={addNoteLoading}
                loadingText="Adding..."
                className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 ease-in-out duration-300 flex items-center justify-center text-sm md:text-base order-1 md:order-2"
              >
                <FaStickyNote className="mr-2" />
                Add Note
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

export default JudgeHearingDetailPage;
