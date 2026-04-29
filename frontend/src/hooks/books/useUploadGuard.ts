import { useEffect } from "react";
import { useBlocker } from "react-router-dom";

const LEAVE_CONFIRM =
  "An upload is in progress. Leaving this page will pause it. Continue?";

export function useUploadGuard(isUploading: boolean): void {
  useEffect(() => {
    if (!isUploading) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isUploading]);

  const blocker = useBlocker(({ currentLocation, nextLocation }) =>
    isUploading && currentLocation.pathname !== nextLocation.pathname,
  );

  useEffect(() => {
    if (blocker.state !== "blocked") return;
    const proceed = window.confirm(LEAVE_CONFIRM);
    if (proceed) {
      blocker.proceed();
    } else {
      blocker.reset();
    }
  }, [blocker]);
}
