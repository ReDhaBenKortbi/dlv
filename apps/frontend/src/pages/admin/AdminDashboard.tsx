import AdminMetricsGrid from "../../components/admin/AdminMetricsGrid";
import ActionCard from "../../components/admin/ActionCard";
import LoadingScreen from "../../components/common/LoadingScreen";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { ACTION_CARDS_CONFIG } from "../../utils/AdminActions.config";
import { useDashboardMetrics } from "../../hooks/admin_dashboard/useDashboardMetrics";

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, isError } = useDashboardMetrics();

  if (isLoading) return <LoadingScreen />;
  if (isError || !stats) return <div>Error loading stats...</div>;
  return (
    <div className="min-h-screen bg-base-100 text-base-content font-sans">
      <main className="p-4 md:p-10">
        <div className="max-w-7xl mx-auto w-full">
          {/* Page Title */}
          <AdminPageHeader
            className="mb-8 md:mb-10"
            title="Admin Command Center"
            subtitle="Real-time overview of your library platform."
          />

          {/* Stats Section */}
          <AdminMetricsGrid stats={stats} />

          {/* Management Section */}
          <h2 className="text-2xl font-bold text-base-content mb-6">
            Quick Management
          </h2>
          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {ACTION_CARDS_CONFIG.map((card) => (
              <ActionCard key={card.title} card={card} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
