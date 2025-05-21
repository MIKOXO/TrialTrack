/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import JudgeLayout from "../../components/JudgeLayout";
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
    assignedCases: 15,
    pendingCases: 8,
    resolvedCases: 7,
    upcomingHearings: 5,
  });

  const [assignedCases, setAssignedCases] = useState([
    {
      id: 1,
      title: "Tenant Dispute - Africa road",
      caseNumber: "CV-2023-1001",
      description:
        "Dispute regarding rental property damages and security deposit.",
      status: "Active",
      client: "John Smith",
      nextHearing: "11/20/2023",
      filedDate: "8/15/2023",
    },
    {
      id: 2,
      title: "Divorce Proceedings",
      caseNumber: "FA-2023-5678",
      description:
        "Divorce filing with property division and custody arrangements",
      status: "Active",
      client: "Michael Brown",
      nextHearing: "12/10/2023",
      filedDate: "6/10/2023",
    },
    {
      id: 3,
      title: "Small Claims - Unpaid Invoice",
      caseNumber: "SC-2023-3421",
      description: "Claim for unpaid contractor services",
      status: "Closed",
      client: "David Wilson",
      nextHearing: "N/A",
      filedDate: "3/22/2023",
    },
  ]);

  const [upcomingHearings, setUpcomingHearings] = useState([
    {
      id: 1,
      caseTitle: "Tenant Dispute - Africa Road",
      caseNumber: "CV-2023-1001",
      date: "November 20, 2023",
      time: "10:00 AM",
      location: "Courtroom 302",
      parties: ["John Smith", "ABC Properties LLC"],
    },
    {
      id: 2,
      caseTitle: "Divorce Proceedings",
      caseNumber: "FA-2023-5678",
      date: "December 10, 2023",
      time: "9:00 AM",
      location: "Courtroom 201",
      parties: ["Michael Brown", "Sarah Brown"],
    },
    {
      id: 3,
      caseTitle: "Property Damage Claim",
      caseNumber: "CV-2023-7890",
      date: "December 15, 2023",
      time: "2:30 PM",
      location: "Courtroom 105",
      parties: ["Robert Johnson", "City Insurance Co."],
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chart data for case statistics
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
        data: [5, 7, 4, 6, 8, 10, 9, 12, 8, 7, 9, 6],
        backgroundColor: "rgba(0, 173, 14, 0.5)",
        borderColor: "rgba(0, 173, 14, 1)",
        borderWidth: 1,
      },
      {
        label: "Resolved Cases",
        data: [3, 4, 2, 5, 6, 7, 8, 9, 6, 5, 7, 4],
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2 space-y-10">
            {/* Statistics Graph */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Case Statistics</h2>
                <div className="text-sm text-gray-500">
                  <span className="font-medium">2023</span>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="h-64">
                  <Bar data={caseChartData} options={chartOptions} />
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-green-50 rounded-lg p-3">
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
                  </div>

                  <div className="bg-green-50 rounded-lg p-3">
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
                  </div>
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
        </div>
      </JudgeLayout>
    </section>
  );
};

export default JudgeHome;
