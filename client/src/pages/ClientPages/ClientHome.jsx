/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
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
    totalCases: 5,
    openCases: 2,
    pendingCases: 1,
    closedCases: 2,
  });

  const [recentCases, setRecentCases] = useState([
    {
      id: 1,
      title: "Tenant Dispute - Africa road",
      caseNumber: "CV-2023-1001",
      description:
        "Dispute regarding rental property damages and security deposit.",
      status: "Active",
      filedDate: "8/15/2023",
    },
    {
      id: 2,
      title: "Traffic Violation Appeal",
      caseNumber: "CR-2022-8434",
      description: "Appeal of speeding ticket issued on Piassa Road",
      status: "Pending",
      filedDate: "11/20/2022",
    },
  ]);

  const [upcomingHearings, setUpcomingHearings] = useState([
    {
      id: 1,
      title: "Traffic Violation Appeal",
      date: "Wednesday, November 15, 2023",
    },
    {
      id: 2,
      title: "Tenant Dispute - Africa Road",
      date: "Monday, November 20, 2023",
    },
    {
      id: 3,
      title: "Divorce Proceedings",
      date: "Sunday, December 10, 2023",
    },
  ]);

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
              {recentCases.map((caseItem) => (
                <CaseItem
                  key={caseItem.id}
                  title={caseItem.title}
                  caseNumber={caseItem.caseNumber}
                  description={caseItem.description}
                  status={caseItem.status}
                  filedDate={caseItem.filedDate}
                />
              ))}
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
            {upcomingHearings.map((hearing) => (
              <HearingItem
                key={hearing.id}
                title={hearing.title}
                date={hearing.date}
              />
            ))}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientHome;
