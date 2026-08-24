import { useEffect, useState } from "react";
import { useUsers } from "../../hooks/users/useUsers";
import LoadingScreen from "../../components/common/LoadingScreen";
import Pagination from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { getTotalPages } from "../../lib/pagination";
import { BOOK_TIERS } from "../../constants/bookOptions";
import type { SubscriptionPlan } from "../../constants/subscriptionPlans";

const PAGE_SIZE = 20;

const TIER_BADGE_COLOR = Object.fromEntries(
  BOOK_TIERS.map((tier) => [tier.id, tier.color]),
) as Record<SubscriptionPlan, string>;

const UsersManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  // Debounce the search box so we don't fire a request on every keystroke —
  // a genuine effect (subscribing to a timer), unlike the state adjustments below.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const { users, meta, isLoading, updateTier, pendingUserId } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const totalPages = meta ? getTotalPages(meta.total, meta.limit) : 1;

  // Reset to page 1 when the (debounced) search changes, or fall back to
  // the last valid page if the total shrinks — adjusted during render
  // rather than via an effect.
  const [prevSearch, setPrevSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevSearch) {
    setPrevSearch(debouncedSearch);
    setPage(1);
  } else if (meta && page > totalPages) {
    setPage(totalPages);
  }

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-base-100 text-base-content p-4 md:p-10">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Manage accounts and subscription access
            </p>
          </div>

          <div className="form-control w-full md:w-80">
            <input
              type="text"
              placeholder="Search by email or name..."
              className="input input-bordered bg-base-200 dark:bg-base-300 shadow-sm border-gray-200 dark:border-base-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : (
          <div className="overflow-x-auto bg-base-200 rounded-2xl shadow-sm border border-base-300">
            <table className="table table-compact w-full">
              <thead className="bg-base-300 text-gray-500 uppercase text-xs font-bold">
                <tr>
                  <th className="py-4 text-left">Email</th>
                  <th>Status</th>
                  <th>Tier</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-base-100 transition-colors"
                  >
                    <td className="font-medium text-gray-700">{user.email}</td>
                    <td>
                      {user.isSubscribed ? (
                        <span className="badge badge-soft badge-info badge-sm font-bold">
                          subscribed
                        </span>
                      ) : (
                        <span className="badge badge-soft badge-error badge-sm font-bold">
                          not subscribed
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`badge badge-soft badge-sm font-bold ${
                          TIER_BADGE_COLOR[user.subscriptionPlan]
                        }`}
                      >
                        {user.subscriptionPlan}
                      </span>
                    </td>
                    <td className="flex justify-end items-center gap-2">
                      {(() => {
                        const isRowUpdating = pendingUserId === user.id;
                        return (
                          <>
                            {isRowUpdating && (
                              <span className="loading loading-spinner loading-xs"></span>
                            )}
                            <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              Set tier
                              <select
                                aria-label={`Change tier for ${user.email}`}
                                className="select select-bordered select-sm"
                                value={user.subscriptionPlan}
                                disabled={isRowUpdating}
                                onChange={(e) =>
                                  updateTier(
                                    user.id,
                                    e.target.value as SubscriptionPlan,
                                  )
                                }
                              >
                                {BOOK_TIERS.map((tier) => (
                                  <option key={tier.id} value={tier.id}>
                                    {tier.label}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </>
                        );
                      })()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <EmptyState
                size="sm"
                icon="users"
                title="No users found"
                message="No accounts match this search."
              />
            )}
          </div>
        )}

        {meta && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            total={meta.total}
            limit={meta.limit}
            className="mt-6"
          />
        )}
      </div>
    </div>
  );
};

export default UsersManager;
