import { Eye, EyeOff } from "lucide-react";

interface Props {
  visible: boolean;
  onToggle: () => void;
}

export const PasswordVisibilityToggle = ({ visible, onToggle }: Props) => (
  <button
    type="button"
    onClick={onToggle}
    tabIndex={-1}
    className="opacity-50 hover:opacity-80"
    aria-label={visible ? "Hide password" : "Show password"}
  >
    {visible ? <EyeOff className="h-[1em]" /> : <Eye className="h-[1em]" />}
  </button>
);
