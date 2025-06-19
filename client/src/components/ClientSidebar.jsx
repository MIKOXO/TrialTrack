// /* eslint-disable no-unused-vars */
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { notificationsAPI } from "../services/api";
import Logo from "./Logo.jsx";
import {
  FaHome,
  FaFolder,
  FaPlus,
  FaBell,
  FaCog,
  FaSignOutAlt,
  FaTimes,
  FaComments,
} from "react-icons/fa";

const ClientSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Refresh unread count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getNotifications();
      const notifications = Array.isArray(response.data)
        ? response.data
        : response.data.notifications || [];
      const unread = notifications.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Error fetching unread count:", err);
      // Don't show error to user for background fetch
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const menuItems = [
    {
      path: "/client/home",
      name: "Home",
      icon: <FaHome className="w-5 h-5" />,
    },
    {
      path: "/client/mycases",
      name: "My Cases",
      icon: <FaFolder className="w-5 h-5" />,
    },
    {
      path: "/client/newcase",
      name: "New Case",
      icon: <FaPlus className="w-5 h-5" />,
    },
    {
      path: "/client/notifications",
      name: "Notifications",
      icon: <FaBell className="w-5 h-5" />,
    },
    {
      path: "/client/feedback",
      name: "Feedback",
      icon: <FaComments className="w-5 h-5" />,
    },
    {
      path: "/client/settings",
      name: "Settings",
      icon: <FaCog className="w-5 h-5" />,
    },
  ];

  return (
    <section>
      <div className="h-screen bg-white shadow-lg w-64 fixed left-0 top-0 overflow-hidden">
        <div className="mt-4 flex flex-col items-start ml-5">
          <Logo className="mr-4" />
          <p className="font-Lexend text-2xl mt-3 text-gray-500 font-semibold">
            Litigant
          </p>
        </div>

        <nav className="mt-10">
          <ul>
            {menuItems.map((item, index) => {
              // Check if current path matches the menu item
              // Handle multi-page workflows where detail pages should highlight parent menu items
              const isActive = (() => {
                // Exact match for most pages
                if (currentPath === item.path) return true;

                // For "New Case", also match all sub-paths like /client/newcase/parties, etc.
                if (
                  item.path === "/client/newcase" &&
                  currentPath.startsWith("/client/newcase")
                ) {
                  return true;
                }

                // For "My Cases", also match case detail pages
                if (
                  item.path === "/client/mycases" &&
                  currentPath.startsWith("/client/case/")
                ) {
                  return true;
                }

                return false;
              })();

              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    className={`font-Lexend flex items-center mx-4 px-4 py-3 text-secondary rounded-lg hover:bg-green-50 hover:text-green-600 ease-in-out duration-300 ${
                      isActive
                        ? "bg-tertiary text-white mx-4 hover:bg-tertiary hover:text-white rounded-lg shadow-md"
                        : ""
                    }`}
                  >
                    <span className="mr-3 text-xl">{item.icon}</span>
                    {item.name}
                    {item.path === "/client/notifications" &&
                      unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                          {unreadCount}
                        </span>
                      )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="font-Lexend absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 ease-in-out duration-300 rounded-lg"
          >
            <FaSignOutAlt className="mr-3" />
            Log Out
          </button>
        </div>
      </div>
    </section>
  );
};

export default ClientSidebar;
