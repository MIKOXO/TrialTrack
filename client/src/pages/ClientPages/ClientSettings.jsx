/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import ClientLayout from "../../components/ClientLayout";
import {
  FaUser,
  FaLock,
  FaBell,
  FaCog,
  FaSave,
  FaCamera,
  FaTrash,
} from "react-icons/fa";
import { authAPI } from "../../services/api";
import useToast from "../../hooks/useToast";
import ToastContainer from "../../components/ToastContainer";
import LoadingButton from "../../components/LoadingButton";
import Spinner from "../../components/Spinner";

const ClientSettings = () => {
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [profilePicture, setProfilePicture] = useState(null);
  const [profileData, setProfileData] = useState({
    username: "",
    email: "",
    role: "Client",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    caseUpdates: true,
    hearingReminders: true,
    systemAlerts: true,
  });

  useEffect(() => {
    const loadUserProfile = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          setProfileData({
            username: user.username || "",
            email: user.email || "",
            role: user.role || "Client",
          });

          // Set profile picture if exists
          if (user.profilePicture) {
            setProfilePicture(
              `http://localhost:3001/uploads/${user.profilePicture}`
            );
          }
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        showError("Failed to load user profile");
      }
    };

    loadUserProfile();
  }, [showError]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();

    if (!profileData.username.trim() || !profileData.email.trim()) {
      showError("Username and email are required");
      return;
    }

    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));

      // Make API call to update profile
      await authAPI.updateProfile(storedUser._id, {
        username: profileData.username,
        email: profileData.email,
      });

      // Update localStorage
      const updatedUser = { ...storedUser, ...profileData };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showSuccess("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      showError(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      showError("All password fields are required");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError("New passwords don't match!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showError("New password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));

      // Make API call to change password
      await authAPI.updateProfile(storedUser._id, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      showSuccess("Password changed successfully!");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      showError(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = () => {
    // For now, just show success message since notification settings
    // would typically be stored in user preferences
    showSuccess("Notification settings updated successfully!");
  };

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      showError("Please select a valid image file (JPEG, PNG, GIF, or WebP)");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      showError("File size must be less than 5MB");
      return;
    }

    try {
      setUploadLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));

      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await authAPI.uploadProfilePicture(
        storedUser._id,
        formData
      );

      // Update profile picture preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result);
      };
      reader.readAsDataURL(file);

      // Update localStorage with new profile picture
      const updatedUser = {
        ...storedUser,
        profilePicture: response.data.user.profilePicture,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showSuccess("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      showError(
        error.response?.data?.error || "Failed to upload profile picture"
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const handleRemoveProfilePicture = async () => {
    try {
      setUploadLoading(true);
      const storedUser = JSON.parse(localStorage.getItem("user"));

      // Update profile to remove picture
      await authAPI.updateProfile(storedUser._id, { profilePicture: null });

      // Update state and localStorage
      setProfilePicture(null);
      const updatedUser = { ...storedUser, profilePicture: null };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showSuccess("Profile picture removed successfully!");
    } catch (error) {
      console.error("Error removing profile picture:", error);
      showError(
        error.response?.data?.message || "Failed to remove profile picture"
      );
    } finally {
      setUploadLoading(false);
    }
  };

  const tabs = [
    { id: "profile", name: "Profile", icon: <FaUser /> },
    { id: "password", name: "Password", icon: <FaLock /> },
  ];

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
          <div className="p-2 flex border-b mb-6 mx-5 w-[320px] rounded-lg shadow-md bg-tertiary bg-opacity-15">
            <nav className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-row gap-2 items-center py-3 px-8 text-center font-medium transition-all  ${
                    activeTab === tab.id
                      ? "bg-white rounded-lg"
                      : "border-transparent text-gray-500"
                  }`}
                >
                  {tab.icon}
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "profile" && (
              <div>
                <h2 className="text-lg font-medium mb-4">
                  Profile Information
                </h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  {/* Profile Picture Section */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Profile Picture
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <img
                          src={
                            profilePicture ||
                            "https://via.placeholder.com/100x100?text=Admin"
                          }
                          alt="Profile"
                          className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                        />
                        {uploadLoading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                            <Spinner size="sm" color="white" />
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col space-y-2">
                        <button
                          type="button"
                          onClick={handleProfilePictureClick}
                          disabled={uploadLoading}
                          className="bg-tertiary text-white px-4 py-2 rounded-md shadow hover:scale-95 ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <FaCamera />
                          <span>
                            {uploadLoading ? "Uploading..." : "Change Picture"}
                          </span>
                        </button>
                        {profilePicture && (
                          <button
                            type="button"
                            onClick={handleRemoveProfilePicture}
                            disabled={uploadLoading}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-md shadow hover:scale-95 ease-in-out duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            <FaTrash />
                            <span>Remove Picture</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        accept="image/*"
                        disabled={uploadLoading}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPEG, PNG, GIF, WebP. Maximum size:
                      5MB.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input
                      type="text"
                      value={profileData.username}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          username: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-4 py-4 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-4 py-4 focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Role
                    </label>
                    <input
                      type="text"
                      value={profileData.role}
                      disabled
                      className="w-full border border-gray-300 rounded-md px-4 py-4 bg-gray-100 text-gray-500"
                    />
                  </div>
                  <LoadingButton
                    type="submit"
                    loading={loading}
                    loadingText="Saving..."
                    className="bg-tertiary text-white px-4 py-2 rounded-md shadow-400 hover:scale-95 ease-in-out duration-300"
                  >
                    <FaSave className="mr-2" />
                    Save Changes
                  </LoadingButton>
                </form>
              </div>
            )}

            {activeTab === "password" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-4 py-4 focus:outline-none focus:ring-1 focus:ring-tertiary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-4 py-4 focus:outline-none focus:ring-1 focus:ring-tertiary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        setPasswordData({
                          ...passwordData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full border border-gray-300 rounded-md px-4 py-4 focus:outline-none focus:ring-1 focus:ring-tertiary"
                    />
                  </div>
                  <LoadingButton
                    type="submit"
                    loading={loading}
                    loadingText="Changing..."
                    className="bg-tertiary text-white px-4 py-2 rounded-md shadow-400 hover:scale-95 ease-in-out duration-300"
                  >
                    <FaSave className="mr-2" />
                    Change Password
                  </LoadingButton>
                </form>
              </div>
            )}
          </div>
        </div>
      </ClientLayout>
    </section>
  );
};

export default ClientSettings;
