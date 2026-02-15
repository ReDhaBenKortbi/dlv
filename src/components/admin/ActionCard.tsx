import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react"; // Import Lucide icon

interface ActionCardProps {
  title: string;
  description: string;
  linkText: string;
  to: string;
  icon: React.ReactNode;
  colorClass: string;
}

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  description,
  linkText,
  to,
  icon,
  colorClass,
}) => {
  return (
    <Link
      to={to}
      className="card bg-base-100 dark:bg-base-200 border border-base-300 dark:border-base-400 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer p-3 group"
    >
      <div className="card-body flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        {/* Icon Box */}
        <div
          className={`h-20 w-20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${colorClass}`}
        >
          {/* Pro-tip: If you pass Lucide icons as the 'icon' prop, 
              ensure you set a size like <Book size={32} /> when calling this component
          */}
          {icon}
        </div>

        {/* Text Content */}
        <div className="flex-1">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1 leading-tight">
            {title}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
            {description}
          </p>

          {/* Call-to-Action Footer */}
          <div className="flex items-center font-semibold text-sm transition-all">
            <span className="opacity-80 group-hover:opacity-100 mr-1">
              {linkText}
            </span>

            {/* Swapped SVG for Lucide ArrowRight */}
            <ArrowRight
              size={16}
              className="transform group-hover:translate-x-1 transition-transform text-gray-700 dark:text-gray-200"
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ActionCard;
