import { useState } from "react";
import { usePaymentHistory } from "../../hooks/payments/usePaymentHistory";
import Pagination from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { getTotalPages } from "../../lib/pagination";

const STATUS_OPTIONS = ["", "PENDING", "APPROVED", "REJECTED"] as const;
const PLAN_OPTIONS = ["", "PRO", "GOLD"] as const;
const PAGE_SIZE = 20;

const STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-warning",
  APPROVED: "badge-success",
  REJECTED: "badge-error",
};

const SubscribersHistory = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);

  const { payments, meta, isLoading, isError } = usePaymentHistory({
    status: statusFilter || undefined,
    plan: planFilter || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = meta ? getTotalPages(meta.total, meta.limit) : 1;

  // Reset to page 1 when a filter changes, or fall back to the last valid
  // page if the total shrinks — adjusted during render rather than via an effect.
  const filterKey = `${statusFilter}|${planFilter}`;
  const [prevFilterKey, setPrevFilterKey] = useState(filterKey);
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey);
    setPage(1);
  } else if (meta && page > totalPages) {
    setPage(totalPages);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Subscribers History</h1>
          <p className="text-sm opacity-60 mt-1">All payment requests and subscription activity</p>
        </div>
        <div className="flex gap-2">
          <select
            className="select select-bordered select-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            className="select select-bordered select-sm"
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
          >
            <option value="">All Plans</option>
            {PLAN_OPTIONS.filter(Boolean).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="card bg-base-100 shadow border border-base-200 overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : isError ? (
          <div className="flex justify-center items-center py-20 text-error">
            Failed to load payment history.
          </div>
        ) : payments.length === 0 ? (
          <EmptyState
            size="sm"
            icon="payments"
            title="No payment records found"
            message="No payments match these filters yet."
          />
        ) : (
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Method</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="font-semibold">{p.user.fullName}</div>
                    <div className="text-xs opacity-60">{p.user.email}</div>
                  </td>
                  <td>
                    <span className="badge badge-outline">{p.plan}</span>
                  </td>
                  <td>{p.amount} DZD</td>
                  <td>
                    <span className={`badge ${STATUS_BADGE[p.status] ?? "badge-ghost"}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="text-sm opacity-70">{p.paymentMethod}</td>
                  <td className="text-sm opacity-70">
                    {new Date(p.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          total={meta.total}
          limit={meta.limit}
        />
      )}
    </div>
  );
};

export default SubscribersHistory;
