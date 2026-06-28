import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useSubscriptionForm } from "../../hooks/subscription/useSubscriptionForm";
import { Link } from "react-router-dom";
import { BackButton } from "../../components/common/BackButton";
// Added a nice icon for the success state
import { CheckCircle } from "lucide-react";

const Subscription = () => {
  const { user, subscriptionStatus, isSubscribed } = useAuth();
  // 1. Notice we removed 'error' here because the hook handles it via Toasts
  const { submitPayment, loading } = useSubscriptionForm(user);

  const [file, setFile] = useState<File | null>(null);
  const [amount, setAmount] = useState("500");

  const isEffectivelySubscribed =
    isSubscribed && subscriptionStatus === "approved";
  const isWaiting = subscriptionStatus === "pending";

  if (isEffectivelySubscribed || isWaiting) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-base-100 shadow-2xl text-center p-10">
          <div
            className={`badge ${isWaiting ? "badge-warning" : "badge-success"} mb-4`}
          >
            {isWaiting ? "Under Review" : "Active"}
          </div>
          <h2 className="text-2xl font-bold">
            {isWaiting ? "Request Pending" : "Premium Active"}
          </h2>
          <p className="text-base-content/70 mt-2">
            {isWaiting
              ? "We are verifying your receipt. This usually takes less than 24h."
              : "You already have full access to all books!"}
          </p>
          <Link to="/" className="btn btn-primary mt-8">
            Return to Library
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    if (!file) return;

    // 2. Call the hook and check the boolean result
    const success = await submitPayment(file, amount);

    if (success) {
      // 3. Clear the file only if the upload actually worked
      setFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 pb-10 px-4">
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <BackButton className="mb-2" />
      </div>
      <div className="max-w-lg mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">
            Unlock Premium Access
          </h1>
          <p className="text-sm opacity-60">
            Submit your payment receipt to activate your subscription
          </p>
        </header>

        {/* PAYMENT DETAILS CARD */}
        <div className="card bg-primary text-primary-content shadow-2xl rounded-2xl overflow-hidden">
          <div className="card-body space-y-4">
            <div>
              <p className="text-xs uppercase opacity-80 font-semibold tracking-wide">
                Payment Details (CCP)
              </p>
              <p className="font-mono text-lg font-bold bg-white/10 px-3 py-2 rounded-lg mt-2 select-all">
                00799999000123456789
              </p>
              <p className="text-sm opacity-80 mt-1">
                Account Name: Nedjme Eddine Benkortbi
              </p>
            </div>
            <div className="divider divider-neutral/20 my-1"></div>
            <div className="flex justify-between items-center">
              <span className="text-sm opacity-80">Monthly Subscription</span>
              <span className="text-xl font-bold">500 DA</span>
            </div>
          </div>
        </div>

        {/* FORM CARD */}
        <form
          onSubmit={handleSubmit}
          className="card bg-base-100 border border-base-200 shadow-xl rounded-2xl"
        >
          <div className="card-body space-y-6">
            {/* 4. ERROR ALERT REMOVED - The Toast now handles this! */}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-xs uppercase tracking-wide opacity-70">
                  Amount Paid
                </span>
              </label>
              <input
                type="number"
                placeholder="e.g. 500 DA"
                className="input input-bordered focus:input-primary w-full"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-xs uppercase tracking-wide opacity-70">
                  Receipt Photo
                </span>
              </label>
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                  file
                    ? "border-success bg-success/10"
                    : "border-base-300 hover:border-primary"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
                {!file ? (
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium">
                      Click to upload receipt
                    </p>
                    <p className="text-xs opacity-50">PNG, JPG up to 10MB</p>
                  </div>
                ) : (
                  <div className="text-center space-y-1 flex flex-col items-center">
                    <CheckCircle className="text-success w-6 h-6 mb-1" />
                    <p className="text-sm font-semibold text-success">
                      Receipt Uploaded
                    </p>
                    <p className="text-xs opacity-60 truncate max-w-[200px]">
                      {file.name}
                    </p>
                  </div>
                )}
              </label>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full font-semibold ${loading ? "loading" : ""}`}
              disabled={loading || !file}
            >
              {loading ? "Submitting..." : "Submit Receipt"}
            </button>

            <div className="bg-base-200 rounded-xl p-4 text-xs opacity-70">
              After submitting your receipt, our team will verify your payment
              within 24 hours.
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Subscription;
