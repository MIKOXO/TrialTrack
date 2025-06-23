/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import ClientLayout from "../../components/ClientLayout";
import { Link } from "react-router-dom";
import { FaPlus, FaEye, FaFile } from "react-icons/fa";
import { casesAPI } from "../../services/api";
import { ClientPageLoader, InlineLoader } from "../../components/PageLoader";

const MyCases = () => {
  const [cases, setCases] = useState([]);

  const [filteredCases, setFilteredCases] = useState([]);
  const [activeTab, setActiveTab] = useState("All Cases");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const tabs = ["All Cases", "Open", "Pending", "Closed"];
  const casesPerPage = 4;

  useEffect(() => {
    // Filter cases based on active tab
    let filtered = [...cases];

    if (activeTab !== "All Cases") {
      filtered = cases.filter((caseItem) => {
        const status = caseItem.status.toLowerCase();
        const tab = activeTab.toLowerCase();

        if (tab === "in progress") {
          return status === "in progress" || status === "pending";
        }
        return status === tab;
      });
    }

    setFilteredCases(filtered);
    setCurrentPage(1);
  }, [cases, activeTab]);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);

        // Fetch cases from the API
        const response = await casesAPI.getCases();

        // Transform backend data to match frontend structure
        const transformedCases = response.data.map((caseItem) => ({
          id: caseItem._id,
          title: caseItem.title,
          type: caseItem.caseType
            ? caseItem.caseType.charAt(0).toUpperCase() +
              caseItem.caseType.slice(1)
            : "General",
          status:
            caseItem.status === "In Progress" ? "Pending" : caseItem.status,
          filingDate: new Date(caseItem.createdAt).toLocaleDateString(),
          priority: caseItem.priority,
          court: caseItem.court,
        }));

        setCases(transformedCases);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching cases:", err);
        setError("Failed to load cases. Please try again later.");
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const indexOfLastCase = currentPage * casesPerPage;
  const indexOfFirstCase = indexOfLastCase - casesPerPage;
  const currentCases = filteredCases.slice(indexOfFirstCase, indexOfLastCase);
  const totalPages = Math.ceil(filteredCases.length / casesPerPage);

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "active":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
            Active
          </span>
        );
      case "open":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-500">
            Open
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case "closed":
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
            Closed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Show loading state
  if (loading) {
    return (
      <ClientLayout>
        <ClientPageLoader message="Loading your cases..." />
      </ClientLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <ClientLayout>
        <div className="px-7 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
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
              <div className="ml-3">
                <h3 className="text-sm font-medium">Error Loading Cases</h3>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </ClientLayout>
    );
  }

  return (
    <section>
      <ClientLayout>
        <div className="mx-5 my-2 flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-medium text-gray-800">My Cases</h1>
            <p className="text-gray-600 font-light">
              View and manage all your legal matters
            </p>
          </div>
          <Link
            to="/client/newcase"
            className="bg-tertiary text-white px-4 py-2 rounded-md shadow-400 hover:scale-95 ease-in-out duration-300 flex items-center"
          >
            <FaPlus className="mr-2" /> File New Case
          </Link>
        </div>

        {/* Tab Navigation */}
        <div className="w-[630px] mb-6 mx-5 rounded-lg shadow-md bg-tertiary bg-opacity-15">
          <div className="p-2">
            <nav className="-mb-px gap-10 flex">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-8 text-center font-medium transition-all  ${
                    activeTab === tab
                      ? "bg-white rounded-lg"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {filteredCases.length === 0 ? (
          <div className=" bg-white rounded-lg shadow-sm p-8 text-center">
            {cases.length === 0 ? (
              <>
                <div className="text-gray-400 mb-4">
                  <FaFile className="text-6xl mx-auto mb-4" />
                </div>
                <h2 className="text-xl font-medium text-gray-700 mb-2">
                  No Cases Filed Yet
                </h2>
                <p className="text-gray-500 mb-6">
                  You haven't filed any cases yet. Start by filing your first
                  case.
                </p>
                <Link
                  to="/client/newcase"
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors inline-flex items-center"
                >
                  <FaPlus className="mr-2" />
                  File Your First Case
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-xl font-medium text-gray-700 mb-2">
                  No Cases Found
                </h2>
                <p className="text-gray-500 mb-6">
                  No cases match your selected filter.
                </p>
                <button
                  onClick={() => setActiveTab("All Cases")}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-300 transition-colors inline-block"
                >
                  View All Cases
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="mx-5 bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filing Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentCases.map((caseItem) => (
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {caseItem.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {caseItem.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseItem.filingDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(caseItem.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/client/case/${caseItem.id}`}
                          className="text-green-600 hover:text-green-900 flex items-center"
                        >
                          <FaEye className="mr-1" />
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 mx-5 flex justify-end">
              <nav className="flex items-center">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-white border border-2 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Previous
                </button>

                <button
                  onClick={() => setCurrentPage(1)}
                  className={`mx-1 px-3 py-1 rounded-md ${
                    currentPage === 1
                      ? "bg-green-500 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  1
                </button>

                <button
                  onClick={() => setCurrentPage(2)}
                  className={`mx-1 px-3 py-1 rounded-md ${
                    currentPage === 2
                      ? "bg-green-500 text-white"
                      : "bg-white border border-2 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  2
                </button>

                <button
                  onClick={() => setCurrentPage(3)}
                  className={`mx-1 px-3 py-1 rounded-md ${
                    currentPage === 3
                      ? "bg-green-500 text-white"
                      : "bg-white border border-2 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  3
                </button>

                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages
                      ? "bg-white border border-2 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </>
        )}
      </ClientLayout>
    </section>
  );
};

export default MyCases;
