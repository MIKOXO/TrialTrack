/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import { FaSearch, FaEye, FaTrash } from "react-icons/fa";
import { authAPI } from "../../services/api";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Users");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch users data from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await authAPI.getUsers();
        const usersData = response.data;

        // Transform users data for display
        const transformedUsers = usersData.map((user) => ({
          id: user._id,
          name: user.username,
          role: user.role,
          email: user.email,
          joinDate: user.createdAt, // Keep as original date string
        }));

        setUsers(transformedUsers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to load users data. Please try again later.");
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);
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

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    // Prevent deletion of current admin user
    const currentUser = JSON.parse(localStorage.getItem("user"));
    if (selectedUser.id === currentUser._id) {
      showError("You cannot delete your own account");
      return;
    }

    try {
      setDeleteLoading(true);
      // Make API call to delete user
      await authAPI.deleteProfile(selectedUser.id);

      // Update local state
      const updatedUsers = users.filter((user) => user.id !== selectedUser.id);
      setUsers(updatedUsers);
      setShowDeleteModal(false);
      setSelectedUser(null);

      showSuccess(`User "${selectedUser.name}" deleted successfully!`);
    } catch (error) {
      console.error("Error deleting user:", error);
      showError(
        error.response?.data?.message ||
          "Failed to delete user. Please try again."
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  // Format date to display in a more readable format
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "2-digit", day: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-full">
          <p className="text-lg">Loading users...</p>
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deleteLoading}
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 ease-in-out duration-300"
                >
                  {deleteLoading ? "Deleting..." : "Delete User"}
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
