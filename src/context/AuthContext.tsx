import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";
import { ADMIN_EMAIL } from "../utils/constants";

interface AuthContextType {
  user: User | null;
  isSubscribed: boolean;
  subscriptionStatus: "none" | "pending" | "approved" | "rejected";
  subscriptionEndDate: Timestamp | null;
  isAdmin: boolean;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "none" | "pending" | "approved" | "rejected"
  >("none");
  const [subscriptionEndDate, setSubscriptionEndDate] =
    useState<Timestamp | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    let unsubscribeDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      // Cleanup previous listener immediately if auth state changes
      if (unsubscribeDoc) {
        unsubscribeDoc();
        unsubscribeDoc = undefined;
      }

      if (currentUser) {
        try {
          // PRO TIP: reload() can throw if network is down.
          // We wrap it but continue anyway if it's just a network error.
          await currentUser
            .reload()
            .catch((err) =>
              console.warn("Network: Could not refresh session token.", err),
            );
          setUser(auth.currentUser);

          const userDocRef = doc(db, "users", currentUser.uid);

          unsubscribeDoc = onSnapshot(
            userDocRef,
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data();
                const endDate = data.subscriptionEndDate?.toDate();
                const now = new Date();
                const isExpired = endDate && now > endDate;

                if (isExpired && data.isSubscribed) {
                  // Handle expiration
                  setIsSubscribed(false);
                  setSubscriptionStatus("none");
                  updateDoc(userDocRef, {
                    isSubscribed: false,
                    subscriptionStatus: "none",
                  });
                } else {
                  setIsSubscribed(data.isSubscribed || false);
                  setSubscriptionStatus(data.subscriptionStatus || "none");
                  setSubscriptionEndDate(data.subscriptionEndDate || null);
                }
              } else {
                // Handle case where User is in Auth but not in Firestore yet
                setIsSubscribed(false);
                setSubscriptionStatus("none");
              }
              setLoading(false);
            },
            (err) => {
              console.error("User Doc Listener Error:", err);
              setLoading(false);
            },
          );
        } catch (error: any) {
          if (error.code === "auth/user-not-found") {
            logout();
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
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
