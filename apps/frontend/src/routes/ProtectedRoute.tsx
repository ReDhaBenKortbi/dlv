import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";

const ProtectedRoute = () => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) return <LoadingScreen />;
  if (!user)
    return <Navigate to="/signup" state={{ from: location }} replace />;

  const isAdminPath = location.pathname.startsWith("/admin");
  if (isAdminPath && !isAdmin) return <Navigate to="/" replace />;

  // JUST the gatekeeper logic
  return <Outlet />;
};

export default ProtectedRoute;
