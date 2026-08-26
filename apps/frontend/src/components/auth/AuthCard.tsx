import logo from "@/assets/logo/logo.svg";

interface AuthCardProps {
  title: string;
  subtitle?: React.ReactNode;
  /** Shown as an alert between the heading and the form. */
  error?: React.ReactNode;
  /** The link row under the form — "Sign up here", "Back to Login". */
  footer?: React.ReactNode;
  /** Fine print below the footer, e.g. the terms notice on signup. */
  note?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * The shell every auth page draws: a centred card holding the logo, the
 * heading, an optional error alert, the page's own form, then its links.
 * All four pages had hand-copied this markup, and the copies had drifted
 * (`alert-error text-sm` vs `... py-2`, differing heading spacing).
 */
export const AuthCard = ({
  title,
  subtitle,
  error,
  footer,
  note,
  children,
}: AuthCardProps) => (
  <main className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
    <div className="w-full max-w-md">
      <div className="card bg-base-100 shadow-2xl rounded-2xl border border-base-200">
        <div className="card-body space-y-6">
          <div className="flex justify-center">
            <img
              src={logo}
              alt="DLV Logo"
              width={128}
              height={128}
              className="h-32 md:h-34 w-auto bg-white rounded-full"
            />
          </div>

          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">{title}</h2>
            {subtitle && <p className="text-sm opacity-60">{subtitle}</p>}
          </div>

          {error && (
            <div className="alert alert-error text-sm">
              <span>{error}</span>
            </div>
          )}

          {children}

          {footer && <div className="text-center text-sm pt-2">{footer}</div>}

          {note && <p className="text-center text-xs opacity-70">{note}</p>}
        </div>
      </div>
    </div>
  </main>
);
