/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
import { AdminPageLoader } from "../../components/PageLoader";
import {
  FaGavel,
  FaUser,
  FaFileAlt,
  FaCalendarAlt,
  FaUserPlus,
  FaPlus,
  FaChartBar,
  FaExclamationCircle,
  FaClock,
  FaMapMarkerAlt,
  FaEye,
  FaArrowRight,
  FaBell,
  FaCheckCircle,
  FaTimesCircle,
  FaInfoCircle,
  FaUserCheck,
  FaFileUpload,
} from "react-icons/fa";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import {
  casesAPI,
  authAPI,
  hearingsAPI,
  analyticsAPI,
} from "../../services/api";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// Helper functions for activity display
const getActivityIcon = (type) => {
  switch (type) {
    case "case":
      return <FaFileAlt className="w-5 h-5 text-blue-600" />;
    case "user":
      return <FaUserPlus className="w-5 h-5 text-green-600" />;
    case "hearing":
      return <FaCalendarAlt className="w-5 h-5 text-purple-600" />;
    case "document":
      return <FaFileUpload className="w-5 h-5 text-orange-600" />;
    case "system":
      return <FaInfoCircle className="w-5 h-5 text-gray-600" />;
    default:
      return <FaBell className="w-5 h-5 text-blue-600" />;
  }
};

const getActivityIconBg = (type) => {
  switch (type) {
    case "case":
      return "bg-blue-100";
    case "user":
      return "bg-green-100";
    case "hearing":
      return "bg-purple-100";
    case "document":
      return "bg-orange-100";
    case "system":
      return "bg-gray-100";
    default:
      return "bg-blue-100";
  }
};

const getActivityStatusBadge = (status) => {
  if (!status || status === "undefined") {
    return "bg-green-100 text-green-800";
  }

  switch (status.toLowerCase()) {
    case "completed":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "in-progress":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-green-100 text-green-800";
  }
};

const AdminHome = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalCases: 0,
    activeUsers: 0,
    pendingCases: 0,
    urgentCases: 0,
  });

  const [upcomingHearings, setUpcomingHearings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState({
    monthlyStats: [],
    statusDistribution: {},
  });

  // Chart data for case statistics - dynamic
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
        label: "Active Cases",
        data: chartData.monthlyStats.map((stat) => stat.activeCases || 0),
        backgroundColor: "rgba(34, 197, 94, 0.8)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
        barThickness: 15,
      },
      {
        label: "Pending Cases",
        data: chartData.monthlyStats.map((stat) => stat.pendingCases || 0),
        backgroundColor: "rgba(251, 191, 36, 0.8)",
        borderColor: "rgba(251, 191, 36, 1)",
        borderWidth: 1,
        barThickness: 15,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
    },
  };

  // Pie chart data for case status - dynamic
  const pieChartData = {
    labels: ["Open", "In Progress", "Closed"],
    datasets: [
      {
        data: [
          chartData.statusDistribution.Open || 0,
          chartData.statusDistribution["In Progress"] ||
            chartData.statusDistribution["In-progress"] ||
            0,
          chartData.statusDistribution.Closed || 0,
        ],
        backgroundColor: [
          "rgba(251, 191, 36, 0.8)", // Open - yellow
          "rgba(59, 130, 246, 0.8)", // In Progress - blue
          "rgba(34, 197, 94, 0.8)", // Closed - green
        ],
        borderColor: [
          "rgba(251, 191, 36, 1)",
          "rgba(59, 130, 246, 1)",
          "rgba(34, 197, 94, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "right",
      },
    },
    cutout: "70%",
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch analytics data
        let analytics = {
          monthlyStats: Array(12).fill({ activeCases: 0, pendingCases: 0 }),
          statusDistribution: { Open: 0, "In-progress": 0, Closed: 0 },
          totalCases: 0,
          totalUsers: 0,
          urgentCases: 0,
        };

        try {
          const analyticsResponse = await analyticsAPI.getDashboardAnalytics();
          analytics = analyticsResponse.data;
        } catch (analyticsError) {
          console.warn("Could not fetch analytics data:", analyticsError);
        }

        // Fetch cases data
        const casesResponse = await casesAPI.getCases();
        const cases = casesResponse.data;

        // Fetch users data
        const usersResponse = await authAPI.getUsers();
        const users = usersResponse.data;

        // Fetch hearings data
        let hearings = [];
        try {
          const hearingsResponse = await hearingsAPI.getHearings();
          hearings = hearingsResponse.data;
        } catch (hearingError) {
          // Silently handle hearing fetch errors
        }

        // Set chart data from analytics
        setChartData({
          monthlyStats: analytics.monthlyStats,
          statusDistribution: analytics.statusDistribution,
        });

        // Calculate stats
        const totalCases = analytics.totalCases || cases.length;
        const activeUsers = analytics.totalUsers || users.length;
        const pendingCases = cases.filter(
          (c) => c.status === "Open" || c.status === "In-progress"
        ).length;
        const urgentCases =
          analytics.urgentCases ||
          cases.filter(
            (c) =>
              c.status === "Open" &&
              new Date(c.createdAt) >
                new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length;

        setStats({
          totalCases,
          activeUsers,
          pendingCases,
          urgentCases,
        });

        // Transform hearings for display
        const upcomingHearingsData = hearings
          .filter(
            (hearing) => hearing.date && new Date(hearing.date) >= new Date()
          )
          .slice(0, 3)
          .map((hearing) => ({
            id: hearing._id,
            title: `${hearing.case?.title || "Case"} - Hearing`,
            date: hearing.date
              ? new Date(hearing.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "TBD",
            time: hearing.time || "TBD",
            location: hearing.court?.name || "TBD",
            judge:
              hearing.judge?.username ||
              (hearing.judge?.firstName && hearing.judge?.lastName)
                ? `${hearing.judge.firstName} ${hearing.judge.lastName}`.trim()
                : "TBD",
          }));

        setUpcomingHearings(upcomingHearingsData);

        // Update recent activity with diverse data
        const recentActivityData = [];

        // Add case activities
        cases
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 3)
          .forEach((caseItem, index) => {
            // Get client name from populated client data or fallback
            let clientName = "Unknown Client";

            if (caseItem.client) {
              if (caseItem.client.firstName && caseItem.client.lastName) {
                clientName =
                  `${caseItem.client.firstName} ${caseItem.client.lastName}`.trim();
              } else if (caseItem.client.username) {
                clientName = caseItem.client.username;
              } else if (typeof caseItem.client === "string") {
                // If client is just an ID string, use a generic name
                clientName = "Client";
              }
            }

            recentActivityData.push({
              id: `case-${index}`,
              title: "New case filed",
              details: `Case "${
                caseItem.title || "Unknown Case"
              }" has been submitted for review`,
              date: new Date(caseItem.createdAt).toLocaleDateString(),
              time: new Date(caseItem.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              type: "case",
              user: clientName,
              status: "completed",
            });
          });

        // Add user activities
        users
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 2)
          .forEach((user, index) => {
            // Get user display name
            let userName = "Unknown User";

            if (user.firstName && user.lastName) {
              userName = `${user.firstName} ${user.lastName}`.trim();
            } else if (user.username) {
              userName = user.username;
            }

            recentActivityData.push({
              id: `user-${index}`,
              title: `New ${user.role?.toLowerCase() || "user"} registered`,
              details: `${userName} has joined the system as a ${
                user.role || "User"
              }`,
              date: new Date(user.createdAt).toLocaleDateString(),
              time: new Date(user.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              type: "user",
              user: "System",
              status: "completed",
            });
          });

        // Add hearing activities
        upcomingHearingsData.slice(0, 2).forEach((hearing, index) => {
          recentActivityData.push({
            id: `hearing-${index}`,
            title: "Hearing scheduled",
            details: `Hearing for "${
              hearing.title || "Unknown Case"
            }" scheduled for ${hearing.date || "TBD"}`,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: "hearing",
            user: hearing.judge || "System",
            status: "pending",
          });
        });

        // Sort by date and limit to 8 items
        const sortedActivity = recentActivityData
          .sort(
            (a, b) =>
              new Date(b.date + " " + b.time) - new Date(a.date + " " + a.time)
          )
          .slice(0, 8);

        setRecentActivity(sortedActivity);

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
      <AdminLayout>
        <AdminPageLoader message="Loading dashboard data..." />
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <section>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome Back {user?.username || "Admin"}
          </h1>
          <p className="text-gray-600 font-light">
            Here's a summary of the court case management system.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <span className="text-sm text-gray-600">Total Cases</span>
            </div>
            <div className="text-3xl font-bold mt-2">{stats.totalCases}</div>
            <div className="text-xs text-gray-500 mt-1">This Month</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-sm text-gray-600">Active Users</span>
            </div>
            <div className="text-3xl font-bold mt-2">{stats.activeUsers}</div>
            <div className="text-xs text-gray-500 mt-1">
              From The Last Month
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
              <span className="text-sm text-gray-600">Pending Cases</span>
            </div>
            <div className="text-3xl font-bold mt-2">{stats.pendingCases}</div>
            <div className="text-xs text-gray-500 mt-1">
              {stats.urgentCases} Urgent
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Statistics Graph */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Monthly Case Statistics
              </h3>
              <p className="text-sm text-gray-600">
                Cases filed and processed throughout the year
              </p>
            </div>
            <div className="h-64">
              {chartData.monthlyStats.length > 0 ? (
                <Bar data={caseChartData} options={chartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              )}
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-800">
                Case Status Distribution
              </h3>
              <p className="text-sm text-gray-600">
                Current status breakdown of all cases
              </p>
            </div>
            <div className="h-64">
              {Object.keys(chartData.statusDistribution).length > 0 ? (
                <Doughnut data={pieChartData} options={pieChartOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Hearings */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <FaCalendarAlt className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Upcoming Hearings
                    </h2>
                    <p className="text-sm text-gray-600">
                      Next 7 days schedule
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/calendar"
                  className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                >
                  View All
                  <FaArrowRight className="ml-1 w-3 h-3" />
                </Link>
              </div>
            </div>
            <div className="p-6">
              {upcomingHearings.length > 0 ? (
                <div className="space-y-4">
                  {upcomingHearings.slice(0, 4).map((hearing) => (
                    <div
                      key={hearing.id}
                      className="group border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {hearing.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            Case #{hearing.caseNumber || "N/A"}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            {hearing.priority || "Normal"}
                          </span>
                          <button className="text-gray-400 hover:text-blue-600 transition-colors">
                            <FaEye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center text-gray-600">
                          <FaCalendarAlt className="text-blue-500 mr-2 w-4 h-4" />
                          <span className="font-medium">{hearing.date}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaClock className="text-green-500 mr-2 w-4 h-4" />
                          <span>{hearing.time}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <FaMapMarkerAlt className="text-red-500 mr-2 w-4 h-4" />
                          <span>{hearing.location}</span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-gray-600">
                            <FaGavel className="text-purple-500 mr-2 w-4 h-4" />
                            <span>Judge: {hearing.judge}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {hearing.attendees || 0} attendees
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaCalendarAlt className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">
                    No upcoming hearings
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    All hearings are up to date
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="bg-green-100 p-2 rounded-lg mr-3">
                    <FaBell className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Recent Activity
                    </h2>
                    <p className="text-sm text-gray-600">
                      Latest system updates
                    </p>
                  </div>
                </div>
                {/* <Link
                  to="/admin/activity"
                  className="flex items-center text-green-600 hover:text-green-800 text-sm font-medium transition-colors"
                >
                  View All
                  <FaArrowRight className="ml-1 w-3 h-3" />
                </Link> */}
              </div>
            </div>
            <div className="p-6">
              {recentActivity.length > 0 ? (
                <div className="space-y-4">
                  {recentActivity.slice(0, 5).map((activity) => (
                    <div
                      key={activity.id}
                      className="group flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="flex-shrink-0">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${getActivityIconBg(
                            activity.type
                          )}`}
                        >
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
                            {activity.title || "Activity"}
                          </p>
                          <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                            {activity.time || activity.date || "N/A"}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {activity.details || "No details available"}
                        </p>
                        {activity.user && activity.user !== "undefined" && (
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <FaUserCheck className="mr-1 w-3 h-3" />
                            <span>by {activity.user}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getActivityStatusBadge(
                            activity.status
                          )}`}
                        >
                          {activity.status && activity.status !== "undefined"
                            ? activity.status
                            : "Completed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FaBell className="mx-auto w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium">
                    No recent activity
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    System activity will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </AdminLayout>
    </section>
  );
};

export default AdminHome;
