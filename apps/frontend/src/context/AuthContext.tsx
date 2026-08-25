import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, setAccessToken } from "@/lib/api";
import type { SubscriptionPlan } from "@/constants/subscriptionPlans";

export interface AuthUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  isSubscribed: boolean;
  subscriptionStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  subscriptionPlan: SubscriptionPlan;
  subscriptionEndDate: string | null;
  updatedAt: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isSubscribed: boolean;
  subscriptionStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  subscriptionPlan: SubscriptionPlan;
  subscriptionEndDate: string | null;
  subscriptionUpdatedAt: string | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  /** Re-reads /users/me and returns the loaded user, or null if unauthenticated. */
  refreshUser: () => Promise<AuthUser | null>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Returns the user rather than only storing it: callers that navigate
  // immediately after (login, signup) would otherwise read `user`/`isAdmin`
  // from the context value captured in the render *before* this ran, and so
  // always see the pre-login state.
  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const data = await api<AuthUser>("/users/me");
      setUser(data);
      return data;
    } catch {
      setUser(null);
      setAccessToken(null);
      return null;
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const logout = async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    setAccessToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === "ADMIN";
  const isSubscribed = user?.isSubscribed ?? false;
  const subscriptionStatus = user?.subscriptionStatus ?? "NONE";
  const subscriptionPlan = user?.subscriptionPlan ?? "FREE";
  const subscriptionEndDate = user?.subscriptionEndDate ?? null;
  const subscriptionUpdatedAt = user?.updatedAt ?? null;

  return (
    <AuthContext.Provider
      value={{ user, isSubscribed, subscriptionStatus, subscriptionPlan, subscriptionEndDate, subscriptionUpdatedAt, isAdmin, loading, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
