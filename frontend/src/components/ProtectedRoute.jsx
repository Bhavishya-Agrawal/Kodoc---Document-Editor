import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * ProtectedRoute — wraps routes that require authentication.
 * If the user is not authenticated, redirects to /signin.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return children;
};

export default ProtectedRoute;
