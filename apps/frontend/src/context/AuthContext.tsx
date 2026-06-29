import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";

export interface AuthUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  isSubscribed: boolean;
  subscriptionStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  subscriptionEndDate: string | null;
}

interface AuthContextType {
  user: AuthUser | null;
  isSubscribed: boolean;
  subscriptionStatus: "NONE" | "PENDING" | "APPROVED" | "REJECTED";
  subscriptionEndDate: string | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!localStorage.getItem("accessToken")) return;
    try {
      const data = await api<AuthUser>("/users/me");
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const logout = async () => {
    const rt = localStorage.getItem("refreshToken");
    if (rt) {
      await api("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: rt }),
      }).catch(() => {});
    }
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  };

  const isAdmin = user?.role === "ADMIN";
  const isSubscribed = user?.isSubscribed ?? false;
  const subscriptionStatus = user?.subscriptionStatus ?? "NONE";
  const subscriptionEndDate = user?.subscriptionEndDate ?? null;

  return (
    <AuthContext.Provider
      value={{ user, isSubscribed, subscriptionStatus, subscriptionEndDate, isAdmin, loading, logout, refreshUser }}
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
