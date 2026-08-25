import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { notify } from "@/lib/notify";

export const SubscriptionWatcher = () => {
  const { user, isSubscribed, loading } = useAuth();

  useEffect(() => {
    if (loading || !user) return;

    const storageKey = `sub_status_${user.id}`;
    const lastKnownStatus = localStorage.getItem(storageKey);

    if (lastKnownStatus === "false" && isSubscribed === true) {
      notify.success("🎉 Premium Access Activated!");
    } else if (lastKnownStatus === "true" && isSubscribed === false) {
      notify.error("Your Premium access has expired.");
    }

    localStorage.setItem(storageKey, isSubscribed.toString());
  }, [isSubscribed, user, loading]);

  return null;
};
