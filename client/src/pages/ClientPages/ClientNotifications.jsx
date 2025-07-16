import { useState, useEffect, useMemo } from "react";
import ClientLayout from "../../components/ClientLayout";
import { notificationsAPI } from "../../services/api";
import { ClientPageLoader } from "../../components/PageLoader";
import {
  FaBell,
  FaEnvelope,
  FaEnvelopeOpen,
  FaExclamationTriangle,
  FaInfoCircle,
  FaCheckCircle,
  FaTrash,
  FaEye,
  FaCalendarAlt,
  FaGavel,
} from "react-icons/fa";

const ClientNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread, read

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10); // Limit to 10 notifications per page

  // Deletion state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteMode, setBulkDeleteMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getNotifications();
      console.log("Fetched notifications:", response.data);
      // Handle both array response and object with data property
      const notificationsData = Array.isArray(response.data)
        ? response.data
        : response.data.notifications || [];
      setNotifications(notificationsData);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      if (err.response?.status === 401) {
        setError("Please sign in to view notifications");
      } else {
        setError("Failed to load notifications. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await notificationsAPI.markAsRead(notificationId);
      console.log("Marked as read:", response.data);

      // Update the local state to reflect the change
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      // Show user-friendly error message
      setError("Failed to mark notification as read. Please try again.");
      // Clear error after 3 seconds
      setTimeout(() => setError(""), 3000);
    }
  };

  // Delete single notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);

      // Remove from local state
      setNotifications((prev) =>
        prev.filter((notification) => notification._id !== notificationId)
      );

      // Close modal
      setShowDeleteModal(false);
      setNotificationToDelete(null);

      // Reset to first page if current page becomes empty
      const remainingNotifications = notifications.filter(
        (n) => n._id !== notificationId
      );
      const maxPage = Math.ceil(
        remainingNotifications.length / notificationsPerPage
      );
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (err) {
      console.error("Error deleting notification:", err);
      setError("Failed to delete notification. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Bulk delete notifications
  const handleBulkDelete = async () => {
    try {
      const selectedIds = notifications
        .filter((_, index) => selectedNotifications.includes(index))
        .map((notification) => notification._id);

      if (selectedIds.length === 0) {
        setError("Please select notifications to delete.");
        setTimeout(() => setError(""), 3000);
        return;
      }

      await notificationsAPI.bulkDeleteNotifications(selectedIds);

      // Remove from local state
      setNotifications((prev) =>
        prev.filter((notification) => !selectedIds.includes(notification._id))
      );

      // Reset selections and close modal
      setSelectedNotifications([]);
      setShowBulkDeleteModal(false);
      setBulkDeleteMode(false);

      // Reset to first page if needed
      const remainingNotifications = notifications.filter(
        (n) => !selectedIds.includes(n._id)
      );
      const maxPage = Math.ceil(
        remainingNotifications.length / notificationsPerPage
      );
      if (currentPage > maxPage && maxPage > 0) {
        setCurrentPage(maxPage);
      }
    } catch (err) {
      console.error("Error bulk deleting notifications:", err);
      setError("Failed to delete notifications. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  // Toggle notification selection for bulk operations
  const toggleNotificationSelection = (index) => {
    setSelectedNotifications((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Select all notifications on current page
  const selectAllOnPage = () => {
    const startIndex = (currentPage - 1) * notificationsPerPage;
    const endIndex = startIndex + notificationsPerPage;
    const pageIndices = [];

    for (
      let i = startIndex;
      i < Math.min(endIndex, filteredNotifications.length);
      i++
    ) {
      pageIndices.push(i);
    }

    const allSelected = pageIndices.every((index) =>
      selectedNotifications.includes(index)
    );

    if (allSelected) {
      // Deselect all on page
      setSelectedNotifications((prev) =>
        prev.filter((index) => !pageIndices.includes(index))
      );
    } else {
      // Select all on page
      setSelectedNotifications((prev) => [
        ...new Set([...prev, ...pageIndices]),
      ]);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "case_update":
        return <FaInfoCircle className="text-blue-500" />;
      case "hearing_scheduled":
        return <FaCalendarAlt className="text-green-600" />;
      case "case_closed":
        return <FaCheckCircle className="text-green-500" />;
      case "document_required":
        return <FaExclamationTriangle className="text-red-500" />;
      default:
        return <FaBell className="text-gray-500" />;
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case "case_update":
        return "Case Update";
      case "hearing_scheduled":
        return "Hearing Scheduled";
      case "case_closed":
        return "Case Closed";
      case "document_required":
        return "Document Required";
      default:
        return "Notification";
    }
  };

  // Memoized filtered notifications for better performance
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (filter === "unread") return !notification.read;
      if (filter === "read") return notification.read;
      return true;
    });
  }, [notifications, filter]);

  // Pagination logic
  const totalPages = Math.ceil(
    filteredNotifications.length / notificationsPerPage
  );
  const startIndex = (currentPage - 1) * notificationsPerPage;
  const endIndex = startIndex + notificationsPerPage;
  const currentNotifications = filteredNotifications.slice(
    startIndex,
    endIndex
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
    setSelectedNotifications([]);
  }, [filter]);

  // Pagination functions
  const goToPage = (page) => {
    setCurrentPage(page);
    setSelectedNotifications([]); // Clear selections when changing pages
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <ClientPageLoader message="Loading your notifications..." />
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="px-4 md:px-7 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
          <div>
            <h1 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center">
              <FaBell className="mr-2 text-green-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Stay updated on your case progress and important communications
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={() => setBulkDeleteMode(!bulkDeleteMode)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    bulkDeleteMode
                      ? "bg-red-100 text-red-700 hover:bg-red-200"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {bulkDeleteMode ? "Cancel Selection" : "Select Multiple"}
                </button>

                {bulkDeleteMode && (
                  <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                    <button
                      onClick={selectAllOnPage}
                      className="px-3 py-2 text-sm text-green-600 hover:text-green-800 font-medium"
                    >
                      {selectedNotifications.length ===
                      currentNotifications.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>

                    {selectedNotifications.length > 0 && (
                      <button
                        onClick={() => setShowBulkDeleteModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium flex items-center justify-center"
                      >
                        <FaTrash className="mr-2" />
                        Delete Selected ({selectedNotifications.length})
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mx-4 md:mx-7 mb-6 bg-tertiary bg-opacity-15 rounded-md shadow-md">
        <div className="flex border-b border-gray-200 p-2">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-3 md:py-5 px-2 md:px-4 text-center text-sm md:text-base ${
              filter === "all"
                ? "bg-white rounded-lg text-green-600 font-medium"
                : " border-transparent text-gray-500"
            }`}
          >
            <span className="hidden sm:inline">
              All ({notifications.length})
            </span>
            <span className="sm:hidden">All</span>
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`flex-1 py-3 md:py-5 px-2 md:px-4 text-center text-sm md:text-base ${
              filter === "unread"
                ? "bg-white rounded-lg text-green-600 font-medium"
                : " border-transparent text-gray-500"
            }`}
          >
            <span className="hidden sm:inline">Unread ({unreadCount})</span>
            <span className="sm:hidden">Unread</span>
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`flex-1 py-3 md:py-5 px-2 md:px-4 text-center text-sm md:text-base ${
              filter === "read"
                ? "bg-white rounded-lg text-green-600 font-medium"
                : " border-transparent text-gray-500"
            }`}
          >
            <span className="hidden sm:inline">
              Read ({notifications.length - unreadCount})
            </span>
            <span className="sm:hidden">Read</span>
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 px-4 md:px-7 py-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-8 md:py-12">
            <FaBell className="mx-auto h-10 md:h-12 w-10 md:w-12 text-gray-400 mb-4" />
            <h3 className="text-base md:text-lg font-medium text-gray-900 mb-2">
              {filter === "unread"
                ? "No unread notifications"
                : filter === "read"
                ? "No read notifications"
                : "No notifications"}
            </h3>
            <p className="text-gray-500 text-sm md:text-base px-4">
              {filter === "all"
                ? "You'll receive notifications about case updates, hearings, and important communications here."
                : `You have no ${filter} notifications at this time.`}
            </p>
          </div>
        ) : (
          currentNotifications.map((notification, index) => {
            const actualIndex = startIndex + index;
            return (
              <div
                key={notification._id}
                className={`bg-white rounded-lg shadow-sm border p-3 md:p-4 transition-all ${
                  selectedNotifications.includes(actualIndex)
                    ? "ring-2 ring-green-500 border-green-500"
                    : !notification.read
                    ? notification.type === "hearing_scheduled"
                      ? "border-l-4 border-l-green-600 bg-green-50"
                      : "border-l-4 border-l-green-500 bg-green-50"
                    : "border-gray-200"
                } ${
                  notification.type === "hearing_scheduled"
                    ? "ring-1 ring-green-200"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 md:space-x-3 flex-1">
                    {/* Selection checkbox */}
                    {bulkDeleteMode && (
                      <div className="flex-shrink-0 mt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(actualIndex)}
                          onChange={() =>
                            toggleNotificationSelection(actualIndex)
                          }
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                      </div>
                    )}

                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 md:gap-2 mb-1">
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded ${
                            notification.type === "hearing_scheduled"
                              ? "text-green-700 bg-green-100"
                              : "text-gray-500 bg-gray-100"
                          }`}
                        >
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        {!notification.read && (
                          <FaEnvelope className="text-green-500 text-xs" />
                        )}
                        {notification.type === "hearing_scheduled" && (
                          <span className="text-xs font-semibold text-green-600 bg-green-200 px-2 py-1 rounded-full">
                            IMPORTANT
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm md:text-base font-medium text-gray-900 mb-1">
                        {notification.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 break-words">
                        {notification.message}
                      </p>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-0">
                        <span className="text-xs text-gray-500">
                          <span className="hidden md:inline">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}{" "}
                            at{" "}
                            {new Date(
                              notification.createdAt
                            ).toLocaleTimeString()}
                          </span>
                          <span className="md:hidden">
                            {new Date(
                              notification.createdAt
                            ).toLocaleDateString()}
                          </span>
                        </span>
                        <div className="flex items-center space-x-2">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center transition-colors"
                            >
                              <FaEye className="mr-1" />
                              <span className="hidden sm:inline">
                                Mark as read
                              </span>
                              <span className="sm:hidden">Read</span>
                            </button>
                          )}

                          {!bulkDeleteMode && (
                            <button
                              onClick={() => {
                                setNotificationToDelete(notification);
                                setShowDeleteModal(true);
                              }}
                              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center transition-colors"
                              title="Delete notification"
                            >
                              <FaTrash className="mr-1" />
                              <span className="hidden sm:inline">Delete</span>
                              <span className="sm:hidden">Del</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 md:px-7 mt-6 md:mt-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
            <div className="flex items-center text-xs md:text-sm text-gray-500 order-2 md:order-1">
              <span className="hidden sm:inline">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredNotifications.length)} of{" "}
                {filteredNotifications.length} notifications
              </span>
              <span className="sm:hidden">
                {startIndex + 1}-
                {Math.min(endIndex, filteredNotifications.length)} of{" "}
                {filteredNotifications.length}
              </span>
            </div>

            <div className="flex items-center justify-center space-x-1 md:space-x-2 order-1 md:order-2">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first page, last page, current page, and pages around current page
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                            page === currentPage
                              ? "bg-green-600 text-white"
                              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-2 md:px-3 py-2 rounded-md text-xs md:text-sm font-medium transition-colors ${
                  currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {notifications.length > 0 && unreadCount > 0 && !bulkDeleteMode && (
        <div className="mt-6 md:mt-8 flex justify-center px-4 md:px-0">
          <button
            onClick={async () => {
              // Mark all unread notifications as read
              const unreadNotifications = notifications.filter((n) => !n.read);
              for (const notification of unreadNotifications) {
                await markAsRead(notification._id);
              }
            }}
            className="w-full md:w-auto px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center justify-center"
            disabled={unreadCount === 0}
          >
            <FaCheckCircle className="mr-2" />
            <span className="hidden sm:inline">
              Mark All as Read ({unreadCount})
            </span>
            <span className="sm:hidden">Mark All Read ({unreadCount})</span>
          </button>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-4 flex justify-center px-4 md:px-0">
        <button
          onClick={fetchNotifications}
          className="w-full md:w-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center justify-center"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Notifications"}
        </button>
      </div>

      {/* Delete Single Notification Modal */}
      {showDeleteModal && notificationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Delete Notification
            </h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this notification?
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <h3 className="font-medium text-gray-900 text-sm">
                {notificationToDelete.title}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {notificationToDelete.message}
              </p>
            </div>
            <p className="text-red-600 text-sm mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setNotificationToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handleDeleteNotification(notificationToDelete._id)
                }
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4 text-gray-900">
              Delete Multiple Notifications
            </h2>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete {selectedNotifications.length}{" "}
              selected notification
              {selectedNotifications.length !== 1 ? "s" : ""}?
            </p>
            <p className="text-red-600 text-sm mb-6">
              This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
              >
                <FaTrash className="mr-2" />
                Delete {selectedNotifications.length} Notification
                {selectedNotifications.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </ClientLayout>
  );
};

export default ClientNotifications;
