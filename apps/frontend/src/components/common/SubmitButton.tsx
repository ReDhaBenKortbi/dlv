interface SubmitButtonProps {
  loading: boolean;
  /** Label while the request is in flight — "Logging in...". */
  loadingText: string;
  children: React.ReactNode;
}

/**
 * Full-width primary submit button with the spinner/disabled pairing the auth
 * forms all wanted. Login had drifted to a bare `loading` class, which shows no
 * spinner in daisyUI 5.
 */
export const SubmitButton = ({
  loading,
  loadingText,
  children,
}: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={loading}
    className={`btn btn-primary w-full font-semibold ${
      loading ? "loading loading-spinner" : ""
    }`}
  >
    {loading ? loadingText : children}
  </button>
);
