import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  label?: string;
  className?: string;
  destination?: string | -1;
}

export const BackButton = ({
  label = "Back",
  className = "",
  destination = -1,
}: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() =>
        destination === -1 ? navigate(-1) : navigate(destination)
      }
      className={`btn btn-ghost btn-sm gap-2 group hover:bg-transparent px-0 ${className}`}
    >
      <ArrowLeft
        size={18}
        className="transition-transform group-hover:-translate-x-1"
      />
      <span className="text-sm font-semibold uppercase tracking-wider">
        {label}
      </span>
    </button>
  );
};
