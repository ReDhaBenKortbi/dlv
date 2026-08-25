import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuKeyRound, LuMail, LuUser } from "react-icons/lu";
import { registerUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/common/FormField";
import { SubmitButton } from "@/components/common/SubmitButton";
import { PasswordVisibilityToggle } from "@/components/common/PasswordVisibilityToggle";

const PASSWORD_RULE =
  "Must be more than 8 characters, including number, lowercase letter, uppercase letter";

export const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await registerUser(fullName, email, password);
      const registered = await refreshUser();
      navigate(registered?.role === "ADMIN" ? "/admin" : "/", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Join us to access your ebook library"
      error={error}
      footer={
        <>
          Already have an account?
          <Link
            to="/login"
            className="ml-1 text-primary font-medium hover:underline"
          >
            Login here
          </Link>
        </>
      }
      note={
        <>
          By signing up, you agree to our{" "}
          <Link to="/terms" className="link link-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="link link-primary">
            Privacy Policy
          </Link>
          .
        </>
      }
    >
      <form onSubmit={handleSignup} className="space-y-5">
        <FormField label="Full Name">
          <label className="input w-full">
            <LuUser className="h-[1em] opacity-50" />
            <input
              type="text"
              placeholder="John Doe"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </label>
        </FormField>

        <FormField label="Email Address" hint="Enter valid email address">
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

        <FormField
          label="Password"
          hint={
            <>
              Must be more than 8 characters, including
              <br />
              At least one number <br />
              At least one lowercase letter <br />
              At least one uppercase letter
            </>
          }
        >
          <label className="input validator w-full">
            <LuKeyRound className="h-[1em] opacity-50" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder="Password"
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}"
              title={PASSWORD_RULE}
            />
            <PasswordVisibilityToggle
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          </label>
        </FormField>

        <SubmitButton loading={isLoading} loadingText="Creating Account...">
          Sign Up
        </SubmitButton>
      </form>
    </AuthCard>
  );
};
