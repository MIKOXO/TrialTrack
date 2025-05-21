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
    totalCases: 145,
    activeUsers: 55,
    pendingCases: 18,
    urgentCases: 5,
  });

  const [upcomingHearings, setUpcomingHearings] = useState([
    {
      id: 1,
      title: "Smith vs. Johnson - Initial Hearing",
      date: "Oct 20",
      time: "10:30 AM",
      location: "CourtRoom 3A",
      judge: "Hon Reynolds",
    },
    {
      id: 2,
      title: "John vs. Williams - Sentencing",
      date: "Nov 20",
      time: "9:30 AM",
      location: "CourtRoom 7A",
      judge: "Hon Thompson",
    },
    {
      id: 3,
      title: "Jane vs. Morgan - Initial Hearing",
      date: "Feb 20",
      time: "8:30 AM",
      location: "CourtRoom 3A",
      judge: "Hon Reynolds",
    },
  ]);

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "new_case",
      title: "Filed new case",
      details: "Smith vs. Johnson",
      date: "Today",
    },
    {
      id: 2,
      type: "hearing",
      title: "Scheduled hearing",
      details: "Case #1234",
      date: "Yesterday",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chart data for case statistics
  const caseChartData = {
    labels: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"],
    datasets: [
      {
        label: "Active Cases",
        data: [90, 10, 85, 25, 65, 30, 85, 90, 40, 10, 30, 85],
        backgroundColor: "rgb(0, 128, 0)",
        barThickness: 15,
      },
      {
        label: "Pending Cases",
        data: [10, 5, 35, 20, 40, 60, 75, 40, 20, 15, 25, 40],
        backgroundColor: "rgb(135, 206, 235)",
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
        max: 100,
        ticks: {
          stepSize: 30,
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
        display: false,
      },
    },
  };

  // Pie chart data for case status
  const pieChartData = {
    labels: ["Pending", "Active", "Closed", "Urgent", "Archived"],
    datasets: [
      {
        data: [25, 40, 20, 10, 5],
        backgroundColor: [
          "rgb(255, 205, 86)", // Pending - yellow
          "rgb(54, 162, 235)", // Active - blue
          "rgb(0, 128, 0)", // Closed - green
          "rgb(255, 99, 132)", // Urgent - red
          "rgb(201, 203, 207)", // Archived - gray
        ],
        borderWidth: 0,
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    cutout: "70%",
  };

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setLoading(true);
  //       // In a real application, we would fetch data from the API
  //       // For now, we're using the mock data defined above
  //       setLoading(false);
  //     } catch (err) {
  //       console.error("Error fetching dashboard data:", err);
  //       setError("Failed to load dashboard data. Please try again later.");
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <section>
      <AdminLayout>
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-800">
            Welcome back, Admin
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
            <div className="h-64">
              <Bar data={caseChartData} options={chartOptions} />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="h-64 flex items-center justify-center">
              <div className="w-48 h-48 relative">
                <Doughnut data={pieChartData} options={pieChartOptions} />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-sm text-gray-500">Status</div>
                </div>
              </div>
              <div className="ml-4">
                <div className="flex flex-col space-y-2">
                  {pieChartData.labels.map((label, index) => (
                    <div key={index} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor:
                            pieChartData.datasets[0].backgroundColor[index],
                        }}
                      ></div>
                      <span className="text-sm">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
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
