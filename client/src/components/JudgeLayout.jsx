import { useState, useEffect } from "react";
import JudgeSidebar from "./JudgeSidebar";
import { FaBars, FaTimes } from "react-icons/fa";

const JudgeLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
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

      <div className="font-Lexend flex-1 ml-0 md:ml-64 transition-all duration-300">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-end">
          <div></div>
          <div className="flex items-center">
            <div className="relative">
              <div className="flex items-center space-x-3">
                <div className="hidden md:block">
                  <h1 className="text-lg font-medium text-secondary">
                    Hi, {user?.username || "Judge"}
                  </h1>
                </div>
                <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                  {user?.username?.charAt(0).toUpperCase() || "J"}
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>
    </section>
  );
};

export default JudgeLayout;
