/**
 * Password validation utility functions for backend
 */

/**
 * Validates password strength
 * @param {string} password - The password to validate
 * @returns {object} - Object containing isValid boolean and errors array
 */
export const validatePasswordStrength = (password) => {
  const errors = [];

  // Check minimum length
  if (!password || password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Check for uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Check for lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  // Check for number
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Check for special character
  if (!/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) {
    errors.push(
      "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"
    );
  }

  return {
    isValid: errors.length === 0,
    errors: errors,
  };
};

/**
 * Formats password validation error message
 * @param {array} errors - Array of error messages
 * @returns {string} - Formatted error message
 */
export const formatPasswordErrors = (errors) => {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0];

  return `Password requirements not met: ${errors.join(", ")}`;
};
