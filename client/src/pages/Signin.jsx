// /* eslint-disable no-unused-vars */
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import LoadingButton from "../components/LoadingButton";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";
import usePageLoadAnimation from "../hooks/usePageLoadAnimation";

const Signin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const roleParam = queryParams.get("role") || "";

  const [role, setRole] = useState(roleParam);
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // Auto-clear server errors after 10 seconds
  useEffect(() => {
    if (serverError) {
      const timer = setTimeout(() => {
        setServerError("");
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [serverError]);

  // Animation hooks
  const logoVisible = usePageLoadAnimation(100);
  const headingVisible = usePageLoadAnimation(300);
  const formVisible = usePageLoadAnimation(500);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = () => {
    const errs = {};

    // Email validation
    if (!form.email) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Please enter a valid email address.";
    }

    // Password validation
    if (!form.password) {
      errs.password = "Password is required.";
    } else if (form.password.length < 6) {
      errs.password = "Password must be at least 6 characters long.";
    }

    return errs;
  };

  useEffect(() => {
    setRole(roleParam);
  }, [roleParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:3001/api/auth/login",
        {
          email: form.email,
          password: form.password,
          role: roleParam,
        },
        form
      );
      const { token, user } = res.data;

      if (role && user.role !== role) {
        return setErrors(`This user is not registered as ${role}`);
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Check if user must change password (especially judges on first login)
      if (res.data.mustChangePassword) {
        navigate("/force-password-change");
        return;
      }

      // Redirect based on role
      if (user.role === "Admin") navigate("/admin/home");
      else if (user.role === "Judge") navigate("/judge/home");
      else if (user.role === "Client") navigate("/client/home");
      else navigate("/");
    } catch (err) {
      console.error("Login error:", err);

      // Handle different types of errors with user-friendly messages
      if (err.response) {
        const status = err.response.status;
        const errorData = err.response.data;

        switch (status) {
          case 400:
            setServerError(
              errorData.error ||
                "Invalid login credentials. Please check your email and password."
            );
            break;
          case 403:
            setServerError(
              errorData.error ||
                `Access denied. You are not registered as a ${roleParam}.`
            );
            break;
          case 404:
            setServerError(
              "Account not found. Please check your email address or sign up for a new account."
            );
            break;
          case 429:
            setServerError(
              "Too many login attempts. Please wait a few minutes before trying again."
            );
            break;
          case 500:
            setServerError(
              "Server error. Please try again later or contact support if the problem persists."
            );
            break;
          default:
            setServerError(
              errorData.error || "Login failed. Please try again."
            );
        }
      } else if (err.request) {
        // Network error
        setServerError(
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        // Other error
        setServerError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto container px-7 lg:px-32 mt-10">
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
        className={`mt-14 font-Lexend text-center font-light transition-all duration-1000 ease-out ${
          headingVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-10"
        }`}
      >
        <h1 className="text-3xl">Welcome Back!</h1>
        <p className="text-xl mt-2">Please enter log in details below</p>
      </div>

      <div
        className={`font-Lexend mt-10 mx-auto w-full max-w-lg transition-all duration-1000 ease-out ${
          formVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <form action="" onSubmit={handleSubmit}>
          <div className="relative my-6">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled={loading}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
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
            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute right-3 top-3.5 pointer-events-none" />
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
              disabled={loading}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
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
              className={`absolute right-3 top-3.5 text-gray-500 hover:text-tertiary ${
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
          </div>

          {serverError && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
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
                    <p className="text-sm text-red-800">{serverError}</p>
                  </div>
                </div>
                <button
                  onClick={() => setServerError("")}
                  className="flex-shrink-0 ml-4 text-red-400 hover:text-red-600 transition-colors"
                  aria-label="Dismiss error"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
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

          <LoadingButton
            type="submit"
            loading={loading}
            loadingText="Signing in..."
            className="w-full bg-tertiary text-primary shadow-400 hover:shadow-300 focus:ring-tertiary"
          >
            Sign In
          </LoadingButton>

          <p className="mt-5 text-center font-light">
            Don't Have An Account?{" "}
            <Link to="/signup" className="text-tertiary underline">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Signin;
