import { useState, useEffect } from "react";
import ClientLayout from "../../components/ClientLayout";
import { notificationsAPI } from "../../services/api";
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

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "read") return notification.read;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  //   if (loading) {
  //     return (
  //       <ClientLayout>
  //         <div className="flex justify-center items-center h-64">
  //           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
  //         </div>
  //       </ClientLayout>
  //     );
  //   }

  return (
    <ClientLayout>
      <div className="px-7 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 flex items-center">
              <FaBell className="mr-2 text-green-600" />
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </h1>
            <p className="text-gray-600">
              Stay updated on your case progress and important communications
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mx-7 mb-6 bg-tertiary bg-opacity-15 rounded-md shadow-md">
        <div className="flex border-b border-gray-200 p-2">
          <button
            onClick={() => setFilter("all")}
            className={`flex-1 py-5 px-4 text-center ${
              filter === "all"
                ? "bg-white rounded-lg text-green-600 font-medium"
                : " border-transparent text-gray-500"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`flex-1 py-5 px-4 text-center ${
              filter === "unread"
                ? "bg-white rounded-lg text-green-600 font-medium"
                : " border-transparent text-gray-500"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`flex-1 py-5 px-4 text-center ${
              filter === "read"
                ? "bg-white rounded-lg text-green-600 font-medium"
                : " border-transparent text-gray-500"
            }`}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4 px-7 py-4">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <FaBell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {filter === "unread"
                ? "No unread notifications"
                : filter === "read"
                ? "No read notifications"
                : "No notifications"}
            </h3>
            <p className="text-gray-500">
              {filter === "all"
                ? "You'll receive notifications about case updates, hearings, and important communications here."
                : `You have no ${filter} notifications at this time.`}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification._id}
              className={`bg-white rounded-lg shadow-sm border p-4 ${
                !notification.read
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
                <div className="flex items-start space-x-3 flex-1">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
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
                    <h3 className="text-sm font-medium text-gray-900 mb-1">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}{" "}
                        at{" "}
                        {new Date(notification.createdAt).toLocaleTimeString()}
                      </span>
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification._id)}
                          className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center"
                        >
                          <FaEye className="mr-1" />
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={async () => {
              // Mark all unread notifications as read
              const unreadNotifications = notifications.filter((n) => !n.read);
              for (const notification of unreadNotifications) {
                await markAsRead(notification._id);
              }
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm flex items-center"
            disabled={unreadCount === 0}
          >
            <FaCheckCircle className="mr-2" />
            Mark All as Read ({unreadCount})
          </button>
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={fetchNotifications}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh Notifications"}
        </button>
      </div>
    </ClientLayout>
  );
};

export default ClientNotifications;
