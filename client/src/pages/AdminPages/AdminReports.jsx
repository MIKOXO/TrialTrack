/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { FaFileAlt, FaCalendarAlt, FaInfoCircle } from "react-icons/fa";

const AdminReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);

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

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!reportTitle || !reportType || !caseNumber || !reportDescription) {
      alert("Please fill in all required fields");
      return;
    }

    // In a real application, we would make an API call to create the report
    // For now, we'll just add it to our local state
    const newReport = {
      id: Date.now(),
      title: reportTitle,
      type: reportType,
      caseNumber,
      date: reportDate || new Date().toISOString().split("T")[0],
      description: reportDescription,
      createdAt: new Date().toISOString(),
    };

    setReports([newReport, ...reports]);

    // Reset form
    setReportTitle("");
    setReportType("");
    setCaseNumber("");
    setReportDate("");
    setReportDescription("");

    alert("Report submitted successfully!");
  };

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
                <div className="mb-4 relative">
                  <input
                    type="text"
                    className="peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary"
                    value={reportTitle}
                    onChange={(e) => setReportTitle(e.target.value)}
                  />

                  <label
                    htmlFor="title"
                    className={`absolute left-6 text-gray-500 duration-200 transition-all top-2.5 peer-focus:text-tertiary peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 "
                    `}
                  >
                    Enter Report Title
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <select
                      className="w-full py-4 px-5 text-gray-500 border border-gray-300 rounded-md focus:ring-1 focus:ring-tertiary"
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
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative">
                    <input
                      type="text"
                      className="peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary"
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                    />

                    <label
                      htmlFor="title"
                      className={`absolute left-2 text-gray-500 duration-200 transition-all top-2.5 peer-focus:text-tertiary peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 "
                    `}
                    >
                      Enter Case No
                    </label>

                    <div className="relative">
                      <input
                        type="date"
                        className="w-full py-4 px-1 border border-gray-300 rounded-md"
                        value={reportDate}
                        onChange={(e) => setReportDate(e.target.value)}
                      />
                      <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="mb-4 relative">
                  <textarea
                    className="peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary h-44"
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                  ></textarea>
                  <label
                    htmlFor="title"
                    className={`absolute left-6 text-gray-500 duration-200 transition-all top-2.5 peer-focus:text-tertiary peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 "
                    `}
                  >
                    Enter detailed report description
                  </label>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-tertiary text-primary px-7 py-3 w-ful rounded-lg text-lg shadow-400 hover:shadow ease-in-out duration-300"
                  >
                    Submit Report
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
                    <tr key={report.id}>
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
                        {new Date(report.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-green-600 hover:text-green-900 mr-3">
                          View
                        </button>
                        <button className="text-red-600 hover:text-red-900">
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
