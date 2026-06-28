// lucid icons
import {
  LayoutDashboard,
  PlusCircle,
  CreditCard,
  Users,
  BookOpen,
  LogOut,
  HelpCircle,
} from "lucide-react";

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Get real user data and logout function

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  // Define navigation links with icons
  const navLinks = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      name: "Add Book",
      path: "/admin/add-book",
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      name: "Payments",
      path: "/admin/payments",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      name: "Manage Books",
      path: "/admin/manage-books",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      name: "Support Tickets",
      path: "/admin/support-tickets",
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ];

  return (
    <div className="drawer-side z-50 shadow-lg">
      <label
        htmlFor="my-drawer-2"
        aria-label="close sidebar"
        className="drawer-overlay"
      ></label>

      <div className="w-72 min-h-full bg-base-100 border-r border-base-200 flex flex-col justify-between transition-colors">
        {/* Top Section */}
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-6">
            <div className="w-9 h-9 bg-primary text-primary-content rounded-xl flex items-center justify-center font-semibold">
              B
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">BookHub</h1>
              <span className="text-[10px] uppercase tracking-wider opacity-50 font-medium">
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation */}
          <ul className="px-3 space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);

              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 ${
                      active
                        ? "bg-base-200 text-primary font-semibold"
                        : "hover:bg-base-200/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer */}
        <div className="border-t border-base-200 p-4 space-y-3">
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.displayName || "Administrator"}
              </p>
              <p className="text-xs opacity-50 truncate">{user?.email}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-error hover:bg-error/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
