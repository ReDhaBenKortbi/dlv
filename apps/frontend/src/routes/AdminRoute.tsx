import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "../components/common/LoadingScreen";

const AdminRoute = () => {
  const { isAdmin, loading } = useAuth();

  // 1. Wait for Firebase to check if the user is logged in
  if (loading) return <LoadingScreen />;

  // 2. If no user OR email doesn't match, send them to home (/)
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // 3. If they are the admin, let them see the children (AdminDashboard)
  return <Outlet />;
};

export default AdminRoute;
