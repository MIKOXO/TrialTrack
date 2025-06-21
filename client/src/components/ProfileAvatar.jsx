import { useState } from "react";
import { FaUser } from "react-icons/fa";

const ProfileAvatar = ({
  user,
  size = "md",
  showName = false,
  className = "",
  onClick = null,
}) => {
  const [imageError, setImageError] = useState(false);

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
    if (!user?.profilePicture || imageError) return null;

    // If it's already a full URL, use it as is
    if (user.profilePicture.startsWith("http")) {
      return user.profilePicture;
    }

    // Otherwise, construct the URL from the backend
    return `http://localhost:3001/uploads/${user.profilePicture}`;
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
