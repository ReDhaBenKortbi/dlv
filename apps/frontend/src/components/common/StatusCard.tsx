interface StatusCardProps {
  /** Icon or badge shown above the heading. */
  icon?: React.ReactNode;
  title: string;
  body?: React.ReactNode;
  /** Primary action — a Link or button, styled by the caller. */
  action?: React.ReactNode;
  /** Anything extra between the body and the action. */
  children?: React.ReactNode;
  /**
   * `card` draws the standard bordered surface used by the payment and
   * subscription screens. `bare` centres the content directly on the page,
   * for the 404 and crash screens which never had a card.
   */
  variant?: "card" | "bare";
}

/**
 * A full-screen "nothing to do here but read this" message: payment outcome,
 * subscription state, 404, crash. Six screens had each written their own
 * centred shell, disagreeing on heading size, body colour and the spacing
 * between the three parts.
 *
 * Reader's ErrorView deliberately stays out: it sits inside the reader's own
 * black chrome, and a bg-base-200 card would be the only light thing on that
 * screen.
 */
export const StatusCard = ({
  icon,
  title,
  body,
  action,
  children,
  variant = "card",
}: StatusCardProps) => {
  const isCard = variant === "card";

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div
        className={
          isCard
            ? "card w-full max-w-md bg-base-100 shadow-2xl text-center p-10 space-y-4"
            : "text-center space-y-5 max-w-sm"
        }
      >
        {icon}

        <div className="space-y-2">
          <h2 className={isCard ? "text-2xl font-bold" : "text-3xl font-bold"}>
            {title}
          </h2>
          {body && <p className="text-base-content/70">{body}</p>}
        </div>

        {children}

        {action}
      </div>
    </div>
  );
};
