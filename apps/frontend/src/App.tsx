import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { lazy } from "react";
import { useAuth } from "./context/AuthContext";

// Components
import LoadingScreen from "./components/common/LoadingScreen";
import { RootWrapper } from "./layouts/RootWrapper";
import { PublicRoute } from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";
import NotFound from "./pages/common/NotFound";

// Eager load critical auth pages
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import { Toaster } from "sonner";
import AdminTicketList from "./pages/admin/AdminTicketList";

// Lazy load client components
const Library = lazy(() => import("./pages/client/Library"));
const Subscription = lazy(() => import("./pages/client/Subscription"));
const BookDetails = lazy(() => import("./pages/client/BookDetails"));
const Reader = lazy(() => import("./pages/client/Reader"));
const Profile = lazy(() => import("./pages/client/Profile"));
const SupportPage = lazy(() => import("./pages/client/Support"));

// Lazy load Admin components
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const PaymentManager = lazy(() => import("./pages/admin/PaymentManager"));
const AddBook = lazy(() => import("./pages/admin/AddBook"));
const UsersManager = lazy(() => import("./pages/admin/UsersManager"));
const BooksManager = lazy(() => import("./pages/admin/BooksManager"));
const EditBook = lazy(() => import("./pages/admin/EditBook"));

/**
 * BROWSER ROUTER CONFIGURATION
 * Structured with Auth Guards (Public, Protected, Admin)
 */
const router = createBrowserRouter([
  {
    element: <RootWrapper />,
    errorElement: <NotFound />,
    children: [
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <UserLayout />,
            children: [
              { path: "/", element: <Library /> },
              { path: "/profile", element: <Profile /> },
              { path: "/subscription", element: <Subscription /> },
              { path: "/book/:id", element: <BookDetails /> },
              { path: "/support", element: <SupportPage /> },
            ],
          },
          { path: "/reader/:id", element: <Reader /> },
          {
            element: <AdminRoute />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { path: "/admin", element: <AdminDashboard /> },
                  { path: "/admin/payments", element: <PaymentManager /> },
                  { path: "/admin/add-book", element: <AddBook /> },
                  { path: "/admin/users", element: <UsersManager /> },
                  { path: "/admin/manage-books", element: <BooksManager /> },
                  { path: "/admin/edit-book/:bookId", element: <EditBook /> },
                  {
                    path: "/admin/support-tickets",
                    element: <AdminTicketList />,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "/signup",
        element: (
          <PublicRoute>
            <Signup />
          </PublicRoute>
        ),
      },
      {
        path: "/login",
        element: (
          <PublicRoute>
            <Login />
          </PublicRoute>
        ),
      },
    ],
  },
]);

/**
 * MAIN APP COMPONENT
 * Implements a Top-Level Boot Guard to ensure Auth state is
 * resolved before the Router is initialized.
 */
function App() {
  const { loading } = useAuth();

  // PREVENT REDIRECT FLASH:
  // Do not mount the router until Firebase finishes checking the session.
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <RouterProvider router={router} />

      <Toaster position="top-center" richColors closeButton theme="system" />
    </>
  );
}

export default App;
