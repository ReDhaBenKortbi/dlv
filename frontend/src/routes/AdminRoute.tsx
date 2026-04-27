import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";

const AdminRoute = () => {
  const { isAdmin, loading } = useAuth();

  // 1. Wait for the auth session to resolve
  if (loading) return <LoadingScreen />;

  // 2. If no user OR not an admin, send them to home (/)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 3. If they are the admin, let them see the children (AdminDashboard)
  return <Outlet />;
};

export default AdminRoute;
