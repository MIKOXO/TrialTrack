// /* eslint-disable no-unused-vars */
import { useState } from "react";
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

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const errs = {};
    if (!form.username.trim()) errs.username = "Full name is required.";
    if (!form.email) errs.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      errs.email = "Invalid email format.";
    if (!form.password) errs.password = "Password is required.";
    else if (form.password.length < 6)
      errs.password = "Password must be at least 6 characters.";
    if (!form.confirmPassword)
      errs.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    if (!form.role) errs.role = "Please select a role.";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const res = await axios.post(
        "http://localhost:3001/api/auth/register",
        form
      );
      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "Admin") navigate("/admin/home");
      else if (user.role === "Client") navigate("/client/home");
      else if (user.role === "Judge") navigate("/judge/home");
    } catch (err) {
      const msg =
        err.response?.data?.error || "Sign up failed. Please try again.";
      setSubmitError(msg);
    }
  };

  return (
    <section className="mx-auto container pb-10 px-7 lg:px-32 mt-10">
      <div>
        <Logo />
      </div>

      <div className="mt-10 font-Lexend text-center font-light">
        <h1 className="text-2xl">Create An Account</h1>
        <p className="text-lg mt-2">Please fill your information</p>
      </div>

      {submitError && (
        <div className="mb-4 text-red-600 text-center font-medium">
          {submitError}
        </div>
      )}

      <div className="font-Lexend mt-5 mx-auto w-full max-w-lg">
        <form action="" onSubmit={handleSubmit}>
          <div className="relative mb-6">
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                errors.username
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              }`}
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
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                errors.email
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              }`}
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
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                errors.password
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              }`}
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
              className="absolute right-3 top-3.5 text-gray-500 hover:text-blue-600"
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

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1  ${
                errors.confirmPassword
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              }`}
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
              className="absolute right-3 top-3.5 text-gray-500 hover:text-blue-600"
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

          <div>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              style={{ appearance: "none" }}
              className={`text-gray-500 w-full border rounded-md px-5 py-3 focus:outline-none focus:ring-1 ${
                errors.role
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-tertiary"
              }`}
            >
              <option value="">Select Role</option>
              <option value="Client">Client</option>
              <option value="Judge">Judge</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-sm text-red-500 mt-1">{errors.role}</p>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="bg-tertiary text-primary px-7 py-3 w-full rounded-lg text-lg shadow-400 hover:shadow ease-in-out duration-300"
            >
              Create Account
            </button>

            <p className="mt-5 text-center font-light">
              Already Have An Account?{" "}
              <Link to="/signin" className="text-tertiary underline">
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
