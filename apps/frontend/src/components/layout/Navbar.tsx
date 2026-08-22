// lucid icons
import { LuSearch, LuUser, LuLogOut, LuCrown } from "react-icons/lu";

import logo from "../../assets/logo/logo.svg";
// search context
import { useSearch } from "../../context/SearchContext";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";
import { TierBadge } from "../common/TierBadge";

const Navbar = () => {
  // Get search term and setter from context
  const { searchTerm, setSearchTerm } = useSearch();

  const { user, logout, isSubscribed, subscriptionPlan } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/signup");
    } catch {
      toast.error("Failed to log out. Please try again.");
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-base-100/80 backdrop-blur-md border-b border-base-200 transition-colors shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 h-14 flex items-center justify-between">
        {/* Left - Logo */}
        <Link to="/" className="flex items-center gap-1">
          {/* Logo */}
          <img
            src={logo}
            alt="DLV Logo"
            className="h-10 w-auto bg-white rounded-full"
          />

          {/* Acronym only on desktop */}
          <span className="font-semibold tracking-wide text-primary ml-2">
            Digital Learning Vault
          </span>
        </Link>
        {/* Right Controls */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* LuSearch */}
          <div className="hidden sm:flex items-center gap-2 bg-base-200/60 px-3 h-9 rounded-xl border border-base-200">
            <LuSearch className="h-4 w-4 opacity-60" />
            <input
              type="text"
              placeholder="LuSearch for a book..."
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
              <LuCrown className="h-4 w-4" />
              Get Premium
            </Link>
          )}

          {/* Avatar */}
          {user && (
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                <div className={`relative w-8 rounded-full text-primary-content flex items-center justify-center text-sm font-semibold ${subscriptionPlan === "GOLD" ? "bg-amber-500 ring-2 ring-amber-400 ring-offset-1" : subscriptionPlan === "PRO" ? "bg-secondary ring-2 ring-secondary/60 ring-offset-1" : "bg-primary"}`}>
                  {user.email?.charAt(0).toUpperCase()}
                  {subscriptionPlan !== "FREE" && (
                    <span className={`absolute -bottom-1 -right-1 rounded-full p-0.5 ${subscriptionPlan === "GOLD" ? "bg-amber-500" : "bg-secondary"}`}>
                      {subscriptionPlan === "GOLD" ? <LuCrown size={8} className="text-white" /> : <LuCrown size={8} className="text-white" />}
                    </span>
                  )}
                </div>
              </label>

              <ul
                tabIndex={0}
                className="dropdown-content mt-3 p-2 shadow-2xl menu menu-sm bg-base-100 rounded-xl w-56 border border-base-200"
              >
                <li className="px-4 py-2 text-xs opacity-60 break-all ">
                  {user.email}
                </li>
                {subscriptionPlan !== "FREE" && (
                  <li className="px-4 pb-1">
                    <TierBadge plan={subscriptionPlan} size="sm" />
                  </li>
                )}

                <div className="divider my-1"></div>

                <li>
                  <Link to="/profile" className="flex items-center gap-2">
                    <LuUser className="h-4 w-4 opacity-70" />
                    My Profile
                  </Link>
                </li>

                {!isSubscribed && (
                  <li className="md:hidden">
                    <Link
                      to="/subscription"
                      className="flex items-center gap-2 text-warning"
                    >
                      <LuCrown className="h-4 w-4" />
                      Go Premium
                    </Link>
                  </li>
                )}

                <li>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-error"
                  >
                    <LuLogOut className="h-4 w-4" />
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
