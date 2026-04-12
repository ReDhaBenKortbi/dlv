import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import { Suspense } from "react";
import { TransitionLoader } from "../components/common/TransitionLoader";

const AdminLayout = () => {
  return (
    <div className="drawer lg:drawer-open font-sans bg-base-200 dark:bg-base-300 text-base-content dark:text-base-content">
      <input id="my-drawer-2" type="checkbox" className="drawer-toggle" />

      <div className="drawer-content flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center p-4 bg-base-100 dark:bg-base-200 shadow-md border-b border-base-300 dark:border-base-400">
          <label htmlFor="my-drawer-2" className="btn btn-square btn-ghost">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-6 h-6 stroke-current"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </label>
          <span className="ml-4 font-bold text-lg">Admin Panel</span>
        </div>

        {/* Main content */}
        <Suspense fallback={<TransitionLoader />}>
          <main className="p-4 sm:p-6 md:p-10 flex-1 bg-base-200 dark:bg-base-300 transition-colors duration-300">
            <Outlet />
          </main>
        </Suspense>
      </div>

      <Sidebar />
    </div>
  );
};

export default AdminLayout;
