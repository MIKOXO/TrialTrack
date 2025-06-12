/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import {
  FaFileAlt,
  FaCalendarAlt,
  FaInfoCircle,
  FaTrash,
} from "react-icons/fa";
import { reportsAPI } from "../../services/api";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";

const AdminReports = () => {
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  // Form state
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [caseNumber, setCaseNumber] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // Report types
  const reportTypes = [
    { id: 1, name: "Case Summary" },
    { id: 2, name: "Hearing Report" },
    { id: 3, name: "Statistical Analysis" },
    { id: 4, name: "Financial Report" },
    { id: 5, name: "Performance Metrics" },
  ];

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await reportsAPI.getReports();
        setReports(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports. Please try again later.");
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!reportTitle.trim()) {
      errors.reportTitle = "Report title is required";
    }

    if (!reportType) {
      errors.reportType = "Please select a report type";
    }

    if (!caseNumber.trim()) {
      errors.caseNumber = "Case number is required";
    }

    if (!reportDescription.trim()) {
      errors.reportDescription = "Report description is required";
    } else if (reportDescription.trim().length < 10) {
      errors.reportDescription =
        "Description must be at least 10 characters long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      showError("Please fix the form errors before submitting");
      return;
    }

    try {
      setSubmitLoading(true);

      // Create report data
      const reportData = {
        title: reportTitle.trim(),
        type: reportType,
        caseNumber: caseNumber.trim(),
        date: reportDate || new Date().toISOString().split("T")[0],
        description: reportDescription.trim(),
      };

      // Make API call to create the report
      const response = await reportsAPI.createReport(reportData);

      // Add new report to the list
      setReports([response.data, ...reports]);

      // Reset form
      setReportTitle("");
      setReportType("");
      setCaseNumber("");
      setReportDate("");
      setReportDescription("");
      setFormErrors({});

      showSuccess("Report created successfully!");
    } catch (error) {
      console.error("Error creating report:", error);
      showError(
        error.response?.data?.message ||
          "Failed to create report. Please try again."
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      await reportsAPI.deleteReport(reportId);
      setReports(reports.filter((report) => report._id !== reportId));
      alert("Report deleted successfully!");
    } catch (error) {
      console.error("Error deleting report:", error);
      alert("Failed to delete report. Please try again.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-lg">Loading reports...</p>
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
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Reports</h1>
          <p className="text-gray-600 font-light">
            Create and manage case-related reports
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Report Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium mb-4">File a new Report</h2>
              <p className="text-gray-600 text-sm mb-4">
                Complete the form below to submit a new report.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Enter report title"
                    className={`w-full p-2 border rounded-md ${
                      formErrors.reportTitle
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-green-500"
                    } focus:outline-none focus:ring-2`}
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />
                  {formErrors.reportTitle && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.reportTitle}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <select
                      className={`w-full p-2 border rounded-md ${
                        formErrors.reportType
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-tertiary"
                      } focus:outline-none focus:ring-1`}
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="">Select report type</option>
                      {reportTypes.map((type) => (
                        <option key={type.id} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.reportType && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.reportType}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Enter case no"
                        className={`w-full p-2 border rounded-md ${
                          formErrors.caseNumber
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-tertiary"
                        } focus:outline-none focus:ring-1`}
                        value={caseNumber}
                        onChange={(e) => setCaseNumber(e.target.value)}
                      />
                      {formErrors.caseNumber && (
                        <p className="text-red-500 text-sm mt-1">
                          {formErrors.caseNumber}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-tertiary"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                      />
                      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <textarea
                    placeholder="Enter detailed report description"
                    className={`w-full p-2 border rounded-md h-32 ${
                      formErrors.reportDescription
                        ? "border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:ring-tertiary"
                    } focus:outline-none focus:ring-1`}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                  ></textarea>
                  {formErrors.reportDescription && (
                    <p className="text-red-500 text-sm mt-1">
                      {formErrors.reportDescription}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="bg-tertiary text-white px-4 py-2 rounded-md shadow-400 hover:scale-95 ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitLoading ? "Submitting..." : "Submit Report"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Report Information */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium mb-4">Report Information</h2>

              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Report Types</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Select the appropriate report type for accurate categorization
                  and tracking.
                </p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {reportTypes.map((type) => (
                    <li key={type.id} className="flex items-start">
                      <FaFileAlt className="text-gray-400 mt-1 mr-2" />
                      <span>{type.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-md font-medium mb-2">Report Guidelines</h3>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li className="flex items-start">
                    <FaInfoCircle className="text-gray-400 mt-1 mr-2" />
                    <span>Be specific and detailed in your descriptions.</span>
                  </li>
                  <li className="flex items-start">
                    <FaInfoCircle className="text-gray-400 mt-1 mr-2" />
                    <span>Include all relevant case information</span>
                  </li>
                  <li className="flex items-start">
                    <FaInfoCircle className="text-gray-400 mt-1 mr-2" />
                    <span>Attach supporting documents when needed.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Reports */}
        {reports.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-medium mb-4">Recent Reports</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Title
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Case Number
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reports.map((report) => (
                    <tr key={report._id || report.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {report.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {report.type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {report.caseNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(
                          report.date || report.createdAt
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-green-600 hover:text-green-900 mr-3">
                          View
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteReport(report._id || report.id)
                          }
                          className="text-red-600 hover:text-red-900 flex items-center"
                        >
                          <FaTrash className="mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </AdminLayout>
    </section>
  );
};

export default AdminReports;
