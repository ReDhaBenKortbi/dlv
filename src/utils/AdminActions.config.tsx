import { Users, CreditCard } from "lucide-react";

export const ACTION_CARDS_CONFIG = [
  {
    title: "Payment Approvals",
    description: "Verify CCP receipts and unlock user accounts.",
    linkText: "Manage Payments",
    to: "/admin/payments",
    icon: <CreditCard className="h-10 w-10" />,
    colorClass:
      "bg-emerald-50 text-emerald-500 dark:bg-emerald-900 dark:text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white",
  },
  {
    title: "User Management",
    description: "View all users and manually edit their status.",
    linkText: "Manage Users",
    to: "/admin/users",
    icon: <Users className="h-10 w-10" />,
    colorClass:
      "bg-indigo-50 text-indigo-500 dark:bg-indigo-900 dark:text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white",
  },
];
