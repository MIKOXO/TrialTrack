import { Link, useLocation } from "react-router-dom";
import {
  FaHome,
  FaFolder,
  FaCalendarAlt,
  FaGavel,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import Logo from "./Logo";

const JudgeSidebar = ({ closeSidebar }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const menuItems = [
    {
      path: "/judge/home",
      name: "Home",
      icon: <FaHome className="w-5 h-5" />,
    },
    {
      path: "/judge/cases",
      name: "Cases",
      icon: <FaFolder className="w-5 h-5" />,
    },
    {
      path: "/judge/hearings",
      name: "Hearings",
      icon: <FaGavel className="w-5 h-5" />,
    },
    {
      path: "/judge/calendar",
      name: "Calendar",
      icon: <FaCalendarAlt className="w-5 h-5" />,
    },
    {
      path: "/judge/settings",
      name: "Settings",
      icon: <FaCog className="w-5 h-5" />,
    },
  ];

  return (
    <section>
      <div className="h-full md:h-screen bg-white shadow-lg w-full overflow-hidden pointer-events-auto flex flex-col">
        <div className="mt-4 flex flex-col items-start ml-5">
          <Logo className="mr-4" />
          <p className="font-Lexend text-2xl mt-3 text-gray-500 font-semibold">
            Judge
          </p>
        </div>

        <nav className="mt-10 flex-1 overflow-y-auto">
          <ul>
            {menuItems.map((item, index) => {
              // Check if current path matches the menu item
              // Handle multi-page workflows where detail pages should highlight parent menu items
              const isActive = (() => {
                // Exact match for most pages
                if (currentPath === item.path) return true;

                // For Cases menu item, also match case detail pages
                if (
                  item.path === "/judge/cases" &&
                  currentPath.startsWith("/judge/cases/")
                ) {
                  return true;
                }

                // For Hearings menu item, also match hearing detail pages
                if (
                  item.path === "/judge/hearings" &&
                  currentPath.startsWith("/judge/hearings/")
                ) {
                  return true;
                }

                return false;
              })();

              return (
                <li key={index}>
                  <Link
                    to={item.path}
                    onClick={() => closeSidebar && closeSidebar()}
                    className={`font-Lexend flex items-center mx-4 px-4 py-3 text-secondary rounded-lg hover:bg-green-50 hover:text-green-600 ease-in-out duration-300 ${
                      isActive
                        ? "bg-tertiary text-white mx-4 hover:bg-tertiary hover:text-white rounded-lg shadow-md"
                        : ""
                    }`}
                  >
                    <span className="mr-3 text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="font-Lexend p-4 border-t border-gray-200 mt-auto">
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

export default JudgeSidebar;
