import { useState } from "react";
import { Link } from "react-router-dom";
import { LuMail } from "react-icons/lu";
import { requestPasswordReset } from "@/services/authService";
import { PASSWORD_RESET_ENABLED } from "@/constants/features";
import { SUPPORT_EMAIL } from "@/constants/contact";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/common/FormField";
import { SubmitButton } from "@/components/common/SubmitButton";

const backToLogin = (
  <Link to="/login" className="text-primary font-medium hover:underline">
    Back to Login
  </Link>
);

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

  if (!PASSWORD_RESET_ENABLED) {
    return (
      <AuthCard
        title="Coming Soon"
        subtitle={
          <>
            Email-based password reset isn't available yet. If you're locked out
            of your account, email{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="link link-primary">
              {SUPPORT_EMAIL}
            </a>{" "}
            and we'll help you directly.
          </>
        }
        footer={backToLogin}
      />
    );
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your email"
        subtitle={
          <>
            If an account exists for <strong>{email}</strong>, we've sent a link
            to reset your password. It expires in 1 hour.
          </>
        }
        footer={backToLogin}
      />
    );
  }

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email and we'll send you a reset link"
      footer={backToLogin}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email Address">
          <label className="input validator w-full">
            <LuMail className="h-[1em] opacity-50" />
            <input
              type="email"
              placeholder="mail@site.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </label>
        </FormField>

        <SubmitButton loading={isLoading} loadingText="Sending...">
          Send Reset Link
        </SubmitButton>
      </form>
    </AuthCard>
  );
};

export default ForgotPassword;
