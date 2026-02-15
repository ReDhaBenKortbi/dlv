import { useState } from "react";
import { registerUser } from "../../services/authService";
import { useNavigate, Link } from "react-router-dom";

const Signup = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  // 1. Add loading state
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await registerUser(email, password, fullName);
      navigate("/");
    } catch (err: any) {
      const message =
        err.code === "auth/email-already-in-use"
          ? "This email is already registered."
          : err.message;
      setError(message);
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
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
                📚
              </div>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold">Create Account</h2>
              <p className="text-sm opacity-60">
                Join us to access your ebook library
              </p>
            </div>

            {error && (
              <div className="alert alert-error text-sm py-2">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-5">
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs uppercase tracking-wide opacity-70 font-semibold">
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ahmed Benali"
                  className="input input-bordered focus:input-primary w-full"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading} // 4. Disable inputs while loading
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs uppercase tracking-wide opacity-70 font-semibold">
                    Email Address
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="example@mail.com"
                  className="input input-bordered focus:input-primary w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs uppercase tracking-wide opacity-70 font-semibold">
                    Password
                  </span>
                </label>
                <input
                  type="password"
                  placeholder="Minimum 8 characters"
                  className="input input-bordered focus:input-primary w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* 5. LOADING BUTTON LOGIC */}
              <button
                type="submit"
                disabled={isLoading}
                className={`btn btn-primary w-full font-semibold mt-2 ${
                  isLoading ? "loading loading-spinner" : ""
                }`}
              >
                {isLoading ? "Creating Account..." : "Sign Up"}
              </button>
            </form>

            <div className="text-center text-sm pt-2">
              Already have an account?
              <Link
                to="/login"
                className="ml-1 text-primary font-medium hover:underline"
              >
                Login here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
