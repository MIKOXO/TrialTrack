/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { FaSearch, FaEye, FaTrash } from "react-icons/fa";

const AdminUsers = () => {
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "John Doe",
      role: "Client",
      email: "JohnDoe@example.com",
      joinDate: "2019-03-02",
    },
    {
      id: 2,
      name: "Jane Doe",
      role: "Admin",
      email: "JaneDoe22@example.com",
      joinDate: "2022-02-12",
    },
    {
      id: 3,
      name: "Mike Ross",
      role: "Judge",
      email: "MikeRoss12@example.com",
      joinDate: "2024-12-12",
    },
    {
      id: 4,
      name: "Jessica Miles",
      role: "Client",
      email: "JessMiles@example.com",
      joinDate: "2024-08-22",
    },
    {
      id: 5,
      name: "Harvey Specter",
      role: "Judge",
      email: "Harvey123@example.com",
      joinDate: "2020-01-01",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Users");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // User statistics
  const totalUsers = users.length;
  const activeClients = users.filter((user) => user.role === "Client").length;
  const activeJudges = users.filter((user) => user.role === "Judge").length;
  const adminStaff = users.filter((user) => user.role === "Admin").length;

  // Filter users based on search query and active tab
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === "All Users" ||
      (activeTab === "Clients" && user.role === "Client") ||
      (activeTab === "Judges" && user.role === "Judge") ||
      (activeTab === "Admins" && user.role === "Admin");

    return matchesSearch && matchesTab;
  });

  // Pagination
  const usersPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  // Handle user deletion
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = () => {
    // In a real app, you would make an API call here
    const updatedUsers = users.filter((user) => user.id !== selectedUser.id);
    setUsers(updatedUsers);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <section>
      <AdminLayout>
        <div className="mb-4">
          <h1 className="text-xl font-semibold text-gray-800">Users</h1>
          <p className="text-gray-600 font-light">
            Manage all users in the court system.
          </p>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-500 mb-1">Total Users</h3>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-500 mb-1">Active Clients</h3>
            <p className="text-2xl font-bold">{activeClients}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-500 mb-1">Active Judges</h3>
            <p className="text-2xl font-bold">{activeJudges}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="text-sm text-gray-500 mb-1">Administrative Staff</h3>
            <p className="text-2xl font-bold">{adminStaff}</p>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="mb-6 w-[515px] rounded-lg shadow-md bg-tertiary bg-opacity-15">
          <div className="flex flex-col md:flex-row p-2">
            <div className="flex border-b md:border-b-0 overflow-x-auto">
              <button
                className={`py-3 px-8 text-center font-medium transition-all  ${
                  activeTab === "All Users"
                    ? "bg-white rounded-lg"
                    : "border-transparent text-gray-500"
                }`}
                onClick={() => setActiveTab("All Users")}
              >
                All Users
              </button>
              <button
                className={`py-3 px-8 text-center font-medium transition-all  ${
                  activeTab === "Clients"
                    ? "bg-white rounded-lg"
                    : "border-transparent text-gray-500"
                }`}
                onClick={() => setActiveTab("Clients")}
              >
                Clients
              </button>
              <button
                className={`py-3 px-8 text-center font-medium transition-all  ${
                  activeTab === "Judges"
                    ? "bg-white rounded-lg"
                    : "border-transparent text-gray-500"
                }`}
                onClick={() => setActiveTab("Judges")}
              >
                Judges
              </button>
              <button
                className={`py-3 px-8 text-center font-medium transition-all  ${
                  activeTab === "Admins"
                    ? "bg-white rounded-lg"
                    : "border-transparent text-gray-500"
                }`}
                onClick={() => setActiveTab("Admins")}
              >
                Admins
              </button>
            </div>
            {/* <div className="flex-grow p-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div> */}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Role
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Email
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Join Date
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
              {currentUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.role}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(user.joinDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200"
                        onClick={() => console.log(`View ${user.name}`)}
                      >
                        View
                      </button>
                      <button
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200"
                        onClick={() => openDeleteModal(user)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } border border-gray-300`}
            >
              Previous
            </button>

            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
              // Show current page and adjacent pages
              let pageToShow;
              if (totalPages <= 3) {
                pageToShow = i + 1;
              } else if (currentPage === 1) {
                pageToShow = i + 1;
              } else if (currentPage === totalPages) {
                pageToShow = totalPages - 2 + i;
              } else {
                pageToShow = currentPage - 1 + i;
              }

              return (
                <button
                  key={pageToShow}
                  onClick={() => setCurrentPage(pageToShow)}
                  className={`w-10 h-10 rounded-md ${
                    currentPage === pageToShow
                      ? "bg-green-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  } border border-gray-300`}
                >
                  {pageToShow}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } border border-gray-300`}
            >
              Next
            </button>
          </div>
        )}

        {/* Delete User Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Delete User</h2>
              <p className="mb-4">
                Are you sure you want to delete{" "}
                <span className="font-medium">{selectedUser?.name}</span>? This
                action cannot be undone.
              </p>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminLayout>
    </section>
  );
};

export default AdminUsers;
