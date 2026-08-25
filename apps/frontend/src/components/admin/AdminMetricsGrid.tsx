import { LuUsers, LuBookOpen, LuCrown } from "react-icons/lu";

import { MetricDisplayCard } from "@/components/admin/MetricDisplayCard";
import type { MetricTone } from "@/components/admin/MetricDisplayCard";
import type { DashboardStats } from "@/services/userService";

interface Props {
  stats: DashboardStats;
}

const METRICS: {
  key: keyof DashboardStats;
  title: string;
  desc: string;
  icon: React.ElementType;
  tone: MetricTone;
  /** Badge shown once the figure is non-zero. */
  badge: string;
  /** Badge shown while it is still zero. */
  emptyBadge: string;
}[] = [
  {
    key: "users",
    title: "Total Users",
    desc: "Registered accounts",
    icon: LuUsers,
    tone: "indigo",
    badge: "Active",
    emptyBadge: "Growing",
  },
  {
    key: "activeSubscribers",
    title: "Active Subscribers",
    desc: "Currently subscribed",
    icon: LuCrown,
    tone: "emerald",
    badge: "Premium",
    emptyBadge: "None",
  },
  {
    key: "books",
    title: "Total Books",
    desc: "In the library",
    icon: LuBookOpen,
    tone: "purple",
    badge: "Live",
    emptyBadge: "Empty",
  },
];

export const AdminMetricsGrid = ({ stats }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
    {METRICS.map(({ key, title, desc, icon: Icon, tone, badge, emptyBadge }) => {
      const value = stats[key];
      return (
        <MetricDisplayCard
          key={key}
          title={title}
          value={value}
          desc={desc}
          tone={tone}
          icon={<Icon className="h-6 w-6" />}
          badgeText={value > 0 ? badge : emptyBadge}
        />
      );
    })}
  </div>
);
