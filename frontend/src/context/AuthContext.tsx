import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useUseCases } from "../presentation/providers/UseCasesContext";
import type { DomainAuthUser } from "../application/ports/AuthGateway";

interface AuthContextType {
  user: DomainAuthUser | null;
  isSubscribed: boolean;
  subscriptionStatus: "none" | "pending" | "approved" | "rejected";
  subscriptionEndDate: Date | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  /** Get the current JWT for authenticated API calls. */
  getToken: (forceRefresh?: boolean) => Promise<string>;
  /** Force-refresh the current user's profile from the server. */
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { authGateway, userRepo, clock } = useUseCases();

  const [user, setUser] = useState<DomainAuthUser | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "none" | "pending" | "approved" | "rejected"
  >("none");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTick, setRefreshTick] = useState(0);

  const expiryHandledRef = useRef(false);

  const refreshUser = useCallback(() => setRefreshTick((n) => n + 1), []);

  const logout = async () => {
    await authGateway.logout();
  };

  const getToken = (_forceRefresh?: boolean) => authGateway.getIdToken();

  // Auto-expire effect: detects client-side subscription expiry and
  // notifies the backend so persistent state stays consistent.
  useEffect(() => {
    if (!user || !subscriptionEndDate || !isSubscribed) {
      expiryHandledRef.current = false;
      return;
    }

    const isExpired = clock.now() > subscriptionEndDate;
    if (!isExpired || expiryHandledRef.current) return;

    expiryHandledRef.current = true;
    setIsSubscribed(false);
    setSubscriptionStatus("none");
    setSubscriptionEndDate(null);

    userRepo.resetSubscriptionStatus(user.uid).catch(() => {
      expiryHandledRef.current = false;
    });
  }, [user, subscriptionEndDate, isSubscribed, clock, userRepo]);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = authGateway.onAuthStateChanged(async (authUser) => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = undefined;
      }

      if (authUser) {
        setUser(authUser);

        const adminFlag = await authGateway.isCurrentUserAdmin().catch(() => false);
        setIsAdmin(adminFlag);

        unsubscribeUserDoc = userRepo.subscribeToUser(authUser.uid, (domainUser) => {
          if (domainUser) {
            setIsSubscribed(domainUser.isSubscribed);
            setSubscriptionStatus(domainUser.subscriptionStatus);
            setSubscriptionEndDate(domainUser.subscriptionEndDate ?? null);
          } else {
            setIsSubscribed(false);
            setSubscriptionStatus("none");
            setSubscriptionEndDate(null);
          }
          setLoading(false);
        });
      } else {
        setUser(null);
        setIsSubscribed(false);
        setSubscriptionStatus("none");
        setSubscriptionEndDate(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, [authGateway, userRepo, refreshTick]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isSubscribed,
        subscriptionStatus,
        subscriptionEndDate,
        isAdmin,
        loading,
        logout,
        getToken,
        refreshUser,
      }}
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
