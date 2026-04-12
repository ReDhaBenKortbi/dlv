import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUseCases } from "../../presentation/providers/UseCasesContext";
import { notify } from "../../utils/toast";

export const useUsers = () => {
  const queryClient = useQueryClient();
  const { getUsers, toggleUserSubscription } = useUseCases();

  const query = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const mutation = useMutation({
    mutationFn: ({ userId, isSubscribed }: { userId: string; isSubscribed: boolean }) =>
      toggleUserSubscription(userId, isSubscribed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const toggle = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    return notify.promise(
      mutation.mutateAsync({ userId, isSubscribed: newStatus }),
      {
        loading: "Updating user permissions...",
        success: newStatus ? "Premium access granted!" : "Access revoked successfully.",
        error: "Failed to update user status.",
      },
    );
  };

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    toggleSubscription: toggle,
  };
};
