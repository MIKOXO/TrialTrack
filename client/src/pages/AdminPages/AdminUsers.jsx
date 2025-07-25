/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import AdminLayout from "../../components/AdminLayout";
import ProfileAvatar from "../../components/ProfileAvatar";
import { AdminPageLoader } from "../../components/PageLoader";
import LoadingButton from "../../components/LoadingButton";
import { FormLoadingOverlay } from "../../components/LoadingOverlay";
import ResponsiveTable from "../../components/ResponsiveTable";
import {
  FaSearch,
  FaEye,
  FaTrash,
  FaPlus,
  FaGavel,
  FaTimes,
  FaEyeSlash,
  FaUser,
  FaEnvelope,
  FaFileAlt,
  FaCalendarAlt,
  FaClock,
  FaChartBar,
  FaHistory,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { authAPI, casesAPI, hearingsAPI } from "../../services/api";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import { validatePasswordStrength } from "../../utils/passwordValidation";
import PasswordRequirements from "../../components/PasswordRequirements";

const AdminUsers = () => {
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
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
  const [showPassword, setShowPassword] = useState(false);

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

    // Listen for profile picture updates
    const handleProfilePictureUpdate = () => {
      fetchUsers();
    };

    window.addEventListener(
      "profilePictureUpdated",
      handleProfilePictureUpdate
    );

    return () => {
      window.removeEventListener(
        "profilePictureUpdated",
        handleProfilePictureUpdate
      );
    };
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
      setShowDeleteModal(false);
      return;
    }

    // Prevent deletion of the last admin
    const adminCount = users.filter((user) => user.role === "Admin").length;
    if (selectedUser.role === "Admin" && adminCount === 1) {
      showError(
        "Cannot delete the last admin account. At least one admin must remain in the system."
      );
      setShowDeleteModal(false);
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

  // Table columns configuration
  const tableColumns = [
    {
      key: "user",
      header: "User",
      mobileLabel: "User",
      render: (value, row) => (
        <div className="flex items-center">
          <ProfileAvatar
            user={{
              username: row.name,
              firstName: row.firstName,
              lastName: row.lastName,
              role: row.role,
              email: row.email,
              profilePicture: row.profilePicture,
            }}
            size="sm"
            className="mr-3"
          />
          <div className="text-sm font-medium text-gray-900">{row.name}</div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      mobileLabel: "Role",
    },
    {
      key: "email",
      header: "Email",
      mobileLabel: "Email",
    },
    {
      key: "joinDate",
      header: "Join Date",
      mobileLabel: "Joined",
      render: (value) => formatDate(value),
    },
    {
      key: "actions",
      header: "Actions",
      mobileLabel: "Actions",
      render: (value, row) => {
        // Get current user to check if they're trying to delete their own account
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const isCurrentUser = row.id === currentUser._id;
        const isLastAdmin =
          row.role === "Admin" &&
          users.filter((user) => user.role === "Admin").length === 1;
        const shouldDisableDelete = isCurrentUser || isLastAdmin;

        return (
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
            <button
              className="bg-green-100 text-green-800 px-3 py-1 rounded-md hover:bg-green-200 flex items-center justify-center space-x-1"
              onClick={() => openUserDetailsModal(row)}
            >
              <FaEye />
              <span>View</span>
            </button>
            <button
              className={`px-3 py-1 rounded-md flex items-center justify-center space-x-1 ${
                shouldDisableDelete
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
              onClick={() => !shouldDisableDelete && openDeleteModal(row)}
              disabled={shouldDisableDelete}
              title={
                isCurrentUser
                  ? "You cannot delete your own account"
                  : isLastAdmin
                  ? "Cannot delete the last admin account"
                  : "Delete user"
              }
            >
              <FaTrash />
              <span>Delete</span>
            </button>
          </div>
        );
      },
    },
  ];

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
    setShowPassword(false);
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
        <div className="mb-4 px-4 md:px-0">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 md:gap-0">
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-semibold text-gray-800">
                Users
              </h1>
              <p className="text-gray-600 font-light text-sm md:text-base">
                Manage all users in the court system.
              </p>
            </div>
            <LoadingButton
              onClick={() => setShowCreateJudgeModal(true)}
              className="w-full md:w-auto bg-tertiary text-white px-4 md:px-7 py-2 rounded-lg shadow-400 hover:scale-95 ease-in-out duration-300 flex items-center justify-center space-x-2 text-sm md:text-base"
            >
              <FaGavel />
              <span>Add Judge</span>
            </LoadingButton>
          </div>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6 px-4 md:px-0">
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <h3 className="text-xs md:text-sm text-gray-500 mb-1">
              Total Users
            </h3>
            <p className="text-lg md:text-2xl font-bold">{totalUsers}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <h3 className="text-xs md:text-sm text-gray-500 mb-1">
              Active Clients
            </h3>
            <p className="text-lg md:text-2xl font-bold">{activeClients}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <h3 className="text-xs md:text-sm text-gray-500 mb-1">
              Active Judges
            </h3>
            <p className="text-lg md:text-2xl font-bold">{activeJudges}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-3 md:p-4">
            <h3 className="text-xs md:text-sm text-gray-500 mb-1">
              Administrative Staff
            </h3>
            <p className="text-lg md:text-2xl font-bold">{adminStaff}</p>
          </div>
        </div>

        {/* Tabs and Search */}
        <div className="mb-4 md:mb-6 mx-4 md:mx-0 max-w-full md:w-[515px] rounded-lg shadow-md bg-tertiary bg-opacity-15">
          <div className="flex flex-col md:flex-row p-2">
            <div className="flex border-b md:border-b-0 overflow-x-auto min-w-full md:min-w-0">
              <button
                className={`py-2 md:py-3 px-4 md:px-8 text-center font-medium transition-all text-sm md:text-base whitespace-nowrap ${
                  activeTab === "All Users"
                    ? "bg-white rounded-lg"
                    : "border-transparent text-gray-500"
                }`}
                onClick={() => setActiveTab("All Users")}
              >
                All Users
              </button>
              <button
                className={`py-2 md:py-3 px-4 md:px-8 text-center font-medium transition-all text-sm md:text-base whitespace-nowrap ${
                  activeTab === "Clients"
                    ? "bg-white rounded-lg"
                    : "border-transparent text-gray-500"
                }`}
                onClick={() => setActiveTab("Clients")}
              >
                Clients
              </button>
              <button
                className={`py-2 md:py-3 px-4 md:px-8 text-center font-medium transition-all text-sm md:text-base whitespace-nowrap ${
                  activeTab === "Judges"
                    ? "bg-white rounded-lg"
                    : "border-transparent text-gray-500"
                }`}
                onClick={() => setActiveTab("Judges")}
              >
                Judges
              </button>
              <button
                className={`py-2 md:py-3 px-4 md:px-8 text-center font-medium transition-all text-sm md:text-base whitespace-nowrap ${
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
        <div className="mb-4 md:mb-6 px-4 md:px-0">
          <ResponsiveTable
            columns={tableColumns}
            data={currentUsers}
            emptyMessage="No users found"
            loading={false}
          />
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-center sm:justify-end mt-4 gap-2 sm:gap-2 px-4 md:px-0">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 md:px-4 py-2 rounded-md text-sm md:text-base ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              } border border-gray-300`}
            >
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </button>

            <div className="flex justify-center gap-1 sm:gap-2">
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
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-md text-sm md:text-base ${
                      currentPage === pageToShow
                        ? "bg-green-600 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                    } border border-gray-300`}
                  >
                    {pageToShow}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className={`px-3 md:px-4 py-2 rounded-md text-sm md:text-base ${
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                Delete User
              </h2>
              <p className="mb-4 md:mb-6 text-sm md:text-base break-words">
                Are you sure you want to delete{" "}
                <span className="font-medium">{selectedUser?.name}</span>? This
                action cannot be undone.
              </p>

              <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 ease-in-out duration-300 text-sm md:text-base order-2 md:order-1"
                >
                  Cancel
                </button>
                <LoadingButton
                  onClick={handleDeleteUser}
                  loading={deleteLoading}
                  loadingText="Deleting..."
                  className="w-full md:w-auto px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 ease-in-out duration-300 text-sm md:text-base order-1 md:order-2"
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
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
              <div className="relative top-4 md:top-20 mx-auto p-4 md:p-5 border w-full max-w-md shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base md:text-lg font-medium text-gray-900">
                      Add New Judge
                    </h3>
                    <button
                      onClick={closeJudgeModal}
                      className="text-gray-400 text-2xl hover:text-gray-600 p-1"
                    >
                      ×
                    </button>
                  </div>

                  <form
                    onSubmit={handleCreateJudge}
                    className="space-y-3 md:space-y-4"
                  >
                    <div className="mb-4 md:mb-6 relative">
                      <input
                        type="text"
                        name="username"
                        value={newJudge.username}
                        onChange={handleJudgeInputChange}
                        className={`peer w-full border border-gray-300 rounded-lg px-6 md:px-7 pt-4 md:pt-5 pb-2 text-sm md:text-base focus:border-transparent focus:outline-none focus:ring-1  ${
                          judgeErrors.username
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-tertiary"
                        }`}
                      />
                      <button
                        type="button"
                        className="absolute right-3 md:right-4 top-3 md:top-4 text-gray-400 hover:text-tertiary transition-colors"
                      >
                        <FaUser className="text-sm md:text-base" />
                      </button>
                      <label
                        className={`absolute left-5 md:left-6 text-gray-500 duration-200 transition-all text-sm md:text-base ${
                          newJudge.username
                            ? " -top-2.5 bg-white px-1"
                            : " top-2 md:top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
                        }`}
                      >
                        Full Name
                      </label>
                      {judgeErrors.username && (
                        <p className="text-xs md:text-sm text-red-500 mt-1">
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
                      <button
                        type="button"
                        className="absolute right-4 top-4 text-gray-400 hover:text-tertiary transition-colors"
                      >
                        <FaEnvelope />
                      </button>
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
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={newJudge.password}
                        onChange={handleJudgeInputChange}
                        onFocus={() => setIsPasswordFocused(true)}
                        onBlur={() => setIsPasswordFocused(false)}
                        className={`peer w-full border border-gray-300 rounded-lg pl-7 pr-12 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                          judgeErrors.password
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-tertiary"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-tertiary transition-colors"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
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
                        type={showPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={newJudge.confirmPassword}
                        onChange={handleJudgeInputChange}
                        className={`peer w-full border border-gray-300 rounded-lg pl-7 pr-12 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                          judgeErrors.confirmPassword
                            ? "border-red-500 focus:ring-red-500"
                            : "border-gray-300 focus:ring-tertiary"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-4 text-gray-400 hover:text-tertiary transition-colors"
                      >
                        {showPassword ? (
                          <FaEyeSlash className="w-4 h-4" />
                        ) : (
                          <FaEye className="w-4 h-4" />
                        )}
                      </button>
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

                    <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3 pt-4">
                      <button
                        type="button"
                        onClick={closeJudgeModal}
                        className="w-full md:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 ease-in-out duration-300 rounded-md hover:bg-gray-300 order-2 md:order-1"
                      >
                        Cancel
                      </button>
                      <LoadingButton
                        type="submit"
                        loading={createJudgeLoading}
                        loadingText="Creating..."
                        className="w-full md:w-auto px-5 py-3 text-sm font-medium text-white bg-tertiary ease-in-out duration-300 rounded-md hover:bg-green-700 order-1 md:order-2"
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
  const [userStats, setUserStats] = useState({
    cases: { total: 0, open: 0, inProgress: 0, closed: 0 },
    hearings: { total: 0, upcoming: 0, completed: 0 },
    loading: true,
  });
  const [activityHistory, setActivityHistory] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

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

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return formatDate(dateString);
  };

  // Fetch user statistics and activity
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setStatsLoading(true);

        // Fetch all cases and hearings
        const [casesResponse, hearingsResponse] = await Promise.all([
          casesAPI.getCases(),
          hearingsAPI.getHearings().catch(() => ({ data: [] })), // Handle if user can't access hearings
        ]);

        const allCases = casesResponse.data;
        const allHearings = hearingsResponse.data;

        // Filter cases based on user role
        let userCases = [];
        if (user.role === "Client") {
          userCases = allCases.filter(
            (c) => c.client?._id === user.id || c.client?.id === user.id
          );
        } else if (user.role === "Judge") {
          userCases = allCases.filter(
            (c) => c.judge?._id === user.id || c.judge?.id === user.id
          );
        } else {
          // Admin can see all cases for overview
          userCases = allCases;
        }

        // Calculate case statistics
        const caseStats = {
          total: userCases.length,
          open: userCases.filter((c) => c.status === "Open").length,
          inProgress: userCases.filter((c) => c.status === "In Progress")
            .length,
          closed: userCases.filter((c) => c.status === "Closed").length,
        };

        // Filter hearings based on user role
        let userHearings = [];
        if (user.role === "Judge") {
          userHearings = allHearings.filter(
            (h) => h.judge?._id === user.id || h.judge?.id === user.id
          );
        } else if (user.role === "Client") {
          // Get hearings for user's cases
          const userCaseIds = userCases.map((c) => c._id || c.id);
          userHearings = allHearings.filter((h) =>
            userCaseIds.includes(h.case?._id || h.case?.id)
          );
        } else {
          // Admin can see all hearings for overview
          userHearings = allHearings;
        }

        // Calculate hearing statistics
        const now = new Date();
        const hearingStats = {
          total: userHearings.length,
          upcoming: userHearings.filter((h) => h.date && new Date(h.date) > now)
            .length,
          completed: userHearings.filter(
            (h) => h.date && new Date(h.date) <= now
          ).length,
        };

        // Generate activity history
        const activities = [];

        // Add case activities
        userCases.slice(0, 5).forEach((caseItem) => {
          activities.push({
            id: `case-${caseItem._id}`,
            type: "case",
            action:
              user.role === "Client"
                ? "Filed case"
                : user.role === "Judge"
                ? "Assigned to case"
                : "Case created",
            description: `${caseItem.title}`,
            date: caseItem.createdAt,
            status: caseItem.status,
            icon: FaFileAlt,
            color:
              caseItem.status === "Open"
                ? "text-green-600"
                : caseItem.status === "In Progress"
                ? "text-yellow-600"
                : "text-gray-600",
          });
        });

        // Add hearing activities
        userHearings.slice(0, 3).forEach((hearing) => {
          const isUpcoming = hearing.date && new Date(hearing.date) > now;
          activities.push({
            id: `hearing-${hearing._id}`,
            type: "hearing",
            action: isUpcoming ? "Upcoming hearing" : "Hearing completed",
            description: `${hearing.case?.title || "Case hearing"}`,
            date: hearing.date || hearing.createdAt,
            status: isUpcoming ? "Scheduled" : "Completed",
            icon: FaCalendarAlt,
            color: isUpcoming ? "text-blue-600" : "text-gray-600",
          });
        });

        // Add account creation activity
        activities.push({
          id: "account-created",
          type: "account",
          action: "Account created",
          description: `Joined as ${user.role}`,
          date: user.joinDate,
          status: "Completed",
          icon: FaUser,
          color: "text-green-600",
        });

        // Sort activities by date (most recent first)
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        setUserStats({
          cases: caseStats,
          hearings: hearingStats,
          loading: false,
        });
        setActivityHistory(activities.slice(0, 10)); // Show last 10 activities
      } catch (error) {
        console.error("Error fetching user stats:", error);
        setUserStats({
          cases: { total: 0, open: 0, inProgress: 0, closed: 0 },
          hearings: { total: 0, upcoming: 0, completed: 0 },
          loading: false,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [user.id, user.role, user.joinDate]);

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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 p-4">
      <div className="relative top-4 md:top-20 mx-auto p-4 md:p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-medium text-gray-900">
              User Details
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <FaTimes className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </div>

          {/* User Profile Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 md:mb-6 p-3 md:p-4 bg-gray-50 rounded-lg">
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
              className="border-2 border-white shadow-md mx-auto sm:mx-0 flex-shrink-0"
            />
            <div className="text-center sm:text-left min-w-0">
              <h4 className="text-base md:text-lg font-semibold text-gray-900 break-words">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.name}
              </h4>
              <p className="text-gray-600 text-sm md:text-base break-words">
                {user.email}
              </p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Basic Information */}
            <div className="space-y-3 md:space-y-4">
              <h5 className="text-base md:text-lg font-medium text-gray-900 border-b pb-2">
                Basic Information
              </h5>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <p className="mt-1 text-sm text-gray-900 break-words">
                  {user.name}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <p className="mt-1 text-sm text-gray-900 break-words">
                  {user.email}
                </p>
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
                <div className="mt-2">
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
                    showName={false}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {user.profilePicture
                      ? "Profile picture uploaded"
                      : "No profile picture"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Role-specific Information */}
          {user.role === "Judge" && (
            <div className="mb-6 p-4 bg-purple-50 rounded-lg">
              <h5 className="text-lg font-medium text-purple-900 mb-3 flex items-center">
                <FaGavel className="mr-2" />
                Judge Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-purple-700">
                    Assigned Cases
                  </label>
                  <p className="mt-1 text-lg font-semibold text-purple-900">
                    {statsLoading ? "Loading..." : userStats.cases.total}
                  </p>
                  <p className="text-xs text-purple-600">
                    {!statsLoading &&
                      `${userStats.cases.open} open, ${userStats.cases.inProgress} in progress`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-700">
                    Scheduled Hearings
                  </label>
                  <p className="mt-1 text-lg font-semibold text-purple-900">
                    {statsLoading ? "Loading..." : userStats.hearings.upcoming}
                  </p>
                  <p className="text-xs text-purple-600">
                    {!statsLoading &&
                      `${userStats.hearings.total} total hearings`}
                  </p>
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
              <h5 className="text-lg font-medium text-green-900 mb-3 flex items-center">
                <FaUser className="mr-2" />
                Client Information
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-green-700">
                    Filed Cases
                  </label>
                  <p className="mt-1 text-lg font-semibold text-green-900">
                    {statsLoading ? "Loading..." : userStats.cases.total}
                  </p>
                  <p className="text-xs text-green-600">
                    {!statsLoading &&
                      `${userStats.cases.open} open, ${userStats.cases.closed} closed`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">
                    Upcoming Hearings
                  </label>
                  <p className="mt-1 text-lg font-semibold text-green-900">
                    {statsLoading ? "Loading..." : userStats.hearings.upcoming}
                  </p>
                  <p className="text-xs text-green-600">
                    {!statsLoading &&
                      `${userStats.hearings.total} total hearings`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-green-700">
                    Account Status
                  </label>
                  <span className="mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {user.role === "Admin" && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h5 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
                <FaChartBar className="mr-2" />
                Administrator Overview
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-blue-700">
                    Total Cases (System)
                  </label>
                  <p className="mt-1 text-lg font-semibold text-blue-900">
                    {statsLoading ? "Loading..." : userStats.cases.total}
                  </p>
                  <p className="text-xs text-blue-600">
                    {!statsLoading &&
                      `${userStats.cases.open} open, ${userStats.cases.inProgress} in progress`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">
                    Total Hearings (System)
                  </label>
                  <p className="mt-1 text-lg font-semibold text-blue-900">
                    {statsLoading ? "Loading..." : userStats.hearings.total}
                  </p>
                  <p className="text-xs text-blue-600">
                    {!statsLoading && `${userStats.hearings.upcoming} upcoming`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-blue-700">
                    Admin Level
                  </label>
                  <p className="mt-1 text-sm text-blue-900">
                    System Administrator
                  </p>
                  <span className="mt-1 inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Full Access
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Activity History */}
          <div className="mb-6">
            <h5 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <FaHistory className="mr-2 text-gray-600" />
              Recent Activity
            </h5>
            {statsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-3 text-gray-500">Loading activity...</span>
              </div>
            ) : activityHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FaClock className="mx-auto w-12 h-12 text-gray-300 mb-3" />
                <p>No recent activity found</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activityHistory.map((activity) => {
                  const IconComponent = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full bg-white flex items-center justify-center ${activity.color}`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatRelativeTime(activity.date)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {activity.description}
                        </p>
                        <div className="flex items-center mt-1">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              activity.status === "Open" ||
                              activity.status === "Scheduled"
                                ? "bg-green-100 text-green-800"
                                : activity.status === "In Progress"
                                ? "bg-yellow-100 text-yellow-800"
                                : activity.status === "Completed" ||
                                  activity.status === "Closed"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {activity.status === "Open" && (
                              <FaCheckCircle className="w-3 h-3 mr-1" />
                            )}
                            {activity.status === "In Progress" && (
                              <FaExclamationCircle className="w-3 h-3 mr-1" />
                            )}
                            {activity.status === "Scheduled" && (
                              <FaCalendarAlt className="w-3 h-3 mr-1" />
                            )}
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row justify-end gap-3 md:gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors text-sm md:text-base"
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
