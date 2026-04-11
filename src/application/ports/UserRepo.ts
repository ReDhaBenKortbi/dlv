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
  findAll(): Promise<DomainUser[]>;
  create(id: string, input: CreateUserInput): Promise<void>;
  updateSubscription(userId: string, update: SubscriptionUpdate): Promise<void>;
  resetSubscriptionStatus(userId: string): Promise<void>;
  /** Toggle just the isSubscribed flag (admin override). */
  setSubscribed(userId: string, isSubscribed: boolean): Promise<void>;
  /**
   * Subscribe to real-time changes on a single user document.
   * Returns an unsubscribe function.
   */
  subscribeToUser(
    userId: string,
    callback: (user: DomainUser | null) => void,
  ): () => void;
}
