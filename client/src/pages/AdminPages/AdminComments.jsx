import { useState, useEffect } from "react";
import { commentsAPI } from "../../services/api";
import AdminLayout from "../../components/AdminLayout";
import { AdminPageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import {
  FaComments,
  FaStar,
  FaRegStar,
  FaEye,
  FaCheck,
  FaTimes,
  FaFilter,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedComment, setSelectedComment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({});
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [filters]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentsAPI.getComments(filters);
      setComments(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError("Failed to fetch comments");
      console.error("Error fetching comments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await commentsAPI.getCommentStats();
      setStats(response.data.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const handleStatusFilter = (status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status === status ? "" : status,
      page: 1,
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const handleViewComment = (comment) => {
    setSelectedComment(comment);
    setShowModal(true);
  };

  const handleUpdateStatus = async (status, adminNotes = "") => {
    if (!selectedComment) return;

    try {
      setUpdating(true);
      await commentsAPI.updateCommentStatus(selectedComment._id, {
        status,
        adminNotes,
      });

      // Refresh comments and stats
      await fetchComments();
      await fetchStats();

      setShowModal(false);
      setSelectedComment(null);
    } catch (err) {
      setError("Failed to update comment status");
      console.error("Error updating status:", err);
    } finally {
      setUpdating(false);
    }
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-400">No rating</span>;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="text-yellow-400">
          {i <= rating ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    return <div className="flex items-center">{stars}</div>;
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      New: "bg-blue-100 text-blue-800",
      Reviewed: "bg-yellow-100 text-yellow-800",
      Resolved: "bg-green-100 text-green-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <AdminLayout>
      <div className="">
        <div className="mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-gray-800">
              Client Comments & Feedback
            </h1>
            <p className="text-gray-600 font-light">
              Manage and respond to client feedback about the system.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <FaComments className="text-blue-500 text-2xl mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Comments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-blue-100 rounded-full p-2 mr-3">
                  <span className="text-blue-600 font-bold">NEW</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">New</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.byStatus?.New || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-yellow-100 rounded-full p-2 mr-3">
                  <FaEye className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Reviewed</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.byStatus?.Reviewed || 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center">
                <div className="bg-green-100 rounded-full p-2 mr-3">
                  <FaCheck className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.byStatus?.Resolved || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Average Rating */}
          {stats.averageRating > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="flex items-center">
                <FaStar className="text-yellow-400 text-xl mr-2" />
                <span className="text-lg font-medium text-gray-900">
                  Average Rating: {stats.averageRating.toFixed(1)} / 5.0
                </span>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center space-x-4">
              <FaFilter className="text-gray-500" />
              <span className="font-medium text-gray-700">
                Filter by status:
              </span>
              <button
                onClick={() => handleStatusFilter("New")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.status === "New"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                New
              </button>
              <button
                onClick={() => handleStatusFilter("Reviewed")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.status === "Reviewed"
                    ? "bg-yellow-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Reviewed
              </button>
              <button
                onClick={() => handleStatusFilter("Resolved")}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filters.status === "Resolved"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Resolved
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Comments Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="p-8">
                <AdminPageLoader message="Loading comments..." />
              </div>
            ) : comments.length === 0 ? (
              <div className="p-8 text-center">
                <FaComments className="text-gray-400 text-4xl mx-auto mb-4" />
                <p className="text-gray-600">No comments found.</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subject
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {comments.map((comment) => (
                        <tr key={comment._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {comment.user?.firstName &&
                                comment.user?.lastName
                                  ? `${comment.user.firstName} ${comment.user.lastName}`
                                  : comment.user?.username || "Unknown User"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {comment.user?.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate">
                              {comment.subject}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {renderStars(comment.rating)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(comment.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewComment(comment)}
                              className="text-green-600 hover:text-green-900 flex items-center"
                            >
                              <FaEye className="mr-1" />
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage - 1)
                        }
                        disabled={!pagination.hasPrev}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          handlePageChange(pagination.currentPage + 1)
                        }
                        disabled={!pagination.hasNext}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing{" "}
                          <span className="font-medium">
                            {(pagination.currentPage - 1) * filters.limit + 1}
                          </span>{" "}
                          to{" "}
                          <span className="font-medium">
                            {Math.min(
                              pagination.currentPage * filters.limit,
                              pagination.totalComments
                            )}
                          </span>{" "}
                          of{" "}
                          <span className="font-medium">
                            {pagination.totalComments}
                          </span>{" "}
                          results
                        </p>
                      </div>
                      <div>
                        <nav
                          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                          aria-label="Pagination"
                        >
                          <button
                            onClick={() =>
                              handlePageChange(pagination.currentPage - 1)
                            }
                            disabled={!pagination.hasPrev}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaChevronLeft className="h-3 w-3" />
                          </button>
                          <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                            Page {pagination.currentPage} of{" "}
                            {pagination.totalPages}
                          </span>
                          <button
                            onClick={() =>
                              handlePageChange(pagination.currentPage + 1)
                            }
                            disabled={!pagination.hasNext}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaChevronRight className="h-3 w-3" />
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comment Detail Modal */}
      {showModal && selectedComment && (
        <CommentModal
          comment={selectedComment}
          onClose={() => {
            setShowModal(false);
            setSelectedComment(null);
          }}
          onUpdateStatus={handleUpdateStatus}
          updating={updating}
        />
      )}
    </AdminLayout>
  );
};

// Comment Modal Component
const CommentModal = ({ comment, onClose, onUpdateStatus, updating }) => {
  const [adminNotes, setAdminNotes] = useState(comment.adminNotes || "");

  const renderStars = (rating) => {
    if (!rating)
      return <span className="text-gray-400">No rating provided</span>;

    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className="text-yellow-400 text-lg">
          {i <= rating ? <FaStar /> : <FaRegStar />}
        </span>
      );
    }
    return <div className="flex items-center">{stars}</div>;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Comment Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          {/* Comment Content */}
          <div className="space-y-4">
            {/* Client Info */}
            <div>
              <h4 className="font-medium text-gray-900">Client Information</h4>
              <p className="text-gray-600">
                {comment.user?.firstName && comment.user?.lastName
                  ? `${comment.user.firstName} ${comment.user.lastName}`
                  : comment.user?.username || "Unknown User"}
              </p>
              <p className="text-sm text-gray-500">{comment.user?.email}</p>
            </div>

            {/* Subject */}
            <div>
              <h4 className="font-medium text-gray-900">Subject</h4>
              <p className="text-gray-600">{comment.subject}</p>
            </div>

            {/* Rating */}
            <div>
              <h4 className="font-medium text-gray-900">Rating</h4>
              {renderStars(comment.rating)}
            </div>

            {/* Message */}
            <div>
              <h4 className="font-medium text-gray-900">Message</h4>
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {comment.message}
                </p>
              </div>
            </div>

            {/* Current Status */}
            <div>
              <h4 className="font-medium text-gray-900">Current Status</h4>
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  comment.status === "New"
                    ? "bg-blue-100 text-blue-800"
                    : comment.status === "Reviewed"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {comment.status}
              </span>
            </div>

            {/* Admin Notes */}
            <div>
              <h4 className="font-medium text-gray-900">Admin Notes</h4>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
                placeholder="Add notes about this comment..."
              />
            </div>

            {/* Date */}
            <div>
              <h4 className="font-medium text-gray-900">Submitted</h4>
              <p className="text-gray-600">
                {new Date(comment.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Close
            </button>
            {comment.status !== "Reviewed" && (
              <LoadingButton
                onClick={() => onUpdateStatus("Reviewed", adminNotes)}
                loading={updating}
                loadingText="Updating..."
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Mark as Reviewed
              </LoadingButton>
            )}
            {comment.status !== "Resolved" && (
              <LoadingButton
                onClick={() => onUpdateStatus("Resolved", adminNotes)}
                loading={updating}
                loadingText="Updating..."
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Mark as Resolved
              </LoadingButton>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComments;
