import { EmptyState } from "../../components/common/EmptyState";
import LoadingScreen from "../../components/common/LoadingScreen";
import { usePayments } from "../../hooks/payments/usePayments";
import { FileText, Clock, Check, X, ExternalLink } from "lucide-react";

const PaymentManager = () => {
  const { requests, isLoading, handleAction, isProcessing } = usePayments();

  const onProcessClick = (request: any, status: "approved" | "rejected") => {
    const message =
      status === "approved"
        ? `Unlock Premium for ${request.userEmail}?`
        : `Reject request from ${request.userEmail}?`;

    if (window.confirm(message)) {
      handleAction(request, status);
    }
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        {/* --- Header --- */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-base-content">
              Payment Requests
            </h1>
            <p className="text-base-content/60 mt-1">
              Review and approve BaridiMob/CCP receipts
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Pending Badge */}
            <div className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 dark:bg-indigo-900/30 dark:text-indigo-300">
              <Clock size={16} />
              {requests.length} Pending Requests
            </div>
          </div>
        </div>

        {/* --- Content --- */}
        {requests.length === 0 ? (
          <div className="bg-base-100 rounded-xl border border-base-200 shadow-sm p-12 text-center">
            <EmptyState
              title="All caught up!"
              message="There are no pending payment requests to review."
              icon="search"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`bg-base-100 rounded-xl border border-base-200 shadow-sm p-5 md:p-6 transition-all hover:shadow-md ${
                  isProcessing ? "opacity-60 pointer-events-none" : ""
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                  {/* --- Icon --- */}
                  <div className="hidden sm:flex w-12 h-12 rounded-lg bg-indigo-50 text-indigo-500 items-center justify-center shrink-0 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <FileText size={24} />
                  </div>

                  {/* --- Main Data --- */}
                  <div className="flex-1 w-full space-y-4">
                    {/* Identity Row */}
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-[10px] font-bold text-base-content/40 uppercase tracking-widest">
                        USER IDENTITY
                      </span>
                      <span className="badge badge-warning bg-yellow-100 border-none text-yellow-800 rounded-md text-xs font-bold px-2 py-3 dark:bg-yellow-900/30 dark:text-yellow-400">
                        Pending
                      </span>
                      <span className="bg-base-200 text-base-content/70 text-xs px-2 py-1 rounded font-mono tracking-tight">
                        {req.userId}
                      </span>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Amount Section */}
                      <div>
                        <p className="text-[10px] font-bold text-base-content/40 uppercase mb-1 tracking-widest">
                          AMOUNT TRANSFERRED
                        </p>
                        <p className="text-2xl font-bold text-[#00A96E] dark:text-[#00C781]">
                          {req.amount} DZD
                        </p>
                        <a
                          href={req.receiptURL}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 mt-2 font-medium transition-colors dark:text-indigo-400"
                        >
                          <ExternalLink size={14} />
                          Open Receipt Image
                        </a>
                      </div>

                      {/* User Details Section (Replacing Date/Method) */}
                      <div>
                        <p className="text-[10px] font-bold text-base-content/40 uppercase mb-1 tracking-widest">
                          REQUESTED BY
                        </p>
                        <p className="text-base font-semibold text-base-content">
                          {req.fullName}
                        </p>
                        <p className="text-sm text-base-content/60 truncate">
                          {req.userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* --- Action Buttons --- */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-48 lg:border-l lg:border-base-200 lg:pl-6 pt-4 lg:pt-0">
                    <button
                      disabled={isProcessing}
                      onClick={() => onProcessClick(req, "approved")}
                      className="btn btn-success text-white w-full gap-2 border-none bg-[#00A96E] hover:bg-[#008f5d] shadow-sm normal-case font-medium"
                    >
                      <Check size={18} />
                      Confirm
                    </button>

                    <button
                      disabled={isProcessing}
                      onClick={() => onProcessClick(req, "rejected")}
                      className="btn btn-outline btn-error w-full gap-2 hover:bg-red-50 text-red-500 border-red-200 hover:border-red-300 normal-case font-medium dark:hover:bg-red-900/20"
                    >
                      <X size={18} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManager;
