/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ClientLayout from "../../components/ClientLayout";
import CaseStatusCard from "../../components/CaseStatusCard";
import CaseItem from "../../components/CaseItem";
import QuickAction from "../../components/QuickAction";
import HearingItem from "../../components/HearingItem";
import { ClientPageLoader } from "../../components/PageLoader";
import { FaPlus, FaSearch } from "react-icons/fa";

const ClientHome = () => {
  const [user, setUser] = useState(null);

  const [stats, setStats] = useState({
    totalCases: 0,
    openCases: 0,
    pendingCases: 0,
    closedCases: 0,
  });

  const [recentCases, setRecentCases] = useState([]);
  const [upcomingHearings, setUpcomingHearings] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch cases for the client
        const casesResponse = await axios.get(
          "http://localhost:3001/api/case",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const cases = casesResponse.data;

        // Calculate stats from real data
        const totalCases = cases.length;
        const openCases = cases.filter((c) => c.status === "Open").length;
        const inProgressCases = cases.filter(
          (c) => c.status === "In-progress"
        ).length;
        const closedCases = cases.filter((c) => c.status === "Closed").length;

        setStats({
          totalCases,
          openCases,
          pendingCases: inProgressCases, // Map "In-progress" to "pending" for UI
          closedCases,
        });

        // Get recent cases (last 2 cases)
        const recentCasesData = cases
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2)
          .map((caseItem) => ({
            id: caseItem._id,
            title: caseItem.title,
            caseNumber: caseItem._id.slice(-8).toUpperCase(), // Use last 8 chars of ID as case number
            description: caseItem.description,
            status:
              caseItem.status === "In-progress" ? "Pending" : caseItem.status,
            filedDate: new Date(caseItem.createdAt).toLocaleDateString(),
          }));

        setRecentCases(recentCasesData);

        setUpcomingHearings([]);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data. Please try again later.");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Show loading state
  if (loading) {
    return (
      <ClientLayout>
        <ClientPageLoader message="Loading your dashboard..." />
      </ClientLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <ClientLayout>
        <div className="px-4 md:px-7 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 md:px-4 py-3 rounded-lg">
            <div className="flex items-start md:items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5 md:mt-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-2 md:ml-3">
                <h3 className="text-sm font-medium">Error Loading Dashboard</h3>
                <p className="text-xs md:text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <ClientLayout>
      <div className="px-4 md:px-7 py-4 font-Lexend">
        <h1 className="text-xl md:text-2xl font-medium">
          Welcome Back {user?.username || "Client"}
        </h1>
        <p className="font-light text-base md:text-lg mt-1">
          Welcome back to your case management portal
        </p>
      </div>

      <div className="px-4 md:px-7 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
        <CaseStatusCard title="Total Cases" count={stats.totalCases} />
        <CaseStatusCard title="Open Cases" count={stats.openCases} />
        <CaseStatusCard title="Pending Cases" count={stats.pendingCases} />
        <CaseStatusCard title="Closed Cases" count={stats.closedCases} />
      </div>

      <div className="px-4 md:px-7 py-3 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <div className="mb-4 md:mb-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2 sm:gap-0">
              <h2 className="text-base md:text-lg font-medium">Recent Cases</h2>
              <Link
                to="/client/mycases"
                className="text-green-600 text-sm hover:underline self-start sm:self-auto"
              >
                View all cases
              </Link>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {recentCases.length > 0 ? (
                recentCases.map((caseItem) => (
                  <CaseItem
                    key={caseItem.id}
                    title={caseItem.title}
                    caseNumber={caseItem.caseNumber}
                    description={caseItem.description}
                    status={caseItem.status}
                    filedDate={caseItem.filedDate}
                  />
                ))
              ) : (
                <div className="p-4 md:p-6 text-center text-gray-500">
                  <p className="text-sm md:text-base">
                    No cases found. File your first case to get started!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-base md:text-lg font-medium mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
              <QuickAction
                icon={<FaPlus />}
                title="File a new case"
                description="Submit information for a new legal matter."
                to="/client/newcase"
              />
              <QuickAction
                icon={<FaSearch />}
                title="View all cases"
                description="Browse and search through your active cases"
                to="/client/mycases"
              />
            </div>
          </div>
        </div>

        {/* Upcoming Hearings */}
        <div>
          <h2 className="text-base md:text-lg font-medium mb-4">
            Upcoming Hearings
          </h2>
          <div className="space-y-4 md:space-y-7 bg-white rounded-lg shadow-lg overflow-hidden">
            {upcomingHearings.length > 0 ? (
              upcomingHearings.map((hearing) => (
                <HearingItem
                  key={hearing.id}
                  title={hearing.title}
                  date={hearing.date}
                />
              ))
            ) : (
              <div className="p-4 md:p-6 text-center text-gray-500">
                <p className="text-sm md:text-base">
                  No upcoming hearings scheduled.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientHome;
