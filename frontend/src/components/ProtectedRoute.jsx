import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * ProtectedRoute Component
 * Blocks access to routes based on authentication and user roles.
 *
 * @param {Object} props
 * @param {ReactNode} props.children - The route's children components.
 * @param {Array} [props.allowedRoles] - List of roles allowed to access.
 * @returns {JSX.Element} - Returns children, else redirects to login.
 */
function ProtectedRoute({ children, allowedRoles = [] }) {
  const { token, userRole } = useContext(AuthContext);

  // If no token, redirect to login
  if (!token) return <Navigate to="/" replace />;

  // If roles are specified and the user's role is not allowed, deny access
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return (
      <div style={{ padding: "30px", color: "#6A1B9A", fontWeight: "bold" }}>
        Access Denied: You do not have the required permissions.
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;