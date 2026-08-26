interface FormFieldProps {
  label: string;
  /** Rendered opposite the label — Login's "Forgot password?" link. */
  labelAction?: React.ReactNode;
  /** daisyUI `validator-hint` text, revealed when the wrapped input is invalid. */
  hint?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * The `form-control` + label block the auth forms repeat for every input.
 * The label styling lived inline at ten call sites.
 */
export const FormField = ({
  label,
  labelAction,
  hint,
  children,
}: FormFieldProps) => (
  <div className="form-control">
    <label className={`label${labelAction ? " justify-between" : ""}`}>
      <span className="label-text text-xs uppercase tracking-wide opacity-90 font-semibold">
        {label}
      </span>
      {labelAction}
    </label>

    {children}

    {hint && <div className="validator-hint hidden">{hint}</div>}
  </div>
);
