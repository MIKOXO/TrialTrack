import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = ({ role }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) return <Navigate to="/signin" />;

  if (role && user.role !== role) return <Navigate to="/" />;

  // Check if user must change password (especially judges on first login)
  // Redirect to force password change page if required
  if (user.isFirstLogin && user.role === "Judge") {
    return <Navigate to="/force-password-change" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
