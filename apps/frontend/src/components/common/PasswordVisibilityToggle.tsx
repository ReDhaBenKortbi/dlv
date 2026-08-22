import { LuEye, LuEyeOff } from "react-icons/lu";

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
    {visible ? <LuEyeOff className="h-[1em]" /> : <LuEye className="h-[1em]" />}
  </button>
);
