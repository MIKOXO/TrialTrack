import { useState, useEffect } from "react";
import JudgeSidebar from "./JudgeSidebar";
import { FaBars, FaTimes } from "react-icons/fa";
import ProfileAvatar from "./ProfileAvatar";

const JudgeLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

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
      loadUser();
    };

    window.addEventListener("userUpdated", handleUserUpdate);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleUserUpdate);
    };
  }, []);

  return (
    <section className="flex h-screen">
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-md bg-white shadow-md text-gray-700 focus:outline-none"
        >
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-300 ease-in-out z-40`}
      >
        <JudgeSidebar />
      </div>

      <div className="overflow-auto font-Lexend flex-1 ml-0 md:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-end">
          <div></div>
          <div className="flex items-center">
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="flex items-center mr-3">
                  <ProfileAvatar user={user} size="md" showName={true} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">{children}</main>
      </div>
    </section>
  );
};

export default JudgeLayout;
