import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  getTickets,
  setTicketStatus,
  deleteTicket,
} from "../../services/ticketService";
import { queryKeys } from "../../lib/queryKeys";
import { notify } from "../../utils/toast";
import { toErrorMessage } from "../../lib/errorMessage";

export const useTickets = (page = 1, limit = 10) => {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.tickets.list(page, limit),
    queryFn: () => getTickets({ page, limit }),
    placeholderData: keepPreviousData,
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      // Mark resolved first (audit/consistency), then remove the ticket.
      await setTicketStatus(id, "resolved");
      await deleteTicket(id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all }),
  });

  const handleResolve = (id: string) =>
    notify.promise(resolveMutation.mutateAsync(id), {
      loading: "Resolving ticket...",
      success: "Ticket resolved & removed!",
      error: (err) => toErrorMessage(err, "Could not update ticket."),
    });

  return {
    tickets: data?.data ?? [],
    meta: data?.meta,
    isLoading,
    handleResolve,
  };
};
