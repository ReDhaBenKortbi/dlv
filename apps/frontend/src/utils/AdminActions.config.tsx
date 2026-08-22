import { LuCreditCard, LuUsers } from "react-icons/lu";

export const ACTION_CARDS_CONFIG = [
  {
    title: "User Management",
    description: "View all users and manually edit their status.",
    linkText: "Manage LuUsers",
    to: "/admin/users",
    icon: <LuUsers className="h-10 w-10" />,
    colorClass:
      "bg-indigo-50 text-indigo-500 dark:bg-indigo-900 dark:text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white",
  },
  {
    title: "Subscribers History",
    description: "View all payment requests and subscription activity.",
    linkText: "View History",
    to: "/admin/subscribers-history",
    icon: <LuCreditCard className="h-10 w-10" />,
    colorClass:
      "bg-emerald-50 text-emerald-500 dark:bg-emerald-900 dark:text-emerald-300 group-hover:bg-emerald-500 group-hover:text-white",
  },
];
