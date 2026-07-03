import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { notify } from "../utils/toast";
import type { Ticket } from "../types/ticket";

export const useTicketService = () => {
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery<Ticket[]>({
    queryKey: ["tickets"],
    queryFn: () => api("/tickets"),
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mark resolved first (audit/consistency), then remove the ticket.
      await api(`/tickets/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      await api(`/tickets/${id}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
  });

  const handleResolve = (id: string) => {
    notify.promise(resolveMutation.mutateAsync(id), {
      loading: "Resolving ticket...",
      success: "Ticket resolved & removed!",
      error: "Could not update ticket.",
    });
  };

  return { tickets, isLoading, handleResolve };
};
