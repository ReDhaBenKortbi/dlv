import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { NotFound } from "@/pages/common/NotFound";
import { CrashFallback } from "@/components/common/CrashFallback";

// react-router's errorElement receives both real 404s (no matching route)
// and thrown render/loader errors — show the right message for each
// instead of labeling a genuine crash as "Page Not Found".
export const RouteError = () => {
  const error = useRouteError();

  if (isRouteErrorResponse(error) && error.status === 404) {
    return <NotFound />;
  }

  console.error("Unhandled route error:", error);
  return <CrashFallback />;
};
