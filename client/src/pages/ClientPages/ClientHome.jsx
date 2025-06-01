/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import ClientLayout from "../../components/ClientLayout";
import CaseStatusCard from "../../components/CaseStatusCard";
import CaseItem from "../../components/CaseItem";
import QuickAction from "../../components/QuickAction";
import HearingItem from "../../components/HearingItem";
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

  return (
    <ClientLayout>
      <div className="px-7 py-4 font-Lexend">
        <h1 className="text-2xl font-medium">
          Welcome Back {user?.username || "Client"}
        </h1>
        <p className="font-light text-lg mt-1">
          Welcome back to your case management portal
        </p>
      </div>

      <div className="px-7 py-3 grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <CaseStatusCard title="Total Cases" count={stats.totalCases} />
        <CaseStatusCard title="Open Cases" count={stats.openCases} />
        <CaseStatusCard title="Pending Cases" count={stats.pendingCases} />
        <CaseStatusCard title="Closed Cases" count={stats.closedCases} />
      </div>

      <div className="px-7 py-3 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Cases */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Recent Cases</h2>
              <Link
                to="/client/mycases"
                className="text-green-600 text-sm hover:underline"
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
                <div className="p-6 text-center text-gray-500">
                  <p>No cases found. File your first case to get started!</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Upcomin Hearings */}
        <div>
          <h2 className="text-lg font-medium mb-4">Upcoming Hearings</h2>
          <div className="space-y-7 bg-white rounded-lg shadow-lg overflow-hidden">
            {upcomingHearings.length > 0 ? (
              upcomingHearings.map((hearing) => (
                <HearingItem
                  key={hearing.id}
                  title={hearing.title}
                  date={hearing.date}
                />
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <p>No upcoming hearings scheduled.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientHome;
