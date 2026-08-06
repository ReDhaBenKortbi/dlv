import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { getUsers, updateUserSubscription } from "../../services/userService";
import type { UsersQuery } from "../../services/userService";
import { notify } from "../../utils/toast"; // Import our adapter

export const useUsers = (params: UsersQuery = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["users", params],
    queryFn: () => getUsers(params),
    placeholderData: keepPreviousData,
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
    users: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    // Id of the user currently being mutated, so only that row shows a spinner.
    pendingUserId: mutation.isPending ? mutation.variables?.userId : undefined,
    toggleSubscription, // Now returns a promise with a toast
  };
};
