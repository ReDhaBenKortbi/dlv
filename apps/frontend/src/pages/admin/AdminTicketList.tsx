import { CheckCircle, Clock, Trash2 } from "lucide-react";
import LoadingScreen from "../../components/common/LoadingScreen";
import { useTicketService } from "../../services/useTicketService";

// This tells TypeScript what a Ticket looks like
interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: "new" | "resolved";
}

const AdminTicketList = () => {
  const { tickets, isLoading, handleResolve, handleRemove } =
    useTicketService();

  if (isLoading) return <LoadingScreen />;

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-base-100">
      <h1 className="text-2xl font-bold mb-6">Support Tickets</h1>

      <div className="space-y-4">
        {tickets.length === 0 ? (
          <p className="text-center opacity-50 py-10">No messages yet.</p>
        ) : (
          (tickets as Ticket[]).map((ticket) => (
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
                    <Clock size={14} className="text-warning" />
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
                    <CheckCircle size={18} />
                  </button>
                )}
                <button
                  onClick={() => handleRemove(ticket.id)}
                  className="btn btn-square btn-sm btn-ghost text-error"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTicketList;
