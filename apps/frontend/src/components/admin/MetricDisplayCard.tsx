export type MetricTone = "indigo" | "emerald" | "purple";

/** Each tone's icon colours, so call sites name an intent rather than classes. */
const TONES: Record<MetricTone, string> = {
  indigo: "bg-indigo-500/10 text-indigo-500 dark:text-indigo-300",
  emerald: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-300",
  purple: "bg-purple-500/10 text-purple-500 dark:text-purple-300",
};

interface MetricDisplayCardProps {
  title: string;
  value: string | number;
  desc: string;
  icon: React.ReactNode;
  tone: MetricTone;
  badgeText?: string;
}

/**
 * One dashboard statistic.
 *
 * Previously took eight props, three of which (iconBgClass, iconColorClass,
 * badgeColor) were raw Tailwind strings — and badgeColor was the same constant
 * at every call site. They collapse into `tone`.
 */
const MetricDisplayCard = ({
  title,
  value,
  desc,
  icon,
  tone,
  badgeText,
}: MetricDisplayCardProps) => (
  <div className="card bg-base-100 border border-base-300 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl flex items-center justify-center ${TONES[tone]}`}>
        {icon}
      </div>
      {badgeText && (
        <span className="badge border-none font-medium p-3 bg-success/15 text-success">
          {badgeText}
        </span>
      )}
    </div>

    <div>
      <p className="text-sm font-medium uppercase tracking-wider text-base-content/60">
        {title}
      </p>
      <h3 className="text-3xl font-bold text-base-content mt-1">{value}</h3>
      <p className="text-sm mt-1 text-base-content/50">{desc}</p>
    </div>
  </div>
);

export default MetricDisplayCard;
