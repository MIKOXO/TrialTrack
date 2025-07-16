// /* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  UserIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { useNavigate, Link } from "react-router-dom";
import Logo from "../components/Logo";
import LoadingButton from "../components/LoadingButton";
import { validatePasswordStrength } from "../utils/passwordValidation";
import PasswordRequirements from "../components/PasswordRequirements";
import usePageLoadAnimation from "../hooks/usePageLoadAnimation";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  // Auto-clear submit errors after 10 seconds
  useEffect(() => {
    if (submitError) {
      const timer = setTimeout(() => {
        setSubmitError("");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [submitError]);

  // Animation hooks
  const logoVisible = usePageLoadAnimation(100);
  const headingVisible = usePageLoadAnimation(300);
  const formVisible = usePageLoadAnimation(500);

  const validate = () => {
    const errs = {};
    // Username validation
    if (!form.username.trim()) {
      errs.username = "Full name is required.";
    } else if (form.username.trim().length < 2) {
      errs.username = "Full name must be at least 2 characters long.";
    } else if (form.username.trim().length > 50) {
      errs.username = "Full name must be less than 50 characters.";
    }

    // Email validation
    if (!form.email) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email =
        "Please enter a valid email address (e.g., user@example.com).";
    } else if (form.email.length > 100) {
      errs.email = "Email address is too long.";
    }

    // Enhanced password validation
    if (!form.password) {
      errs.password = "Password is required.";
    } else {
      const passwordValidation = validatePasswordStrength(form.password);
      if (!passwordValidation.isValid) {
        errs.password = passwordValidation.errors[0]; // Show first error
      }
    }

    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    // Clear submit error when user starts typing
    if (submitError) {
      setSubmitError("");
    }
  };

  // Check if all password requirements are met
  const areAllPasswordRequirementsMet = () => {
    const passwordValidation = validatePasswordStrength(form.password);
    return passwordValidation.isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);
      const res = await axios.post("http://localhost:3001/api/auth/register", {
        ...form,
        role: "Client",
      });
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/client/home");
    } catch (err) {
      console.error("Signup error:", err);
      console.error("Error response:", err.response);
      console.error("Error data:", err.response?.data);

      // Handle different types of errors with user-friendly messages
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        switch (status) {
          case 400: {
            const errorMessage = errorData.error || errorData.message || "";

            if (
              errorMessage.includes("User already exists") ||
              errorMessage.includes("already exists")
            ) {
              setSubmitError(
                `An account with the email "${form.email}" already exists. Please use a different email address or sign in to your existing account.`
              );
            } else if (errorMessage.includes("Password")) {
              setSubmitError(errorMessage);
            } else {
              setSubmitError(
                errorMessage || "Please check your information and try again."
              );
            }
            break;
          }
          case 409:
            setSubmitError(
              "An account with this email already exists. Please use a different email or try signing in."
            );
            break;
          case 422:
            setSubmitError(
              "Invalid information provided. Please check all fields and try again."
            );
            break;
          case 429:
            setSubmitError(
              "Too many signup attempts. Please wait a few minutes before trying again."
            );
            break;
          case 500:
            setSubmitError(
              "Server error. Please try again later or contact support if the problem persists."
            );
            break;
          default:
            setSubmitError(
              errorData.error || "Sign up failed. Please try again."
            );
        }
      } else if (err.request) {
        // Network error
        setSubmitError(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        // Other error
        setSubmitError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto container pb-10 px-7 lg:px-32 mt-10">
      <div
        className={`transition-all duration-1000 ease-out ${
          logoVisible
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 -translate-y-10 scale-95"
        }`}
      >
        <Logo />
      </div>

      <div
        className={`mt-10 font-Lexend text-center font-light transition-all duration-1000 ease-out ${
          headingVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <h1 className="text-2xl">Create An Account</h1>
        <p className="text-lg mt-2">Please fill your information</p>
      </div>

      {submitError && (
        <div className="mb-6 p-4 mx-auto w-full max-w-lg bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{submitError}</p>
              </div>
            </div>
            <button
              onClick={() => setSubmitError("")}
              className="flex-shrink-0 ml-4 text-red-400 hover:text-red-600 transition-colors"
              aria-label="Dismiss error"
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div
        className={`font-Lexend mt-5 mx-auto w-full max-w-lg transition-all duration-1000 ease-out ${
          formVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <form action="" onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              disabled={loading}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                errors.username
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />

            <label
              htmlFor="name"
              className={`absolute left-6 text-gray-500 duration-200 transition-all ${
                form.username
                  ? " text-base -top-2.5 bg-white px-1"
                  : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
              }`}
            >
              Name
            </label>
            <UserIcon className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            {errors.username && (
              <p className="text-sm text-red-500 mt-1">{errors.username}</p>
            )}
          </div>

          <div className="relative mb-6">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />

            <label
              htmlFor="email"
              className={`absolute left-6 text-gray-500 duration-200 transition-all ${
                form.email
                  ? " text-base -top-2.5 bg-white px-1"
                  : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
              }`}
            >
              Email
            </label>
            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute right-3 top-3.5" />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              onFocus={() => setIsPasswordFocused(true)}
              onBlur={() => setIsPasswordFocused(false)}
              disabled={loading}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />

            <label
              htmlFor="password"
              className={`absolute left-6 text-gray-500 duration-200 transition-all ${
                form.password
                  ? " text-base -top-2.5 bg-white px-1"
                  : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
              }`}
            >
              Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
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
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
            {!errors.password &&
              isPasswordFocused &&
              !areAllPasswordRequirementsMet() && (
                <div className="transition-all duration-300 ease-in-out opacity-100 translate-y-0">
                  <PasswordRequirements password={form.password} />
                </div>
              )}
          </div>

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            />

            <label
              htmlFor="confirmPassword"
              className={`absolute left-6 text-gray-500 duration-200 transition-all ${
                form.confirmPassword
                  ? " text-base -top-2.5 bg-white px-1"
                  : " top-2.5 text-gray-400 peer-focus:-top-3 peer-focus:bg-white peer-focus:px-1 peer-focus:text-tertiary"
              }`}
            >
              Confirm Password
            </label>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
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

          <div className="mt-6">
            <LoadingButton
              type="submit"
              loading={loading}
              loadingText="Creating Account..."
              className="w-full bg-tertiary text-primary shadow-400 hover:shadow-300 focus:ring-tertiary"
            >
              Create Account
            </LoadingButton>

            <p className="mt-5 text-center font-light">
              Already Have An Account?{" "}
              <Link to="/roleselector" className="text-tertiary underline">
                Log In
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Signup;
