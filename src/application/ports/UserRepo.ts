export type SubscriptionStatus = "none" | "pending" | "approved" | "rejected";

export interface SubscriptionUpdate {
  isSubscribed: boolean;
  status: SubscriptionStatus;
  startDate: Date | null;
  endDate: Date | null;
}

export interface DomainUser {
  id: string;
  email: string;
  fullName: string;
  isSubscribed: boolean;
  subscriptionStatus: SubscriptionStatus;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  role: "client" | "admin";
  createdAt: Date;
}

export type CreateUserInput = Omit<DomainUser, "id" | "createdAt">;

export interface UserRepo {
  findById(id: string): Promise<DomainUser | null>;
  create(id: string, input: CreateUserInput): Promise<void>;
  updateSubscription(userId: string, update: SubscriptionUpdate): Promise<void>;
  resetSubscriptionStatus(userId: string): Promise<void>;
}
