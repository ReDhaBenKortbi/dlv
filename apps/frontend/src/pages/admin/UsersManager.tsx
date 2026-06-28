import { useState } from "react";
import { ADMIN_EMAIL } from "../../utils/constants";
import { useUsers } from "../../hooks/users/useUsers";
import LoadingScreen from "../../components/common/LoadingScreen";

const UsersManager = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { users, isLoading, toggleSubscription, isUpdating } = useUsers();

  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      u.email.toLowerCase().includes(term) ||
      (u.fullName && u.fullName.toLowerCase().includes(term));
    return matchesSearch && u.email !== ADMIN_EMAIL;
  });

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
                  <th className="py-4 text-left">Full Name</th>
                  <th className="text-left">Email</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-base-100 transition-colors"
                  >
                    <td className="font-medium text-gray-700">
                      {user.fullName || "-"}
                    </td>
                    <td className="font-medium text-gray-700">{user.email}</td>
                    <td>
                      {user.isSubscribed ? (
                        <span className="badge badge-success badge-sm font-bold">
                          PREMIUM
                        </span>
                      ) : (
                        <span className="badge badge-outline badge-sm font-bold opacity-60">
                          FREE
                        </span>
                      )}
                    </td>
                    <td className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          toggleSubscription(user.id, user.isSubscribed)
                        }
                        // Add 'disabled' here to prevent double-clicks
                        disabled={isUpdating}
                        className={`btn btn-sm ${
                          user.isSubscribed
                            ? "btn-outline btn-error"
                            : "btn-primary text-white"
                        }`}
                      >
                        {/* Show a mini spinner if this specific button is working */}
                        {isUpdating ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : user.isSubscribed ? (
                          "Revoke Access"
                        ) : (
                          "Grant Premium"
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredUsers.length === 0 && (
              <div className="p-10 text-center text-gray-400">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManager;
