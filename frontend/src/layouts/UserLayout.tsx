import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import { Suspense } from "react";
import { TransitionLoader } from "../components/common/TransitionLoader";
import { SubscriptionWatcher } from "../components/common/SubscriptionWatcher";
import SupportFab from "../components/common/SupportFab";

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-base-200 dark:bg-base-300 transition-colors duration-300">
      <Navbar />

      <SubscriptionWatcher />
      <SupportFab />

      <Suspense fallback={<TransitionLoader />}>
        <main className="flex-1 animate-in fade-in duration-500">
          <Outlet />
        </main>
      </Suspense>
    </div>
  );
};

export default UserLayout;
