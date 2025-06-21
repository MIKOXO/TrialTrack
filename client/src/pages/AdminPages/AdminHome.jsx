/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../components/AdminLayout";
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
  const [loading, setLoading] = useState(false);
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
          console.warn("Could not fetch hearings:", hearingError);
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
          .filter((hearing) => new Date(hearing.date) >= new Date())
          .slice(0, 3)
          .map((hearing) => ({
            id: hearing._id,
            title: `${hearing.case?.title || "Case"} - Hearing`,
            date: new Date(hearing.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
            time: hearing.time,
            location: hearing.court?.name || "TBD",
            judge: hearing.judge?.username || "TBD",
          }));

        setUpcomingHearings(upcomingHearingsData);

        // Update recent activity with real data
        const recentActivityData = cases
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map((caseItem, index) => ({
            id: index + 1,
            title: "New case filed",
            details: caseItem.title || "Unknown Case",
            date: new Date(caseItem.createdAt).toLocaleDateString(),
            type: "case",
          }));

        setRecentActivity(recentActivityData);

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
        <div className="flex justify-center items-center h-full">
          <p className="text-lg">Loading dashboard data...</p>
        </div>
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
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Upcoming Hearings</h2>
              <FaCalendarAlt className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {upcomingHearings.map((hearing) => (
                <div
                  key={hearing.id}
                  className="border-b pb-3 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between">
                    <h3 className="font-medium">{hearing.title}</h3>
                    <span className="text-sm text-gray-500">
                      Judge: {hearing.judge}
                    </span>
                  </div>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <div className="flex items-center mr-4">
                      <FaCalendarAlt className="text-gray-400 mr-1" />
                      <span>{hearing.date}</span>
                    </div>
                    <div className="flex items-center mr-4">
                      <FaClock className="text-gray-400 mr-1" />
                      <span>{hearing.time}</span>
                    </div>
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-gray-400 mr-1" />
                      <span>{hearing.location}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium">Recent Activity</h2>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium">{activity.title}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {activity.details}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </AdminLayout>
    </section>
  );
};

export default AdminHome;
