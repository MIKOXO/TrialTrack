/**
 * Password validation utility functions
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
 * Gets password strength level
 * @param {string} password - The password to check
 * @returns {object} - Object containing strength level and score
 */
export const getPasswordStrength = (password) => {
  let score = 0;
  let level = "Very Weak";

  if (!password) {
    return { level: "Very Weak", score: 0 };
  }

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Character type checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password)) score += 1;

  // Determine strength level
  if (score >= 6) level = "Very Strong";
  else if (score >= 5) level = "Strong";
  else if (score >= 4) level = "Good";
  else if (score >= 3) level = "Fair";
  else if (score >= 2) level = "Weak";

  return { level, score };
};

/**
 * Gets password requirements text for display
 * @returns {array} - Array of requirement strings
 */
export const getPasswordRequirements = () => {
  return [
    "At least 8 characters long",
    "At least one uppercase letter (A-Z)",
    "At least one lowercase letter (a-z)",
    "At least one number (0-9)",
    "At least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)",
  ];
};

/**
 * Checks which password requirements are met
 * @param {string} password - The password to check
 * @returns {object} - Object with boolean values for each requirement
 */
export const checkPasswordRequirements = (password) => {
  return {
    length: password && password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
  };
};

/**
 * Gets password requirements with their current status
 * @param {string} password - The password to check
 * @returns {array} - Array of requirement objects with text and met status
 */
export const getPasswordRequirementsWithStatus = (password) => {
  const requirements = getPasswordRequirements();
  const status = checkPasswordRequirements(password);

  return [
    { text: requirements[0], met: status.length, key: "length" },
    { text: requirements[1], met: status.uppercase, key: "uppercase" },
    { text: requirements[2], met: status.lowercase, key: "lowercase" },
    { text: requirements[3], met: status.number, key: "number" },
    { text: requirements[4], met: status.special, key: "special" },
  ];
};

/**
 * Formats password validation error message
 * @param {array} errors - Array of error messages
 * @returns {string} - Formatted error message
 */
export const formatPasswordErrors = (errors) => {
  if (errors.length === 0) return "";
  if (errors.length === 1) return errors[0];

  return `Password requirements not met:\n• ${errors.join("\n• ")}`;
};
