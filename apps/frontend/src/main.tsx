import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { isAuthError } from "./lib/api";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // cache data for 5 minutes
      gcTime: 1000 * 60 * 30, // cache garbage collection after 30 minutes
      refetchOnWindowFocus: false,
      // api() already retries once behind a token refresh, so a 401/403 that
      // still reaches here means the session is genuinely gone — retrying it
      // three more times (the default) just delays the redirect.
      retry: (failureCount, error) => failureCount < 2 && !isAuthError(error),
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SearchProvider>
            <App />
          </SearchProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
