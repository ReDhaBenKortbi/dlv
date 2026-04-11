import { useState } from "react";
import { useUseCases } from "../../presentation/providers/UseCasesContext";
import { Link } from "react-router-dom";
import logo from "../../assets/logo/logo.svg";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useUseCases();

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
    } catch {
      setError("Invalid email or password.");
      setLoading(false);
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
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-sm opacity-60">
                Login to continue reading your books
              </p>
            </div>

            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
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
                    disabled={loading}
                  />
                </label>
                <div className="validator-hint hidden">
                  Enter valid email address
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-xs uppercase tracking-wide opacity-70 font-semibold">
                    Password
                  </span>
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input input-bordered focus:input-primary w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`btn btn-primary w-full font-semibold ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <div className="text-center text-sm pt-2">
              Don't have an account?
              <Link
                to="/signup"
                className="ml-1 text-primary font-medium hover:underline"
              >
                Sign up here
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
