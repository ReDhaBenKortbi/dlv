interface StatCardProps {
  title: string;
  value: string | number;
  desc: string;
  icon: React.ReactNode; // Lucide icon
  badgeText?: string;
  badgeColor?: string; // Tailwind/DaisyUI badge color
  iconColorClass: string; // e.g., "text-primary"
  iconBgClass: string; // e.g., "bg-primary/20"
}

const MetricDisplayCard = ({
  title,
  value,
  desc,
  icon,
  badgeText,
  badgeColor,
  iconColorClass,
  iconBgClass,
}: StatCardProps) => {
  return (
    <div className="card bg-base-100 dark:bg-base-200 border border-base-300 dark:border-base-400 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        {/* Icon */}
        <div
          className={`p-3 rounded-xl flex items-center justify-center ${iconBgClass} ${iconColorClass}`}
        >
          {icon}
        </div>

        {/* Badge */}
        {badgeText && (
          <span className={`badge border-none font-medium p-3 ${badgeColor}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <h3 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">
          {value}
        </h3>
        <p className="text-sm mt-1 text-gray-400 dark:text-gray-300">{desc}</p>
      </div>
    </div>
  );
};

export default MetricDisplayCard;
