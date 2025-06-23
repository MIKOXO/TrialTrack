/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import ProfileAvatar from "../../components/ProfileAvatar";
import { AdminPageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import { FormLoadingOverlay } from "../../components/LoadingOverlay";
import {
  FaSearch,
  FaEye,
  FaTrash,
  FaPlus,
  FaGavel,
  FaTimes,
} from "react-icons/fa";
import { authAPI } from "../../services/api";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import { validatePasswordStrength } from "../../utils/passwordValidation";
import PasswordRequirements from "../../components/PasswordRequirements";

const AdminUsers = () => {
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All Users");
  const [currentPage, setCurrentPage] = useState(1);

  // Add Judge Modal States
  const [showCreateJudgeModal, setShowCreateJudgeModal] = useState(false);
  const [createJudgeLoading, setCreateJudgeLoading] = useState(false);
  const [newJudge, setNewJudge] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [judgeErrors, setJudgeErrors] = useState({});
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  // Fetch users data from backend
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
        profilePicture: user.profilePicture,
        firstName: user.firstName,
        lastName: user.lastName,
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

  useEffect(() => {
    fetchUsers();
  }, []);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);
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

  // Handle user details view
  const openUserDetailsModal = (user) => {
    setSelectedUser(user);
    setShowUserDetailsModal(true);
  };

  const closeUserDetailsModal = () => {
    setShowUserDetailsModal(false);
    setSelectedUser(null);
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

  // Add Judge Functions
  const validateJudgeForm = () => {
    const errs = {};
    if (!newJudge.username.trim()) errs.username = "Full name is required.";
    if (!newJudge.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(newJudge.email))
      errs.email = "Invalid email format.";

    // Enhanced password validation
    if (!newJudge.password) {
      errs.password = "Password is required.";
    } else {
      const passwordValidation = validatePasswordStrength(newJudge.password);
      if (!passwordValidation.isValid) {
        errs.password = passwordValidation.errors[0]; // Show first error
      }
    }

    if (!newJudge.confirmPassword)
      errs.confirmPassword = "Please confirm password.";
    else if (newJudge.password !== newJudge.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  // Check if all password requirements are met
  const areAllPasswordRequirementsMet = () => {
    const passwordValidation = validatePasswordStrength(newJudge.password);
    return passwordValidation.isValid;
  };

  const handleCreateJudge = async (e) => {
    e.preventDefault();
    const validationErrors = validateJudgeForm();
    setJudgeErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setCreateJudgeLoading(true);
      await authAPI.createJudge({
        username: newJudge.username,
        email: newJudge.email,
        password: newJudge.password,
      });

      showSuccess("Judge created successfully!");
      setShowCreateJudgeModal(false);
      setNewJudge({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
      setJudgeErrors({});
      fetchUsers(); // Reload the users list
    } catch (error) {
      console.error("Error creating judge:", error);
      showError(error.response?.data?.message || "Failed to create judge");
    } finally {
      setCreateJudgeLoading(false);
    }
  };

  const handleJudgeInputChange = (e) => {
    const { name, value } = e.target;
    setNewJudge((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (judgeErrors[name]) {
      setJudgeErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const closeJudgeModal = () => {
    setShowCreateJudgeModal(false);
    setNewJudge({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setJudgeErrors({});
  };

  if (loading) {
    return (
      <AdminLayout>
        <AdminPageLoader message="Loading users..." />
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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Users</h1>
              <p className="text-gray-600 font-light">
                Manage all users in the court system.
              </p>
            </div>
            <LoadingButton
              onClick={() => setShowCreateJudgeModal(true)}
              className="bg-tertiary text-white px-7 py-2 rounded-lg shadow-400 hover:scale-95 ease-in-out duration-300 flex items-center space-x-2"
            >
              <FaGavel />
              <span>Add Judge</span>
            </LoadingButton>
          </div>
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
                    <div className="flex items-center">
                      <ProfileAvatar
                        user={{
                          username: user.name,
                          firstName: user.firstName,
                          lastName: user.lastName,
                          role: user.role,
                          email: user.email,
                          profilePicture: user.profilePicture,
                        }}
                        size="sm"
                        className="mr-3"
                      />
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
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
                        className="bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200 flex items-center space-x-1"
                        onClick={() => openUserDetailsModal(user)}
                      >
                        <FaEye />
                        <span>View</span>
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
                <LoadingButton
                  onClick={handleDeleteUser}
                  loading={deleteLoading}
                  loadingText="Deleting..."
                  className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 ease-in-out duration-300"
                >
                  Delete User
                </LoadingButton>
              </div>
            </div>
          </div>
        )}

        {/* Create Judge Modal */}
        {showCreateJudgeModal && (
          <FormLoadingOverlay
            isVisible={createJudgeLoading}
            message="Creating judge..."
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Add New Judge
                    </h3>
                    <button
                      onClick={closeJudgeModal}
                      className="text-gray-400 text-2xl hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>

                  <form onSubmit={handleCreateJudge} className="space-y-4">
                    <div className="mb-6 relative">
                      <input
                        type="text"
                        name="username"
                        value={newJudge.username}
                        onChange={handleJudgeInputChange}
                        className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                          judgeErrors.username
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-tertiary"
                        }`}
                      />
                      <label
                        className={`absolute left-6 text-gray-500 duration-200 transition-all ${
                          newJudge.username
                            ? " text-base -top-2.5 bg-white px-1"
                            : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                        }`}
                      >
                        Full Name
                      </label>
                      {judgeErrors.username && (
                        <p className="text-sm text-red-500 mt-1">
                          {judgeErrors.username}
                        </p>
                      )}
                    </div>

                    <div className="mb-6 relative">
                      <input
                        type="email"
                        name="email"
                        value={newJudge.email}
                        onChange={handleJudgeInputChange}
                        className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                          judgeErrors.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-tertiary"
                        }`}
                      />
                      <label
                        className={`absolute left-6 text-gray-500 duration-200 transition-all ${
                          newJudge.email
                            ? " text-base -top-2.5 bg-white px-1"
                            : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                        }`}
                      >
                        Email
                      </label>
                      {judgeErrors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {judgeErrors.email}
                        </p>
                      )}
                    </div>

                    <div className="mb-6 relative">
                      <input
                        type="password"
                        name="password"
                        value={newJudge.password}
                        onChange={handleJudgeInputChange}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                          judgeErrors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-tertiary"
                        }`}
                      />
                      <label
                        className={`absolute left-6 text-gray-500 duration-200 transition-all ${
                          newJudge.password
                            ? " text-base -top-2.5 bg-white px-1"
                            : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                        }`}
                      >
                        Password
                      </label>
                      {judgeErrors.password && (
                        <p className="text-sm text-red-500 mt-1">
                          {judgeErrors.password}
                        </p>
                      )}
                      {!judgeErrors.password &&
                        isPasswordFocused &&
                        !areAllPasswordRequirementsMet() && (
                          <div className="transition-all duration-300 ease-in-out opacity-100 translate-y-0">
                            <PasswordRequirements
                              password={newJudge.password}
                            />
                          </div>
                        )}
                    </div>

                    <div className="mb-6 relative">
                      <input
                        type="password"
                        name="confirmPassword"
                        value={newJudge.confirmPassword}
                        onChange={handleJudgeInputChange}
                        className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                          judgeErrors.confirmPassword
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-tertiary"
                        }`}
                      />
                      <label
                        className={`absolute left-6 text-gray-500 duration-200 transition-all ${
                          newJudge.confirmPassword
                            ? " text-base -top-2.5 bg-white px-1"
                            : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                        }`}
                      >
                        Confirm Password
                      </label>
                      {judgeErrors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">
                          {judgeErrors.confirmPassword}
                        </p>
                      )}
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={closeJudgeModal}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 ease-in-out duration-300 rounded-md hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <LoadingButton
                        type="submit"
                        loading={createJudgeLoading}
                        loadingText="Creating..."
                        className="px-5 py-3 text-sm font-medium text-white bg-tertiary ease-in-out duration-300 rounded-md hover:bg-green-700"
                      >
                        Create Judge
                      </LoadingButton>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </FormLoadingOverlay>
        )}

        {/* User Details Modal */}
        {showUserDetailsModal && selectedUser && (
          <UserDetailsModal
            user={selectedUser}
            onClose={closeUserDetailsModal}
          />
        )}
      </AdminLayout>
    </section>
  );
};

// User Details Modal Component
const UserDetailsModal = ({ user, onClose }) => {
  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-blue-100 text-blue-800";
      case "Judge":
        return "bg-purple-100 text-purple-800";
      case "Client":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-medium text-gray-900">User Details</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="flex items-center space-x-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <ProfileAvatar
              user={{
                username: user.name,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                email: user.email,
                profilePicture: user.profilePicture,
              }}
              size="xl"
              className="border-2 border-white shadow-md"
            />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.name}
              </h4>
              <p className="text-gray-600">{user.email}</p>
              <span
                className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* User Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h5 className="text-lg font-medium text-gray-900 border-b pb-2">
                Basic Information
              </h5>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <p className="mt-1 text-sm text-gray-900">{user.role}</p>
              </div>

              {user.firstName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user.firstName}</p>
                </div>
              )}

              {user.lastName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <p className="mt-1 text-sm text-gray-900">{user.lastName}</p>
                </div>
              )}
            </div>

            {/* Account Information */}
            <div className="space-y-4">
              <h5 className="text-lg font-medium text-gray-900 border-b pb-2">
                Account Information
              </h5>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  User ID
                </label>
                <p className="mt-1 text-sm text-gray-900 font-mono">
                  {user.id}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Join Date
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {formatDate(user.joinDate)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Account Status
                </label>
                <span className="mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Profile Picture
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {user.profilePicture ? "Uploaded" : "Not uploaded"}
                </p>
              </div>
            </div>
          </div>

          {/* Role-specific Information */}
          {user.role === "Judge" && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h5 className="text-lg font-medium text-purple-900 mb-3">
                Judge Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700">
                    Assigned Cases
                  </label>
                  <p className="mt-1 text-sm text-purple-900">Loading...</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700">
                    Court Assignment
                  </label>
                  <p className="mt-1 text-sm text-purple-900">General Court</p>
                </div>
              </div>
            </div>
          )}

          {user.role === "Client" && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
              <h5 className="text-lg font-medium text-green-900 mb-3">
                Client Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700">
                    Filed Cases
                  </label>
                  <p className="mt-1 text-sm text-green-900">Loading...</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">
                    Case Status
                  </label>
                  <p className="mt-1 text-sm text-green-900">Active</p>
                </div>
              </div>
            </div>
          )}

          {user.role === "Admin" && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="text-lg font-medium text-blue-900 mb-3">
                Administrator Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700">
                    Admin Level
                  </label>
                  <p className="mt-1 text-sm text-blue-900">
                    System Administrator
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">
                    Permissions
                  </label>
                  <p className="mt-1 text-sm text-blue-900">Full Access</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminUsers;
