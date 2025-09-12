import { Navigate } from "react-router-dom";

/**
 * PrivateRoute Component
 * Restricts access to authenticated users and (optionally) by role.
 * - Checks if a JWT token exists in localStorage.
 * - If roles are specified, verifies the user's role matches.
 */
export default function PrivateRoute({ children, roles }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Not logged in → redirect to login
  if (!token) {
    return <Navigate to="/login" />;
  }

  // Role check (if roles prop is provided)
  if (roles && !roles.includes(role)) {
    return <Navigate to="/forbidden" />; // or "/"
  }

  return children;
}
