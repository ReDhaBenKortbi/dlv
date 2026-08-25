import { useState } from "react";
import { usePaymentHistory } from "../../hooks/payments/usePaymentHistory";
import Pagination from "../../components/common/Pagination";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { EmptyState } from "../../components/common/EmptyState";
import { usePaginatedList } from "../../hooks/usePaginatedList";

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

  const { page, setPage, syncMeta } = usePaginatedList(
    `${statusFilter}|${planFilter}`,
  );

  const { payments, meta, isLoading, isError } = usePaymentHistory({
    status: statusFilter || undefined,
    plan: planFilter || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const totalPages = syncMeta(meta);

  return (
    <div className="p-6 space-y-6">
      <AdminPageHeader
        title="Subscribers History"
        subtitle="All payment requests and subscription activity"
        action={
          <>
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
          </>
        }
      />

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
