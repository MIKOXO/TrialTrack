import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";
import { validatePasswordStrength } from "../utils/passwordValidation";
import PasswordRequirements from "../components/PasswordRequirements";
import { FaLock, FaSpinner } from "react-icons/fa";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

const ForcePasswordChange = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/signin");
      return;
    }

    const userData = JSON.parse(storedUser);
    setUser(userData);

    // If user doesn't need to change password, redirect to their dashboard
    if (!userData.isFirstLogin && userData.role) {
      if (userData.role === "Judge") navigate("/judge/home");
      else if (userData.role === "Admin") navigate("/admin/home");
      else if (userData.role === "Client") navigate("/client/home");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    if (serverError) setServerError("");
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate new password
    const passwordValidation = validatePasswordStrength(formData.newPassword);
    if (!passwordValidation.isValid) {
      newErrors.newPassword = passwordValidation.errors.join(", ");
    }

    // Validate confirm password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setLoading(true);
      setServerError("");

      const response = await authAPI.forcePasswordChange({
        newPassword: formData.newPassword,
      });

      // Update user data in localStorage
      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      // Show success message and redirect
      alert("Password changed successfully! You can now access the system.");

      // Redirect based on role
      if (updatedUser.role === "Judge") navigate("/judge/home");
      else if (updatedUser.role === "Admin") navigate("/admin/home");
      else if (updatedUser.role === "Client") navigate("/client/home");
    } catch (error) {
      console.error("Error changing password:", error);
      setServerError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Failed to change password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = () => {
    const validation = validatePasswordStrength(formData.newPassword);
    return validation.isValid;
  };

  const areAllPasswordRequirementsMet = () => {
    const validation = validatePasswordStrength(formData.newPassword);
    return validation.isValid;
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-tertiary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FaLock className="text-red-600 text-2xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Password Change Required
          </h1>
          <p className="text-gray-600 text-sm">
            Welcome, {user.username}! For security reasons, you must change your
            password before accessing the system.
          </p>
        </div>

        {/* Error Message */}
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{serverError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              disabled={loading}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 ${
                errors.newPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />

            <label
              htmlFor="newPassword"
              className={`absolute left-6 text-gray-500 duration-200 transition-all ${
                formData.newPassword
                  ? " text-base -top-2.5 bg-white px-1"
                  : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
              }`}
            >
              New Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className={`absolute right-3 top-3.5 text-gray-500 hover:text-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
            {errors.newPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.newPassword}</p>
            )}
            {!errors.newPassword &&
              isPasswordFocused &&
              !areAllPasswordRequirementsMet() && (
                <div className="transition-all duration-300 ease-in-out opacity-100 translate-y-0">
                  <PasswordRequirements password={formData.newPassword} />
                </div>
              )}
          </div>

          {/* Confirm Password */}
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              disabled={loading}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />

            <label
              htmlFor="confirmPassword"
              className={`absolute left-6 text-gray-500 duration-200 transition-all ${
                formData.confirmPassword
                  ? " text-base -top-2.5 bg-white px-1"
                  : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
              }`}
            >
              Confirm New Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className={`absolute right-3 top-3.5 text-gray-500 hover:text-blue-600 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              loading || !isPasswordValid() || !formData.confirmPassword
            }
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center space-x-2 ${
              loading || !isPasswordValid() || !formData.confirmPassword
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-tertiary text-white hover:bg-tertiary-dark shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            }`}
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Changing Password...</span>
              </>
            ) : (
              <>
                <FaLock />
                <span>Change Password</span>
              </>
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-xs">
            <strong>Security Notice:</strong> Choose a strong password that you
            haven't used before. This password will be used to access sensitive
            judicial information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForcePasswordChange;
