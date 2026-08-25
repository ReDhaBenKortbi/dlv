import { useNavigate } from "react-router-dom";
import { LuArrowLeft } from "react-icons/lu";

interface BackButtonProps {
  label?: string;
  className?: string;
  /** Where to go. Omit to step back through history. */
  to?: string;
}

export const BackButton = ({
  label = "Back",
  className = "",
  to,
}: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => (to ? navigate(to) : navigate(-1))}
      className={`btn btn-ghost btn-sm gap-2 group hover:bg-transparent px-0 ${className}`}
    >
      <LuArrowLeft
        size={18}
        className="transition-transform group-hover:-translate-x-1"
      />
      <span className="text-sm font-semibold uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
};
