/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JudgeLayout from "../../components/JudgeLayout";
import axios from "axios";
import {
  FaFileAlt,
  FaCalendarAlt,
  FaGavel,
  FaHourglassHalf,
  FaSearch,
  FaEllipsisV,
  FaRegClock,
  FaMapMarkerAlt,
  FaUserTie,
  FaChartBar,
} from "react-icons/fa";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const JudgeHome = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    assignedCases: 0,
    pendingCases: 0,
    resolvedCases: 0,
    upcomingHearings: 0,
  });

  const [assignedCases, setAssignedCases] = useState([]);
  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [chartData, setChartData] = useState({
    newCases: Array(12).fill(0),
    resolvedCases: Array(12).fill(0),
    totalNewCases: 0,
    totalResolvedCases: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chart data for case statistics - now dynamic
  const caseChartData = {
    labels: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],
    datasets: [
      {
        label: "New Cases",
        data: chartData.newCases,
        backgroundColor: "rgba(0, 173, 14, 0.5)",
        borderColor: "rgba(0, 173, 14, 1)",
        borderWidth: 1,
      },
      {
        label: "Resolved Cases",
        data: chartData.resolvedCases,
        backgroundColor: "rgba(0, 92, 8, 0.5)",
        borderColor: "rgba(0, 92, 8, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch assigned cases
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
          (c) => c.status === "In Progress"
        ).length;
        const closedCases = cases.filter((c) => c.status === "Closed").length;

        setStats({
          assignedCases: totalCases,
          pendingCases: inProgressCases,
          resolvedCases: closedCases,
          upcomingHearings: 0, // Will be updated when hearings are fetched
        });

        // Transform cases for display
        const transformedCases = cases
          .slice(0, 3) // Show only first 3 cases
          .map((caseItem) => ({
            id: caseItem._id,
            title: caseItem.title,
            caseNumber: caseItem._id.slice(-8).toUpperCase(),
            description: caseItem.description,
            status: caseItem.status,
            client: "Client", // Backend doesn't store client name separately
            nextHearing: "TBD",
            filedDate: new Date(caseItem.createdAt).toLocaleDateString(),
          }));

        setAssignedCases(transformedCases);

        // Generate chart data from cases
        const currentYear = new Date().getFullYear();
        const monthlyNewCases = Array(12).fill(0);
        const monthlyResolvedCases = Array(12).fill(0);

        cases.forEach((caseItem) => {
          const createdDate = new Date(caseItem.createdAt);
          const updatedDate = new Date(
            caseItem.updatedAt || caseItem.createdAt
          );

          // Count new cases by month
          if (createdDate.getFullYear() === currentYear) {
            const month = createdDate.getMonth();
            monthlyNewCases[month]++;
          }

          // Count resolved cases by month (when status changed to Closed)
          if (
            caseItem.status === "Closed" &&
            updatedDate.getFullYear() === currentYear
          ) {
            const month = updatedDate.getMonth();
            monthlyResolvedCases[month]++;
          }
        });

        // Update chart data
        const totalNew = monthlyNewCases.reduce((sum, count) => sum + count, 0);
        const totalResolved = monthlyResolvedCases.reduce(
          (sum, count) => sum + count,
          0
        );

        // If no data exists, generate some sample data for demonstration
        if (totalNew === 0 && totalResolved === 0 && cases.length === 0) {
          const sampleNewCases = [2, 3, 1, 4, 2, 3, 5, 2, 1, 3, 2, 4];
          const sampleResolvedCases = [1, 2, 2, 3, 1, 2, 4, 3, 2, 2, 1, 3];

          setChartData({
            newCases: sampleNewCases,
            resolvedCases: sampleResolvedCases,
            totalNewCases: sampleNewCases.reduce(
              (sum, count) => sum + count,
              0
            ),
            totalResolvedCases: sampleResolvedCases.reduce(
              (sum, count) => sum + count,
              0
            ),
          });
        } else {
          setChartData({
            newCases: monthlyNewCases,
            resolvedCases: monthlyResolvedCases,
            totalNewCases: totalNew,
            totalResolvedCases: totalResolved,
          });
        }

        // Fetch hearings
        try {
          const hearingsResponse = await axios.get(
            "http://localhost:3001/api/hearings",
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          // Transform hearings for display
          const transformedHearings = hearingsResponse.data
            .filter((hearing) => new Date(hearing.date) >= new Date()) // Only upcoming hearings
            .slice(0, 3) // Show only first 3 hearings
            .map((hearing) => ({
              id: hearing._id,
              caseTitle: hearing.case?.title || "Unknown Case",
              caseNumber: hearing._id.slice(-8).toUpperCase(),
              date: new Date(hearing.date).toLocaleDateString(),
              time: hearing.time,
              location: hearing.court?.name || "TBD",
              parties: [], // Backend doesn't store parties separately
            }));

          setUpcomingHearings(transformedHearings);

          // Update stats with hearing count
          setStats((prev) => ({
            ...prev,
            upcomingHearings: transformedHearings.length,
          }));
        } catch (hearingErr) {
          console.warn("Could not fetch hearings:", hearingErr);
          // Continue without hearings if they fail to load
        }

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

  if (loading) {
    return (
      <JudgeLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-lg">Loading dashboard data...</p>
        </div>
      </JudgeLayout>
    );
  }

  if (error) {
    return (
      <JudgeLayout>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </JudgeLayout>
    );
  }

  return (
    <section>
      <JudgeLayout>
        <div className="pb-4 font-Lexend">
          <h1 className="text-2xl font-medium">
            Welcome Back {user?.username || "Judge"}
          </h1>
          <p className="font-light text-lg mt-1">
            Welcome back to your case management portal
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 font-medium mb-2">Assigned Cases</h3>
            <p className="text-3xl font-bold">{stats.assignedCases}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 font-medium mb-2">Pending Cases</h3>
            <p className="text-3xl font-bold">{stats.pendingCases}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 font-medium mb-2">Resolved Cases</h3>
            <p className="text-3xl font-bold">{stats.resolvedCases}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-gray-600 font-medium mb-2">
              Upcoming Hearings
            </h3>
            <p className="text-3xl font-bold">{stats.upcomingHearings}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-10">
            {/* Statistics Graph */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Case Statistics</h2>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">
                    {new Date().getFullYear()}
                  </span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-64">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-gray-500">Loading chart data...</p>
                    </div>
                  ) : (
                    <Bar data={caseChartData} options={chartOptions} />
                  )}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  {/* <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">
                        New Cases
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-gray-800">
                        91
                      </span>
                      <span className="text-sm text-green-600 ml-2">+12%</span>
                    </div>
                  </div> */}

                  {/* <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-800 mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Resolved
                      </span>
                    </div>
                    <div className="mt-2">
                      <span className="text-2xl font-bold text-gray-800">
                        66
                      </span>
                      <span className="text-sm text-green-600 ml-2">+8%</span>
                    </div>
                  </div> */}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Link
                    to="/judge/reports"
                    className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                  >
                    <FaChartBar className="mr-1" />
                    View Detailed Reports
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Cases */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Recent Cases</h2>
                <Link
                  to="/judge/cases"
                  className="text-green-600 text-sm hover:underline"
                >
                  View all cases
                </Link>
              </div>

              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Case
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignedCases.map((caseItem) => (
                      <tr key={caseItem.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {caseItem.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {caseItem.caseNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {caseItem.client}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              caseItem.status === "Open"
                                ? "bg-blue-100 text-blue-800"
                                : caseItem.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : caseItem.status === "Closed"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {caseItem.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            to={`/judge/cases/${caseItem.id}`}
                            className="text-green-600 hover:text-green-700 mr-3"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Hearings */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Today's Hearings</h2>
              <Link
                to="/judge/hearings"
                className="text-green-600 text-sm hover:underline"
              >
                View all hearings
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {upcomingHearings.length === 0 ? (
                <div className="p-6 text-center">
                  <p className="text-gray-500">
                    No hearings scheduled for today.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {upcomingHearings.map((hearing) => (
                    <div key={hearing.id} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-gray-900">
                              {hearing.caseTitle}
                            </h3>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              {hearing.time}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {hearing.caseNumber}
                          </p>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <div className="flex items-center text-sm text-gray-500">
                              <FaRegClock className="text-gray-400 mr-2" />
                              <span>{hearing.time}</span>
                            </div>
                            <div className="flex items-center text-sm text-gray-500">
                              <FaMapMarkerAlt className="text-gray-400 mr-2" />
                              <span>{hearing.location}</span>
                            </div>
                          </div>

                          <div className="mt-3">
                            <div className="text-sm text-gray-500 font-medium">
                              Parties:
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {hearing.parties.map((party, index) => (
                                <div
                                  key={index}
                                  className="flex items-center text-sm bg-gray-100 px-2 py-1 rounded"
                                >
                                  <FaUserTie className="text-gray-400 mr-1" />
                                  <span>{party}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="ml-4">
                          <button className="text-gray-400 hover:text-gray-600">
                            <FaEllipsisV />
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 flex justify-end">
                        <Link
                          to={`/judge/hearings/${hearing.id}`}
                          className="text-green-600 hover:text-green-700 text-sm font-medium"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </JudgeLayout>
    </section>
  );
};

export default JudgeHome;
