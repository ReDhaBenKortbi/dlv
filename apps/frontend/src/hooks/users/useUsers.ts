import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUsers, updateUserSubscription } from "../../services/userService";
import { notify } from "../../utils/toast"; // Import our adapter

export const useUsers = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const mutation = useMutation({
    mutationFn: updateUserSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  // Wrapped logic with Toast support
  const toggleSubscription = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;

    return await notify.promise(
      mutation.mutateAsync({ userId, isSubscribed: newStatus }),
      {
        loading: "Updating user permissions...",
        success: newStatus
          ? "Premium access granted! ✨"
          : "Access revoked successfully.",
        error: "Failed to update user status.",
      },
    );
  };

  return {
    users: query.data ?? [],
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    toggleSubscription, // Now returns a promise with a toast
  };
};
