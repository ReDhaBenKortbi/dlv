import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../config/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { notify } from "../../utils/toast";
import { Send, CheckCircle, ShieldAlert } from "lucide-react";
import { BackButton } from "../../components/common/BackButton";

const SupportPage = () => {
  const { user } = useAuth();

  // Form States
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // View States
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  // Check for 24h cooldown on mount
  useEffect(() => {
    const checkCooldown = () => {
      const lastSubmit = localStorage.getItem(`last_ticket_${user?.uid}`);
      if (lastSubmit) {
        const lastDate = parseInt(lastSubmit);
        const now = Date.now();
        const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

        if (now - lastDate < TWENTY_FOUR_HOURS) {
          setIsBlocked(true);
          const remainingMs = TWENTY_FOUR_HOURS - (now - lastDate);
          const hours = Math.ceil(remainingMs / (1000 * 60 * 60));
          setTimeLeft(`${hours} hours`);
        }
      }
    };

    if (user?.uid) checkCooldown();
  }, [user?.uid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isBlocked) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "tickets"), {
        userId: user?.uid || "anonymous",
        userEmail: user?.email || "anonymous",
        subject,
        message,
        status: "new",
        createdAt: serverTimestamp(),
      });

      // Set cooldown in localStorage
      localStorage.setItem(`last_ticket_${user?.uid}`, Date.now().toString());

      setIsSubmitted(true);
      notify.success("Support ticket sent!");
    } catch (error) {
      console.error("Support submission error:", error);
      notify.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 flex flex-col items-center justify-center relative">
      {/* Navigation */}
      <div className="absolute top-6 left-6">
        <BackButton />
      </div>

      <div className="max-w-md w-full bg-base-100 rounded-2xl shadow-xl p-8 border border-base-300">
        {/* CASE 1: USER IS BLOCKED (SPAM PROTECTION) */}
        {isBlocked && !isSubmitted ? (
          <div className="text-center py-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-center mb-4">
              <div className="bg-warning/10 text-warning p-4 rounded-full">
                <ShieldAlert size={40} />
              </div>
            </div>
            <h2 className="text-xl font-bold">Cooldown Active</h2>
            <p className="text-base-content/60 mt-2 text-sm">
              To prevent spam, we only allow one support request every 24 hours.
            </p>
            <div className="mt-6 p-3 bg-base-200 rounded-lg text-xs font-medium uppercase tracking-wider">
              Available again in:{" "}
              <span className="text-primary">{timeLeft}</span>
            </div>
          </div>
        ) : isSubmitted ? (
          /* CASE 2: SUCCESSFUL SUBMISSION */
          <div className="text-center py-6 animate-in zoom-in duration-300">
            <div className="flex justify-center mb-4">
              <div className="bg-success/10 text-success p-4 rounded-full">
                <CheckCircle size={40} />
              </div>
            </div>
            <h2 className="text-2xl font-bold">All Set!</h2>
            <p className="text-base-content/60 mt-2">
              We've received your message. Our team will review it and get back
              to you as soon as possible.
            </p>
            <button
              onClick={() => window.history.back()}
              className="btn btn-primary btn-outline btn-sm mt-8 w-full"
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          /* CASE 3: THE FORM */
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-base-content">
                Need Help?
              </h2>
              <p className="text-base-content/50 text-sm mt-1">
                Describe your issue and we'll help you out.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium">Subject</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered focus:input-primary w-full"
                  placeholder="What's going on?"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-medium">Message</span>
                </label>
                <textarea
                  className="textarea textarea-bordered focus:textarea-primary h-32 w-full resize-none"
                  placeholder="Provide as much detail as possible..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full gap-2 mt-4"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <>
                    <Send size={18} />
                    <span>Send Ticket</span>
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default SupportPage;
