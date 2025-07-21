// /* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import ClientSidebar from "./ClientSidebar";
import { FaBars, FaTimes } from "react-icons/fa";
import ProfileAvatar from "./ProfileAvatar";

const ClientLayout = ({ children }) => {
  // Initialize sidebar state based on screen size
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== "undefined") {
      return window.innerWidth >= 1024;
    }
    return false;
  });
  const [user, setUser] = useState(null);
  const [userUpdateTrigger, setUserUpdateTrigger] = useState(0);

  useEffect(() => {
    const loadUser = () => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    };

    // Load user data initially
    loadUser();

    // Listen for localStorage changes to update user data in real-time
    const handleStorageChange = (e) => {
      if (e.key === "user") {
        loadUser();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events for same-tab updates
    const handleUserUpdate = () => {
      console.log(
        "ClientLayout: userUpdated event received, reloading user data"
      );
      loadUser();
      setUserUpdateTrigger((prev) => prev + 1); // Force re-render
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  // Handle responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section className="flex h-screen relative">
      {/* Mobile/Tablet sidebar backdrop - full screen */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-800 bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <div
        className={`lg:w-64 lg:flex-shrink-0 ${
          isSidebarOpen ? "fixed top-0 left-0 h-full w-64 z-40" : "hidden"
        } lg:block lg:relative lg:h-auto transition-transform duration-300 ease-in-out`}
      >
        <ClientSidebar closeSidebar={() => setIsSidebarOpen(false)} />
      </div>

      <div className="overflow-auto font-Lexend flex-1 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center sticky top-0 z-30">
          <div></div>
          <div className="flex items-center space-x-3">
            {/* Hamburger Menu - Only visible on mobile/tablet */}
            <button
              className="lg:hidden p-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? (
                <FaTimes className="w-5 h-5" />
              ) : (
                <FaBars className="w-5 h-5" />
              )}
            </button>

            {/* Profile Avatar */}
            <div className="relative">
              <div className="flex items-center">
                <ProfileAvatar
                  key={`${user?.id}-${userUpdateTrigger}`}
                  user={user}
                  size="md"
                  showName={true}
                />
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </section>
  );
};

export default ClientLayout;
