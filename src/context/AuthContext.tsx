import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useUseCases } from "../presentation/providers/UseCasesContext";
import type { DomainAuthUser } from "../application/ports/AuthGateway";
import { ADMIN_EMAIL } from "../utils/constants";

interface AuthContextType {
  user: DomainAuthUser | null;
  isSubscribed: boolean;
  subscriptionStatus: "none" | "pending" | "approved" | "rejected";
  subscriptionEndDate: Date | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
  /** Get a Firebase ID token for server-verified API calls. */
  getToken: (forceRefresh?: boolean) => Promise<string>;
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
  const [loading, setLoading] = useState(true);

  // Prevents triggering expiry reset more than once per subscription period
  const expiryHandledRef = useRef(false);

  const logout = async () => {
    try {
      await authGateway.logout();
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const getToken = (forceRefresh?: boolean) => authGateway.getIdToken(forceRefresh);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Auto-expire effect: runs whenever subscription state changes.
  // Only reports state through the snapshot listener; side effect is isolated here.
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

    userRepo.resetSubscriptionStatus(user.uid).catch((err: unknown) => {
      console.error("Failed to reset expired subscription:", err);
      expiryHandledRef.current = false;
    });
  }, [user, subscriptionEndDate, isSubscribed, clock, userRepo]);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = authGateway.onAuthStateChanged(async (authUser) => {
      // Clean up previous user-doc listener immediately on auth state change
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = undefined;
      }

      if (authUser) {
        try {
          await authGateway.reloadCurrentUser().catch((err: unknown) => {
            console.warn("Network: Could not refresh session token.", err);
          });

          const freshUser = authGateway.getCurrentUser();
          setUser(freshUser);

          unsubscribeUserDoc = userRepo.subscribeToUser(authUser.uid, (domainUser) => {
            if (domainUser) {
              setIsSubscribed(domainUser.isSubscribed);
              setSubscriptionStatus(domainUser.subscriptionStatus);
              setSubscriptionEndDate(domainUser.subscriptionEndDate ?? null);
            } else {
              // User doc missing (shouldn't happen but handle gracefully)
              setIsSubscribed(false);
              setSubscriptionStatus("none");
              setSubscriptionEndDate(null);
            }
            setLoading(false);
          });
        } catch (error: unknown) {
          const code = (error as { code?: string }).code;
          if (code === "auth/user-not-found") {
            void logout();
          }
          setLoading(false);
        }
      } else {
        setUser(null);
        setIsSubscribed(false);
        setSubscriptionStatus("none");
        setSubscriptionEndDate(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authGateway, userRepo]);

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
