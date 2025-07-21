import { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";

const ProfileAvatar = ({
  user,
  size = "md",
  showName = false,
  className = "",
  onClick = null,
}) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error when user data changes
  useEffect(() => {
    setImageError(false);
  }, [user?.profilePicture]);

  // Size configurations
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-20 h-20 text-2xl",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-lg",
    "2xl": "text-xl",
  };

  // Get user initials
  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return user?.role?.charAt(0).toUpperCase() || "U";
  };

  // Get profile picture URL
  const getProfilePictureUrl = () => {
    console.log("=== PROFILE AVATAR DEBUG ===");
    console.log("User data:", user);
    console.log("Profile picture data:", user?.profilePicture);
    console.log("Image error state:", imageError);

    if (!user?.profilePicture || imageError) {
      console.log("No profile picture or image error, returning null");
      return null;
    }

    // Add cache busting timestamp to prevent browser caching
    const timestamp = Date.now();

    // Handle new profile picture structure (object with url property)
    if (typeof user.profilePicture === "object" && user.profilePicture.url) {
      console.log("Found object with url:", user.profilePicture.url);
      // If it's already a full URL, use it as is with cache busting
      if (user.profilePicture.url.startsWith("http")) {
        const separator = user.profilePicture.url.includes("?") ? "&" : "?";
        const finalUrl = `${user.profilePicture.url}${separator}t=${timestamp}`;
        console.log("Using full URL:", finalUrl);
        return finalUrl;
      }
      // Otherwise, construct the full URL with cache busting
      const baseUrl = `http://localhost:3001${user.profilePicture.url}`;
      const separator = user.profilePicture.url.includes("?") ? "&" : "?";
      const finalUrl = `${baseUrl}${separator}t=${timestamp}`;
      console.log("Constructed URL:", finalUrl);
      return finalUrl;
    }

    // Handle legacy profile picture structure (string path)
    if (typeof user.profilePicture === "string") {
      console.log("Found string profile picture:", user.profilePicture);
      // If it's already a full URL, use it as is with cache busting
      if (user.profilePicture.startsWith("http")) {
        const separator = user.profilePicture.includes("?") ? "&" : "?";
        const finalUrl = `${user.profilePicture}${separator}t=${timestamp}`;
        console.log("Using string URL:", finalUrl);
        return finalUrl;
      }
      // Otherwise, construct the URL from the backend with cache busting
      const finalUrl = `http://localhost:3001/uploads/${user.profilePicture}?t=${timestamp}`;
      console.log("Constructed legacy URL:", finalUrl);
      return finalUrl;
    }

    // Fallback: if user has an ID and profilePicture exists but doesn't match above patterns
    if (user?.profilePicture && (user?.id || user?._id)) {
      const userId = user.id || user._id;
      const fallbackUrl = `http://localhost:3001/api/auth/profile-picture/${userId}?t=${timestamp}`;
      console.log("Using fallback URL:", fallbackUrl);
      return fallbackUrl;
    }

    console.log("No profile picture URL could be determined");

    // Final fallback: try to construct URL from user ID if available
    if (user?.id || user?._id) {
      const userId = user.id || user._id;
      const finalFallbackUrl = `http://localhost:3001/api/auth/profile-picture/${userId}?t=${timestamp}`;
      console.log("Final fallback URL:", finalFallbackUrl);
      return finalFallbackUrl;
    }

    return null;
  };

  const profilePictureUrl = getProfilePictureUrl();

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Get background color based on role
  const getRoleColor = () => {
    switch (user?.role) {
      case "Admin":
        return "bg-blue-600";
      case "Judge":
        return "bg-purple-600";
      case "Client":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  const avatarClasses = `
    ${sizeClasses[size]} 
    rounded-full 
    flex 
    items-center 
    justify-center 
    text-white 
    font-medium 
    overflow-hidden
    ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""}
    ${className}
  `;

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`${avatarClasses} ${
          !profilePictureUrl ? getRoleColor() : "bg-gray-200"
        }`}
        onClick={onClick}
        title={user?.username || user?.email || "User"}
      >
        {profilePictureUrl ? (
          <img
            src={profilePictureUrl}
            alt={`${user?.username || "User"}'s profile`}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <span className={textSizeClasses[size]}>{getInitials()}</span>
        )}
      </div>

      {showName && (
        <div className="hidden md:block">
          <p className={`font-medium text-gray-900 ${textSizeClasses[size]}`}>
            {user?.firstName && user?.lastName
              ? `${user.firstName} ${user.lastName}`
              : user?.username || "User"}
          </p>
          {user?.role && (
            <p
              className={`text-gray-500 ${
                size === "sm" ? "text-xs" : "text-xs"
              }`}
            >
              {user.role}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
