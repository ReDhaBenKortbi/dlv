import { StatusCard } from "@/components/common/StatusCard";

export const CrashFallback = () => (
  <StatusCard
    variant="bare"
    title="Something went wrong"
    body="An unexpected error occurred. Reloading the page usually fixes this."
    action={
      <button
        onClick={() => window.location.reload()}
        className="btn btn-primary px-8"
      >
        Reload Page
      </button>
    }
  />
);
