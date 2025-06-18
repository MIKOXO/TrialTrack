import React from "react";
import { getPasswordRequirementsWithStatus } from "../utils/passwordValidation";

/**
 * PasswordRequirements Component
 * Displays password requirements with real-time visual feedback
 *
 * @param {string} password - The current password value
 * @param {boolean} showOnlyWhenEmpty - Whether to show requirements only when password is empty
 * @param {string} className - Additional CSS classes
 */
const PasswordRequirements = ({
  password = "",
  showOnlyWhenEmpty = false,
  className = "",
}) => {
  // Don't show if showOnlyWhenEmpty is true and password has content
  if (showOnlyWhenEmpty && password.length > 0) {
    return null;
  }

  const requirements = getPasswordRequirementsWithStatus(password);

  return (
    <div className={`mt-2 ${className}`}>
      <p className="text-xs text-gray-500 mb-1">Password must contain:</p>
      <ul className="text-xs space-y-1">
        {requirements.map((req, index) => (
          <li
            key={index}
            className={`flex items-center transition-colors duration-200 ${
              req.met ? "text-green-600" : "text-gray-500"
            }`}
          >
            <span
              className={`w-3 h-3 rounded-full mr-2 flex items-center justify-center transition-colors duration-200 ${
                req.met ? "bg-green-500" : "bg-gray-300"
              }`}
            >
              {req.met && (
                <svg
                  className="w-2 h-2 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
            {req.text}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements;
