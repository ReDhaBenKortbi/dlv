import { useMemo } from "react"; // Added for optimization
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Info } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const {
    user,
    logout,
    isAdmin,
    isSubscribed,
    subscriptionStatus,
    subscriptionEndDate,
  } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  };

  // --- OPTIMIZED LOGIC: Memoized Calculation ---
  const daysLeft = useMemo(() => {
    if (!subscriptionEndDate || !isSubscribed) return null;
    const now = new Date();
    const end = subscriptionEndDate.toDate();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [subscriptionEndDate, isSubscribed]);

  // --- UI STATUS MAPPING ---
  const status = useMemo(() => {
    if (isAdmin)
      return {
        label: "ADMIN",
        class: "badge-primary",
        text: "Full System Access",
      };
    if (isSubscribed)
      return {
        label: "PREMIUM",
        class: "badge-secondary",
        text: "Subscription Active",
      };
    if (subscriptionStatus === "pending")
      return {
        label: "PENDING",
        class: "badge-warning",
        text: "Reviewing your receipt...",
      };
    if (subscriptionStatus === "rejected")
      return {
        label: "REJECTED",
        class: "badge-error",
        text: "Receipt invalid. Try again.",
      };

    return {
      label: "FREE PLAN",
      class: "badge-ghost border-gray-100",
      text: "Upgrade to unlock all books",
    };
  }, [isAdmin, isSubscribed, subscriptionStatus]);

  return (
    <div className="min-h-screen bg-base-200 py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* PROFILE CARD */}
        <div className="card bg-base-100 shadow-xl border border-base-300 rounded-2xl">
          <div className="card-body p-6 sm:p-8">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Avatar */}
              <div className="avatar">
                <div className="w-20 rounded-full bg-gradient-to-br from-primary/90 to-secondary/80 text-primary-content flex items-center justify-center text-2xl font-bold shadow-lg ring ring-base-100 ring-offset-2">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-extrabold">
                  {user?.displayName || "Reader"}
                </h2>
                <p className="text-sm text-base-content/60 mt-1">
                  {user?.email}
                </p>

                <div className="mt-3 flex items-center gap-3 flex-wrap">
                  <div className={`badge badge-lg font-bold ${status.class}`}>
                    {subscriptionStatus === "pending" && (
                      <span className="loading loading-spinner loading-xs"></span>
                    )}
                    {status.label}
                  </div>
                  <span className="text-xs text-base-content/60">
                    {status.text}
                  </span>
                </div>
              </div>
            </div>

            {/* SUBSCRIPTION INFO */}
            {isSubscribed && !isAdmin && daysLeft !== null && (
              <div className="mt-8 p-6 rounded-xl bg-base-200 border border-base-300">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-base-content/50 font-bold">
                      Subscription
                    </p>
                    <p className="text-sm mt-1">
                      Valid until{" "}
                      <span className="font-semibold">
                        {subscriptionEndDate?.toDate().toLocaleDateString()}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <p
                      className={`text-2xl font-extrabold ${
                        daysLeft < 5 ? "text-error" : "text-primary"
                      }`}
                    >
                      {daysLeft}
                    </p>
                    <p className="text-xs text-base-content/60 uppercase">
                      Days Remaining
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="divider my-8"></div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {!isSubscribed && !isAdmin && (
                <button
                  onClick={() => navigate("/subscription")}
                  className="btn btn-primary font-semibold shadow-md"
                >
                  {subscriptionStatus === "rejected"
                    ? "Retry Subscription"
                    : "Upgrade to Premium"}
                </button>
              )}

              <button onClick={() => navigate("/")} className="btn btn-outline">
                Back to Library
              </button>

              <button
                onClick={handleLogout}
                className="btn btn-ghost text-error hover:bg-error/10"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* SUPPORT SECTION */}
        <div className="card bg-base-100 shadow-md border border-base-300 rounded-2xl">
          <div className="card-body p-6">
            <div className="mt-6 p-4 bg-base-100 dark:bg-base-200 rounded-2xl flex items-center gap-4 border border-base-300 dark:border-base-400 shadow-sm transition-colors duration-300">
              {/* Icon Box */}
              <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-xl text-primary flex-shrink-0">
                <Info size={24} strokeWidth={2} />
              </div>

              {/* Text Content */}
              <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                  Need Help?
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Contact us at support@dz-books.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
