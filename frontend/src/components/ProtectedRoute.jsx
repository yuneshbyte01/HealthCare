import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute Component with TailwindCSS styling
 * Restricts access to authenticated users and (optionally) by role.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, role } = useAuth();

  console.log('ProtectedRoute check:', { isAuthenticated, role, roles }); // Debug log

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" />;
  }

  // Role check (if roles prop is provided)
  if (roles && !roles.includes(role)) {
    console.log('Role check failed:', { role, roles });
    return <Navigate to="/forbidden" />;
  }

  console.log('Access granted');
  return children;
}
