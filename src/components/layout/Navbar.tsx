// lucid icons
import { Search, User, LogOut, Crown } from "lucide-react";

// search context
import { useSearch } from "../../context/SearchContext";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

const Navbar = () => {
  // Get search term and setter from context
  const { searchTerm, setSearchTerm } = useSearch();

  const { user, logout, isSubscribed } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signup");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-200 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-14 flex items-center justify-between">
        {/* Left - Logo */}
        <Link
          to="/"
          className="text-lg md:text-xl font-semibold tracking-tight text-primary"
        >
          Digital Learning Vault
        </Link>
        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 bg-base-200/60 px-3 h-9 rounded-xl border border-base-200">
            <Search className="h-4 w-4 opacity-60" />
            <input
              type="text"
              placeholder="Search for a book..."
              className="bg-transparent outline-none text-sm w-32 md:w-40"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Premium Button */}
          {user && !isSubscribed && (
            <Link
              to="/subscription"
              className="hidden md:flex btn btn-warning btn-sm rounded-full gap-2 normal-case"
            >
              <Crown className="h-4 w-4" />
              Get Premium
            </Link>
          )}

          {/* Avatar */}
          {user && (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-semibold">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content mt-3 p-2 shadow-2xl menu menu-sm bg-base-100 rounded-xl w-56 border border-base-200"
              >
                <li className="px-4 py-2 text-xs opacity-60 break-all ">
                  {user.email}
                </li>

                <div className="divider my-1"></div>

                <li>
                  <Link to="/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4 opacity-70" />
                    My Profile
                  </Link>
                </li>

                {!isSubscribed && (
                  <li className="md:hidden">
                    <Link
                      to="/subscription"
                      className="flex items-center gap-2 text-warning"
                    >
                      <Crown className="h-4 w-4" />
                      Go Premium
                    </Link>
                  </li>
                )}

                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-error"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
