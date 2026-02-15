import { useState } from "react";
import { loginUser } from "../../services/authService";
import { Link } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
    } catch (err: any) {
      setError("Invalid email or password.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-2xl rounded-2xl border border-base-200">
          <div className="card-body space-y-6">
            {/* ICON */}
            <div className="flex justify-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
                🔐
              </div>
            </div>

            {/* HEADER */}
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold">Welcome Back</h2>
              <p className="text-sm opacity-60">
                Login to continue reading your books
              </p>
            </div>

            {/* ERROR */}
            {error && (
              <div className="alert alert-error text-sm">
                <span>{error}</span>
              </div>
            )}

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-5">
              {/* EMAIL */}
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
                  required
                />
              </div>

              {/* PASSWORD */}
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

              {/* BUTTON */}
              <button
                type="submit"
                className={`btn btn-primary w-full font-semibold ${loading ? "loading" : ""}`}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            {/* FOOTER */}
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
