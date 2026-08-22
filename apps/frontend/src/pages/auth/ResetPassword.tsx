import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../../services/authService";
import { notify } from "../../utils/toast";
import { PASSWORD_RESET_ENABLED } from "../../constants/features";
import logo from "../../assets/logo/logo.svg";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // No one can hold a valid token while the feature is off — send them to
  // the same "Coming Soon" messaging instead of a form that can't work.
  if (!PASSWORD_RESET_ENABLED) {
    return <Navigate to="/forgot-password" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (!token) {
      setError("This reset link is missing its token.");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, newPassword);
      notify.success("Password updated — please log in.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "This reset link is invalid or has expired.",
      );
    } finally {
      setIsLoading(false);
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

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold">Reset Password</h2>
              <p className="text-sm opacity-60">Choose a new password</p>
            </div>

            {!token ? (
              <div className="alert alert-error text-sm py-2">
                <span>
                  This reset link is invalid. Request a new one from the{" "}
                  <Link to="/forgot-password" className="link">
                    forgot password
                  </Link>{" "}
                  page.
                </span>
              </div>
            ) : (
              <>
                {error && (
                  <div className="alert alert-error text-sm py-2">
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-xs uppercase tracking-wide opacity-70 font-semibold">
                        New Password
                      </span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="input input-bordered focus:input-primary w-full"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text text-xs uppercase tracking-wide opacity-70 font-semibold">
                        Confirm New Password
                      </span>
                    </label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      placeholder="••••••••"
                      className="input input-bordered focus:input-primary w-full"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`btn btn-primary w-full font-semibold ${
                      isLoading ? "loading loading-spinner" : ""
                    }`}
                  >
                    {isLoading ? "Updating..." : "Update Password"}
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

export default ResetPassword;
