import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading } = useAuth();

  // 1. Prevent flickering while checking session
  if (loading) return null;

  if (user) {
    // 2. If logged in, send them to the correct dashboard automatically
    if (isAdmin) return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
