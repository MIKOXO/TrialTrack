/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { AdminPageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
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
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Form state
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState("");
  const [priority, setPriority] = useState("");
  const [department, setDepartment] = useState("");
  const [reportDate, setReportDate] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  // Report types
  const reportTypes = [
    { id: 1, name: "System Performance" },
    { id: 2, name: "Case Management" },
    { id: 3, name: "User Activity" },
    { id: 4, name: "Security Audit" },
    { id: 5, name: "Financial Summary" },
    { id: 6, name: "Operational Issues" },
  ];

  // Priority levels
  const priorityLevels = [
    { id: 1, name: "Low", color: "text-green-600" },
    { id: 2, name: "Medium", color: "text-yellow-600" },
    { id: 3, name: "High", color: "text-orange-600" },
    { id: 4, name: "Critical", color: "text-red-600" },
  ];

  // Departments
  const departments = [
    { id: 1, name: "Administration" },
    { id: 2, name: "IT Support" },
    { id: 3, name: "Legal Affairs" },
    { id: 4, name: "Operations" },
  ];

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await reportsAPI.getReports();
        console.log("Fetched reports:", response.data);
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

    if (!priority) {
      errors.priority = "Please select a priority level";
    }

    if (!department) {
      errors.department = "Please select a department";
    }

    if (!reportDescription.trim()) {
      errors.reportDescription = "Report description is required";
    } else if (reportDescription.trim().length < 20) {
      errors.reportDescription =
        "Description must be at least 20 characters long";
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
        priority: priority,
        department: department,
        date: reportDate || new Date().toISOString().split("T")[0],
        description: reportDescription.trim(),
      };

      // Make API call to create the report
      const response = await reportsAPI.createReport(reportData);

      // Add new report to the list
      console.log("New report created:", response.data);
      setReports([response.data, ...reports]);

      // Reset form
      setReportTitle("");
      setReportType("");
      setPriority("");
      setDepartment("");
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

  // Handle view report
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  // Handle report deletion
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return;
    }

    try {
      await reportsAPI.deleteReport(reportId);
      setReports(reports.filter((report) => report._id !== reportId));
      showSuccess("Report deleted successfully!");
    } catch (error) {
      console.error("Error deleting report:", error);
      showError("Failed to delete report. Please try again.");
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminPageLoader message="Loading reports..." />
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Form */}
          <div>
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

                  <div>
                    <select
                      className={`w-full p-2 border rounded-md ${
                        formErrors.priority
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-tertiary"
                      } focus:outline-none focus:ring-1`}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                    >
                      <option value="">Select priority level</option>
                      {priorityLevels.map((level) => (
                        <option key={level.id} value={level.name}>
                          {level.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.priority && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.priority}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <select
                      className={`w-full p-2 border rounded-md ${
                        formErrors.department
                          ? "border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:ring-tertiary"
                      } focus:outline-none focus:ring-1`}
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      <option value="">Select department</option>
                      {departments.map((dept) => (
                        <option key={dept.id} value={dept.name}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {formErrors.department && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.department}
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
                  <LoadingButton
                    type="submit"
                    loading={submitLoading}
                    loadingText="Submitting..."
                    className="bg-tertiary text-white px-4 py-2 rounded-md shadow-400 hover:scale-95 ease-in-out duration-300"
                  >
                    Submit Report
                  </LoadingButton>
                </div>
              </form>
            </div>

            {/* Submitted Reports */}
            {reports.length > 0 && (
              <div className="mt-6">
                <h2 className="text-lg font-medium mb-4">Submitted Reports</h2>
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                            Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                            Priority
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                            Department
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reports.map((report) => (
                          <tr
                            key={report._id || report.id}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">
                                {report.title}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                {report.type || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                                  report.priority === "Critical"
                                    ? "bg-red-100 text-red-800"
                                    : report.priority === "High"
                                    ? "bg-orange-100 text-orange-800"
                                    : report.priority === "Medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : report.priority === "Low"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {report.priority || "N/A"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-600 font-medium">
                                {report.department || "N/A"}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {new Date(
                                report.date || report.createdAt
                              ).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 text-sm font-medium">
                              <button
                                onClick={() => handleViewReport(report)}
                                className="text-green-600 hover:text-green-900 mr-3 px-2 py-1 rounded hover:bg-green-50"
                              >
                                View
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteReport(report._id || report.id)
                                }
                                className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Report Information */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-medium mb-4">Report Information</h2>

              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Report Types</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Select the appropriate report type for accurate
                  categorization.
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

              <div className="mb-6">
                <h3 className="text-md font-medium mb-2">Priority Levels</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  {priorityLevels.map((level) => (
                    <li key={level.id} className="flex items-center">
                      <div
                        className={`w-3 h-3 rounded-full mr-2 ${
                          level.name === "Critical"
                            ? "bg-red-500"
                            : level.name === "High"
                            ? "bg-orange-500"
                            : level.name === "Medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                      <span>{level.name}</span>
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
                    <span>Select appropriate priority and department.</span>
                  </li>
                  <li className="flex items-start">
                    <FaInfoCircle className="text-gray-400 mt-1 mr-2" />
                    <span>Provide at least 20 characters in description.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* View Report Modal */}
        {showViewModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Report Details
                </h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Report Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-900 font-medium">
                      {selectedReport.title}
                    </p>
                  </div>
                </div>

                {/* Report Type and Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Type
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-blue-100 text-blue-800">
                        {selectedReport.type || "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <span
                        className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                          selectedReport.priority === "Critical"
                            ? "bg-red-100 text-red-800"
                            : selectedReport.priority === "High"
                            ? "bg-orange-100 text-orange-800"
                            : selectedReport.priority === "Medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedReport.priority === "Low"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedReport.priority || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Department and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-gray-900">
                        {selectedReport.department || "N/A"}
                      </p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <p className="text-gray-900">
                        {new Date(
                          selectedReport.date || selectedReport.createdAt
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {selectedReport.description}
                    </p>
                  </div>
                </div>

                {/* Report ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Report ID
                  </label>
                  <div className="p-3 bg-gray-50 rounded-md">
                    <p className="text-gray-600 font-mono text-sm">
                      {selectedReport._id || selectedReport.id}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleDeleteReport(selectedReport._id || selectedReport.id);
                    setShowViewModal(false);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                >
                  <FaTrash className="mr-2" />
                  Delete Report
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </AdminLayout>
    </section>
  );
};

export default AdminReports;
