import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { getUsers, updateUserSubscription } from "../../services/userService";
import type { UsersQuery } from "../../services/userService";
import type { SubscriptionPlan } from "../../constants/subscriptionPlans";
import { notify } from "../../utils/toast";
import { toErrorMessage } from "../../lib/errorMessage";

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
  const updateTier = async (userId: string, plan: SubscriptionPlan) => {
    return await notify.promise(mutation.mutateAsync({ userId, plan }), {
      loading: "Updating user permissions...",
      success:
        plan === "FREE"
          ? "Access revoked successfully."
          : `${plan === "GOLD" ? "Gold" : "Pro"} access granted! ✨`,
      error: (err) => toErrorMessage(err, "Failed to update user status."),
    });
  };

  return {
    users: query.data?.data ?? [],
    meta: query.data?.meta,
    isLoading: query.isLoading,
    isUpdating: mutation.isPending,
    // Id of the user currently being mutated, so only that row shows a spinner.
    pendingUserId: mutation.isPending ? mutation.variables?.userId : undefined,
    updateTier, // Now returns a promise with a toast
  };
};
