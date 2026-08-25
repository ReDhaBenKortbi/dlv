import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "@/services/authService";
import { notify } from "@/lib/notify";
import { PASSWORD_RESET_ENABLED } from "@/constants/features";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/common/FormField";
import { SubmitButton } from "@/components/common/SubmitButton";

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
    <AuthCard
      title="Reset Password"
      subtitle="Choose a new password"
      error={
        token ? (
          error
        ) : (
          <>
            This reset link is invalid. Request a new one from the{" "}
            <Link to="/forgot-password" className="link">
              forgot password
            </Link>{" "}
            page.
          </>
        )
      }
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          Back to Login
        </Link>
      }
    >
      {token && (
        <form onSubmit={handleSubmit} className="space-y-5">
          <FormField label="New Password">
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
          </FormField>

          <FormField label="Confirm New Password">
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
          </FormField>

          <SubmitButton loading={isLoading} loadingText="Updating...">
            Update Password
          </SubmitButton>
        </form>
      )}
    </AuthCard>
  );
};

export default ResetPassword;
