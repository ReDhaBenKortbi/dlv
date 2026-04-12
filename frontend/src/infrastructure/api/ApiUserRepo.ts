import { apiClient } from './ApiClient';
import type {
  UserRepo,
  DomainUser,
  CreateUserInput,
  SubscriptionUpdate,
  SubscriptionStatus,
} from '../../application/ports/UserRepo';

interface ApiAuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isSubscribed: boolean;
  subscriptionStatus: string;
  subscriptionStartDate?: string | null;
  subscriptionEndDate?: string | null;
  createdAt: string;
}

interface ApiUserListItem {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isSubscribed: boolean;
  subscriptionStatus: string;
  subscriptionEndDate?: string | null;
  createdAt: string;
}

function toUser(api: ApiAuthUser): DomainUser {
  return {
    id: api.id,
    email: api.email,
    fullName: api.fullName,
    role: api.role === 'ADMIN' ? 'admin' : 'client',
    isSubscribed: api.isSubscribed,
    subscriptionStatus: api.subscriptionStatus.toLowerCase() as SubscriptionStatus,
    subscriptionStartDate: api.subscriptionStartDate
      ? new Date(api.subscriptionStartDate)
      : undefined,
    subscriptionEndDate: api.subscriptionEndDate
      ? new Date(api.subscriptionEndDate)
      : undefined,
    createdAt: new Date(api.createdAt),
  };
}

function toUserFromList(api: ApiUserListItem): DomainUser {
  return {
    id: api.id,
    email: api.email,
    fullName: api.fullName,
    role: api.role === 'ADMIN' ? 'admin' : 'client',
    isSubscribed: api.isSubscribed,
    subscriptionStatus: api.subscriptionStatus.toLowerCase() as SubscriptionStatus,
    subscriptionEndDate: api.subscriptionEndDate
      ? new Date(api.subscriptionEndDate)
      : undefined,
    createdAt: new Date(api.createdAt),
  };
}

export function makeApiUserRepo(): UserRepo {
  return {
    async findById(_id: string): Promise<DomainUser | null> {
      try {
        const user = await apiClient.get<ApiAuthUser>('/auth/me');
        return toUser(user);
      } catch {
        return null;
      }
    },

    async findAll(): Promise<DomainUser[]> {
      const users = await apiClient.get<ApiUserListItem[]>('/users');
      return users.map(toUserFromList);
    },

    // No-op: the backend creates the user record during POST /auth/register.
    async create(_id: string, _input: CreateUserInput): Promise<void> {
      return;
    },

    // No-op: the backend updates subscription state atomically when processing
    // payments (PATCH /payments/:id/process) or submitting receipts (POST /payments/submit).
    async updateSubscription(_userId: string, _update: SubscriptionUpdate): Promise<void> {
      return;
    },

    async resetSubscriptionStatus(_userId: string): Promise<void> {
      await apiClient.patch('/auth/me/subscription/reset');
    },

    async setSubscribed(userId: string, isSubscribed: boolean): Promise<void> {
      await apiClient.patch(`/users/${userId}/subscription`, { isSubscribed });
    },

    subscribeToUser(
      _userId: string,
      callback: (user: DomainUser | null) => void,
    ): () => void {
      let active = true;

      const fetch = () => {
        apiClient
          .get<ApiAuthUser>('/auth/me')
          .then((api) => {
            if (active) callback(toUser(api));
          })
          .catch(() => {
            if (active) callback(null);
          });
      };

      fetch();
      const interval = setInterval(fetch, 30_000);

      return () => {
        active = false;
        clearInterval(interval);
      };
    },
  };
}
