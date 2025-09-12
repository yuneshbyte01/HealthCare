import { Navigate } from "react-router-dom";

/**
 * PrivateRoute Component
 * Restricts access to authenticated users only.
 * - If a JWT token exists in localStorage, render children.
 * - Otherwise, redirect to the login page.
 */
export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
}
