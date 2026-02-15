import { Users, BookOpen, CreditCard } from "lucide-react";
import MetricDisplayCard from "./MetricDisplayCard";
import type { DashboardStats } from "../../services/adminService";

interface Props {
  stats: DashboardStats;
}

// Static config for stats cards
const BASE_STATS_CONFIG: {
  key: keyof DashboardStats;
  title: string;
  desc: string;
  icon: React.ElementType; // Lucide icon component
  iconBgClass: string;
  iconColorClass: string;
}[] = [
  {
    key: "users",
    title: "Total Users",
    desc: "Registered accounts",
    icon: Users,
    iconBgClass: "bg-indigo-50 dark:bg-indigo-900",
    iconColorClass: "text-indigo-500 dark:text-indigo-300",
  },
  {
    key: "pendingPayments",
    title: "Pending Requests",
    desc: "Awaiting approval",
    icon: CreditCard,
    iconBgClass: "bg-emerald-50 dark:bg-emerald-900",
    iconColorClass: "text-emerald-500 dark:text-emerald-300",
  },
  {
    key: "books",
    title: "Total Books",
    desc: "In the library",
    icon: BookOpen,
    iconBgClass: "bg-purple-50 dark:bg-purple-900",
    iconColorClass: "text-purple-500 dark:text-purple-300",
  },
];

// Badge resolver function
const getBadgeText = (key: keyof DashboardStats, value: number) => {
  switch (key) {
    case "users":
      return value > 0 ? "Active" : "Growing";
    case "pendingPayments":
      return value > 0 ? "Urgent" : "Clear";
    case "books":
      return value > 0 ? "Live" : "Empty";
  }
};

const AdminMetricsGrid = ({ stats }: Props) => {
  const statsConfig = BASE_STATS_CONFIG.map((item) => {
    const value = stats[item.key];

    // Badge text
    const badgeText = getBadgeText(item.key, value);

    // Badge color logic
    const badgeColor =
      item.key === "pendingPayments" && value > 0
        ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
        : "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300";

    const Icon = item.icon;

    return (
      <MetricDisplayCard
        key={item.key}
        title={item.title}
        value={value}
        desc={item.desc}
        icon={<Icon className="h-6 w-6" />}
        badgeText={badgeText}
        badgeColor={badgeColor}
        iconBgClass={item.iconBgClass}
        iconColorClass={item.iconColorClass}
      />
    );
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
      {statsConfig}
    </div>
  );
};

export default AdminMetricsGrid;
