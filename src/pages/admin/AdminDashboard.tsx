import AdminMetricsGrid from "../../components/admin/AdminMetricsGrid";

// admineService
// Import existing components
import ActionCard from "../../components/admin/ActionCard";
import LoadingScreen from "../../components/common/LoadingScreen";
import { ACTION_CARDS_CONFIG } from "../../utils/AdminActions.config";
import { useDashboardMetrics } from "../../hooks/admin_dashboard/useDashboardMetrics";

// Stat Cards Config

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, isError } = useDashboardMetrics();

  if (isLoading) return <LoadingScreen />;
  if (isError || !stats) return <div>Error loading stats...</div>;
  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <main className="p-4 md:p-10">
        <div className="max-w-7xl mx-auto w-full">
          {/* Page Title */}
          <div className="mb-8 md:mb-10">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
              Admin Command Center
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Real-time overview of your library platform.
            </p>
          </div>

          {/* Stats Section */}
          <AdminMetricsGrid stats={stats} />

          {/* Management Section */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Quick Management
          </h2>
          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ACTION_CARDS_CONFIG.map((card) => (
              <ActionCard
                key={card.title}
                title={card.title}
                description={card.description}
                linkText={card.linkText}
                to={card.to}
                icon={card.icon}
                colorClass={card.colorClass}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
