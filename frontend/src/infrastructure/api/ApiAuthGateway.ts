import { setToken, getToken, apiClient } from './ApiClient';
import type { AuthGateway, DomainAuthUser } from '../../application/ports/AuthGateway';

interface ApiAuthUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

interface AuthResponse {
  accessToken: string;
  user: ApiAuthUser;
}

// Module-level auth state shared across all methods.
let currentUser: (DomainAuthUser & { role: string }) | null = null;
const authListeners: Array<(user: DomainAuthUser | null) => void> = [];

function notifyListeners(user: (DomainAuthUser & { role: string }) | null): void {
  currentUser = user;
  authListeners.forEach((cb) => cb(user));
}

function toAuthUser(api: ApiAuthUser): DomainAuthUser & { role: string } {
  return {
    uid: api.id,
    email: api.email,
    displayName: api.fullName,
    role: api.role,
  };
}

export function makeApiAuthGateway(): AuthGateway {
  return {
    async register(email, password, fullName): Promise<DomainAuthUser> {
      const data = await apiClient.post<AuthResponse>('/auth/register', {
        email,
        password,
        fullName,
      });
      setToken(data.accessToken);
      const user = toAuthUser(data.user);
      notifyListeners(user);
      return user;
    },

    async login(email, password): Promise<void> {
      const data = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
      });
      setToken(data.accessToken);
      notifyListeners(toAuthUser(data.user));
    },

    async logout(): Promise<void> {
      setToken(null);
      notifyListeners(null);
    },

    onAuthStateChanged(callback): () => void {
      authListeners.push(callback);

      if (getToken()) {
        apiClient
          .get<ApiAuthUser>('/auth/me')
          .then((api) => {
            const user = toAuthUser(api);
            currentUser = user;
            callback(user);
          })
          .catch(() => {
            setToken(null);
            currentUser = null;
            callback(null);
          });
      } else {
        // Fire asynchronously to match the async pattern callers expect.
        setTimeout(() => callback(null), 0);
      }

      return () => {
        const idx = authListeners.indexOf(callback);
        if (idx !== -1) authListeners.splice(idx, 1);
      };
    },

    async reloadCurrentUser(): Promise<void> {
      if (!getToken()) return;
      const api = await apiClient.get<ApiAuthUser>('/auth/me');
      currentUser = toAuthUser(api);
    },

    getCurrentUser(): DomainAuthUser | null {
      return currentUser;
    },

    async getIdToken(): Promise<string> {
      const token = getToken();
      if (!token) throw new Error('No authenticated user');
      return token;
    },

    async isCurrentUserAdmin(): Promise<boolean> {
      return currentUser?.role === 'ADMIN';
    },
  };
}
