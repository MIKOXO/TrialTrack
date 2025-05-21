// /* eslint-disable no-unused-vars */
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import axios from "axios";

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required.";
    if (!form.password) errs.password = "Password is required.";
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

      // Redirect based on role
      if (user.role === "Admin") navigate("/admin/home");
      else if (user.role === "Judge") navigate("/judge/home");
      else if (user.role === "Client") navigate("/client/home");
      else navigate("/");
    } catch (err) {
      if (err.response && err.response.data) {
        setServerError(err.response.data.error || "Login failed.");
      } else {
        setServerError("Server error.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mx-auto container px-7 lg:px-32 mt-10">
      <div>
        <Logo />
      </div>

      <div className="mt-14 font-Lexend text-center font-light">
        <h1 className="text-3xl">Welcome Back!</h1>
        <p className="text-xl mt-2">Please enter log in details below</p>
      </div>

      <div className="font-Lexend mt-10 mx-auto w-full max-w-lg">
        <form action="" onSubmit={handleSubmit}>
          <div className="relative my-6">
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
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
              className={`peer w-full border border-gray-300 rounded-lg px-7 pt-5 pb-2 focus:border-transparent focus:outline-none focus:ring-1 focus:ring-tertiary ${
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
              className="absolute right-3 top-3.5 text-gray-500 hover:text-tertiary"
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
            <p className="text-red-600 text-sm text-center">{serverError}</p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="bg-tertiary text-primary px-7 py-3 w-full rounded-lg text-lg shadow-400 hover:shadow ease-in-out duration-300"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

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
