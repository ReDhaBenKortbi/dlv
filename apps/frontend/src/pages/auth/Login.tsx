import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuMail } from "react-icons/lu";
import { loginUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { AuthCard } from "@/components/auth/AuthCard";
import { FormField } from "@/components/common/FormField";
import { SubmitButton } from "@/components/common/SubmitButton";
import { PasswordVisibilityToggle } from "@/components/common/PasswordVisibilityToggle";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      const loggedIn = await refreshUser();
      navigate(loggedIn?.role === "ADMIN" ? "/admin" : "/", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Login to continue reading your books"
      error={error}
      footer={
        <>
          Don't have an account?
          <Link
            to="/signup"
            className="ml-1 text-primary font-medium hover:underline"
          >
            Sign up here
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-5">
        <FormField label="Email Address" hint="Enter valid email address">
          <label className="input validator w-full">
            <LuMail className="h-[1em] opacity-50" />
            <input
              type="email"
              placeholder="mail@site.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </label>
        </FormField>

        <FormField
          label="Password"
          labelAction={
            <Link
              to="/forgot-password"
              className="label-text-alt text-primary hover:underline"
            >
              Forgot password?
            </Link>
          }
        >
          <label className="input input-bordered focus-within:input-primary w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="grow"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <PasswordVisibilityToggle
              visible={showPassword}
              onToggle={() => setShowPassword((v) => !v)}
            />
          </label>
        </FormField>

        <SubmitButton loading={loading} loadingText="Logging in...">
          Login
        </SubmitButton>
      </form>
    </AuthCard>
  );
};
