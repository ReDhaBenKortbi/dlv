import { LuCircleCheckBig, LuClock } from "react-icons/lu";

import LoadingScreen from "../../components/common/LoadingScreen";
import Pagination from "../../components/common/Pagination";
import { AdminPageHeader } from "../../components/admin/AdminPageHeader";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import { useTickets } from "../../hooks/tickets/useTickets";

const AdminTicketList = () => {
  const { page, setPage, syncMeta } = usePaginatedList();
  const { tickets, meta, isLoading, handleResolve } = useTickets(page);
  const totalPages = syncMeta(meta);

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-base-100">
      <AdminPageHeader
        className="mb-6"
        title="Support Tickets"
        subtitle="Messages sent from the in-app support form."
      />

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <p className="text-center opacity-50 py-10">No messages yet.</p>
        ) : (
          tickets.map((ticket) => (
            <div
              key={ticket.id}
              className={`p-4 rounded-lg border flex justify-between items-start gap-4 ${
                ticket.status === "resolved"
                  ? "opacity-50 bg-base-200"
                  : "bg-base-100 shadow-sm border-primary/20"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {ticket.status !== "resolved" && (
                    <LuClock size={14} className="text-warning" />
                  )}
                  <h3 className="font-bold">{ticket.subject}</h3>
                </div>
                <p className="text-sm text-base-content/80">{ticket.message}</p>
              </div>

              <div className="flex gap-2">
                {ticket.status !== "resolved" && (
                  <button
                    onClick={() => handleResolve(ticket.id)}
                    className="btn btn-square btn-sm btn-success outline-none"
                    title="Resolve"
                  >
                    <LuCircleCheckBig size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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
  );
};

export default AdminTicketList;
