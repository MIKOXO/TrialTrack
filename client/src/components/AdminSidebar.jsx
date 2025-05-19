import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFolder,
  FaUsers,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaGavel,
} from "react-icons/fa";
import Logo from "./Logo";

const AdminSidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const menuItems = [
    {
      path: "/admin/home",
      name: "Home",
      icon: <FaHome className="w-5 h-5" />,
    },
    {
      path: "/admin/cases",
      name: "Cases",
      icon: <FaFolder className="w-5 h-5" />,
    },
    {
      path: "/admin/users",
      name: "Clients",
      icon: <FaUsers className="w-5 h-5" />,
    },
    {
      path: "/admin/calendar",
      name: "Calendar",
      icon: <FaCalendarAlt className="w-5 h-5" />,
    },
    {
      path: "/admin/reports",
      name: "Reports",
      icon: <FaChartBar className="w-5 h-5" />,
    },
    {
      path: "/admin/settings",
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
            Admin
          </p>
        </div>

        <nav className="mt-10">
          <ul>
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`font-Lexend flex items-center mx-4 px-4 py-3 text-secondary rounded-lg hover:bg-green-50 hover:text-green-600 ease-in-out duration-300 ${
                    currentPath === item.path
                      ? "bg-tertiary text-white mx-4 hover:bg-tertiary hover:text-white rounded-lg shadow-md"
                      : ""
                  }`}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            ))}
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

export default AdminSidebar;
