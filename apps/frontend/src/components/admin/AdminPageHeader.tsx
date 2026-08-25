interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  /** Optional trailing control — an action button, a filter group. */
  action?: React.ReactNode;
  className?: string;
}

/**
 * The title / subtitle / action row shared by the admin pages, which had each
 * written their own with different heading sizes and colour tokens.
 */
export const AdminPageHeader = ({
  title,
  subtitle,
  action,
  className = "",
}: AdminPageHeaderProps) => (
  <div
    className={`flex flex-col md:flex-row md:items-center justify-between gap-4 ${className}`}
  >
    <div>
      <h1 className="text-2xl md:text-3xl font-bold text-base-content">{title}</h1>
      {subtitle && (
        <p className="text-sm md:text-base text-base-content/60 mt-1">{subtitle}</p>
      )}
    </div>
    {action && <div className="flex gap-2 flex-none">{action}</div>}
  </div>
);
