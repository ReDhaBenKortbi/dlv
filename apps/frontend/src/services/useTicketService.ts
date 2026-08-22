import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { api } from "../lib/api";
import { notify } from "../utils/toast";
import type { Ticket } from "../types/ticket";

interface TicketsMeta {
  total: number;
  page: number;
  limit: number;
}

export const useTicketService = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<{ data: Ticket[]; meta: TicketsMeta }>({
    queryKey: ["tickets", page, limit],
    queryFn: () => api(`/tickets?page=${page}&limit=${limit}`),
    placeholderData: keepPreviousData,
  });
  const tickets = data?.data ?? [];
  const meta = data?.meta;

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

  return { tickets, meta, isLoading, handleResolve };
};
