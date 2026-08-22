import { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "../../services/authService";
import { PASSWORD_RESET_ENABLED } from "../../constants/features";
import { SUPPORT_EMAIL } from "../../constants/contact";
import logo from "../../assets/logo/logo.svg";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await requestPasswordReset(email);
    } finally {
      // Always show the same success state, whether or not the email
      // is registered — this endpoint never reveals which is true.
      setIsLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-2xl rounded-2xl border border-base-200">
          <div className="card-body space-y-6">
            <div className="flex justify-center">
              <img
                src={logo}
                alt="DLV Logo"
                className="h-32 md:h-34 w-auto bg-white rounded-full"
              />
            </div>

            {!PASSWORD_RESET_ENABLED ? (
              <div className="text-center space-y-3 py-2">
                <h2 className="text-2xl font-bold">Coming Soon</h2>
                <p className="text-sm opacity-60">
                  Email-based password reset isn't available yet. If you're
                  locked out of your account, email{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="link link-primary"
                  >
                    {SUPPORT_EMAIL}
                  </a>{" "}
                  and we'll help you directly.
                </p>
              </div>
            ) : sent ? (
              <div className="text-center space-y-3 py-2">
                <h2 className="text-2xl font-bold">Check your email</h2>
                <p className="text-sm opacity-60">
                  If an account exists for <strong>{email}</strong>, we've
                  sent a link to reset your password. It expires in 1 hour.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-bold">Forgot Password</h2>
                  <p className="text-sm opacity-60">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-xs uppercase tracking-wide opacity-70 font-semibold">
                        Email Address
                      </span>
                    </label>
                    <label className="input validator w-full">
                      <svg
                        className="h-[1em] opacity-50"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <g
                          strokeLinejoin="round"
                          strokeLinecap="round"
                          strokeWidth="2.5"
                          fill="none"
                          stroke="currentColor"
                        >
                          <rect width="20" height="16" x="2" y="4" rx="2"></rect>
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
                        </g>
                      </svg>
                      <input
                        type="email"
                        placeholder="mail@site.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`btn btn-primary w-full font-semibold ${
                      isLoading ? "loading loading-spinner" : ""
                    }`}
                  >
                    {isLoading ? "Sending..." : "Send Reset Link"}
                  </button>
                </form>
              </>
            )}

            <div className="text-center text-sm pt-2">
              <Link
                to="/login"
                className="text-primary font-medium hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
