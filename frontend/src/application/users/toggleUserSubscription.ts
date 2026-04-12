import type { UserRepo } from "../ports/UserRepo";

export function makeToggleUserSubscription(userRepo: UserRepo) {
  return function toggleUserSubscription(
    userId: string,
    isSubscribed: boolean,
  ): Promise<void> {
    return userRepo.setSubscribed(userId, isSubscribed);
  };
}
