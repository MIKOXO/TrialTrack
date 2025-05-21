/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import ClientLayout from "../../components/ClientLayout";
import { FaUser, FaLock, FaCamera, FaTrash, FaCheck } from "react-icons/fa";
import profileImage from "../../assets/IMG6.jpg";

const ClientSettings = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [profilePicture, setProfilePicture] = useState(profileImage);
  const [profileForm, setProfileForm] = useState({
    name: "John Doe",
    email: "JohnDoe123@example.com",
    phone: "+251-000-000-000",
    role: "Litigant",
    bio: "I am a plaintiff seeking legal representation for a personal injury case.",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // In a real app, we would fetch the user data from the API
    // For now, we'll use the mock data already in state
    const mockUser = {
      name: "John Doe",
      email: "JohnDoe123@example.com",
      phone: "+251-000-000-000",
      role: "Litigant",
      bio: "I am a plaintiff seeking legal representation for a personal injury case.",
    };

    setUser(mockUser);
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm({
      ...profileForm,
      [name]: value,
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({
      ...passwordForm,
      [name]: value,
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfilePicture = () => {
    // Set to default silhouette image or similar
    setProfilePicture(null);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // In a real app, we would send the data to the API
    // For now, we'll simulate a successful update
    setTimeout(() => {
      setUser({
        ...profileForm,
        profilePicture,
      });
      setSuccess("Profile updated successfully");
      setLoading(false);
    }, 1000);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match");
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    // In a real app, we would send the data to the API
    // For now, we'll simulate a successful update
    setTimeout(() => {
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setSuccess("Password updated successfully");
      setLoading(false);
    }, 1000);
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // In a real app, we would send the data to the API
    // For now, we'll simulate a successful update
    setTimeout(() => {
      setSuccess("Notification settings updated successfully");
      setLoading(false);
    }, 1000);
  };

  return (
    <section>
      <ClientLayout>
        <div className="my-4 mx-7 px-5">
          <h1 className="text-xl font-semibold text-gray-800">Settings</h1>
          <p className="text-gray-600 font-light">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="mx-7 mb-5 py-3 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-2 flex border-b mb-6 mx-5 w-[330px] rounded-lg shadow-md bg-tertiary bg-opacity-15">
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "profile"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("profile")}
            >
              <FaUser className="inline mr-2" /> Profile
            </button>
            <button
              className={`py-3 px-8 text-center font-medium transition-all  ${
                activeTab === "password"
                  ? "bg-white rounded-lg"
                  : "border-transparent text-gray-500"
              }`}
              onClick={() => setActiveTab("password")}
            >
              <FaLock className="inline mr-2" /> Password
            </button>
            {/* <button
              className={`px-4 py-3 font-medium ${
                activeTab === "notifications"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-600 hover:text-green-600"
              }`}
              onClick={() => setActiveTab("notifications")}
            >
              <FaBell className="inline mr-2" /> Notifications
            </button> */}
          </div>

          <div className="p-6">
            {success && (
              <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative flex items-center">
                <FaCheck className="mr-2" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <span>{error}</span>
              </div>
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleProfileSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label
                      htmlFor="username"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Username
                    </label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={profileForm.username}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-gray-700 font-medium mb-2"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={profileForm.email}
                      onChange={handleProfileChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="phone"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="address"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={profileForm.address}
                    onChange={handleProfileChange}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                  ></textarea>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-tertiary text-white px-4 py-2 rounded-md shadow-400 hover:scale-95 ease-in-out duration-300 disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            )}

            {activeTab === "password" && (
              <form onSubmit={handlePasswordSubmit}>
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="newPassword"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-gray-700 font-medium mb-2"
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
                    required
                  />
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-tertiary text-white px-4 py-2 rounded-md shadow-400 hover:scale-95 ease-in-out duration-300 disabled:opacity-50"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}

            {/* {activeTab === "notifications" && (
              <form onSubmit={handleNotificationSubmit}>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="emailNotifications"
                      name="emailNotifications"
                      checked={notificationSettings.emailNotifications}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="emailNotifications"
                      className="ml-2 block text-gray-700"
                    >
                      Email Notifications
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="hearingReminders"
                      name="hearingReminders"
                      checked={notificationSettings.hearingReminders}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="hearingReminders"
                      className="ml-2 block text-gray-700"
                    >
                      Hearing Reminders (24 hours before)
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="caseUpdates"
                      name="caseUpdates"
                      checked={notificationSettings.caseUpdates}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="caseUpdates"
                      className="ml-2 block text-gray-700"
                    >
                      Case Status Updates
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="documentUploads"
                      name="documentUploads"
                      checked={notificationSettings.documentUploads}
                      onChange={handleNotificationChange}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor="documentUploads"
                      className="ml-2 block text-gray-700"
                    >
                      Document Upload Notifications
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </form>
            )} */}
          </div>
        </div>
      </ClientLayout>
    </section>
  );
};

export default ClientSettings;
