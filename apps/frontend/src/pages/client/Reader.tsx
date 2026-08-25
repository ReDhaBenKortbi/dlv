import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { LuArrowLeft, LuLock, LuLoaderCircle, LuShieldCheck } from "react-icons/lu";

import { useAuth } from "../../context/AuthContext";
import { useBook } from "../../hooks/books/useBook";
import LoadingScreen from "../../components/common/LoadingScreen";
import { getAccessToken } from "../../lib/api";
import { canAccessTier } from "../../lib/bookSeries";
import { API_URL } from "../../config/env";

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subscriptionPlan, isAdmin } = useAuth();
  const { book, isLoading, isError } = useBook(id);

  // Increments every 14 min to re-derive proxyUrl with a fresh access token
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 14 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const proxyUrl = useMemo(() => {
    if (!id) return "";
    const token = getAccessToken() ?? "";
    return `${API_URL}/books/${id}/read?token=${encodeURIComponent(token)}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, tick]); // tick intentionally triggers re-derivation of the access token

  // A new proxyUrl remounts the iframe, so show the loader again until it
  // reports back. Note the token refresh also drops the reader's page
  // position — an accepted trade-off of passing the token in the URL.
  const [loadedUrl, setLoadedUrl] = useState("");
  const isIframeLoading = loadedUrl !== proxyUrl;

  useEffect(() => {
    const preventAction = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", preventAction);
    return () => document.removeEventListener("contextmenu", preventAction);
  }, []);

  if (isLoading) return <LoadingScreen />;
  if (isError || !book) return <ErrorView onBack={() => navigate("/")} />;
  if (!canAccessTier(book.bookTier, subscriptionPlan, isAdmin)) {
    return <Navigate to="/subscription" replace />;
  }

  return (
    <div className="h-screen w-full bg-base-100 flex flex-col overflow-hidden">
      {/* Top Bar */}
      <header className="px-4 bg-base-200/70 backdrop-blur-md flex justify-between items-center border-b border-base-300 z-20">
        <button
          onClick={() => navigate("/")}
          className="btn btn-sm btn-ghost gap-2 normal-case"
        >
          <LuArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Library</span>
        </button>

        <div className="flex flex-col items-center text-center px-2">
          <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
            Currently Reading
          </span>
          <span className="text-sm font-semibold truncate max-w-[150px] sm:max-w-md">
            {book.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex badge badge-outline gap-1.5 py-3 opacity-70">
            <LuShieldCheck className="w-3 h-3 text-success" />
            <span className="text-[10px] uppercase font-bold">
              Secure Reader
            </span>
          </div>
          <div className="sm:hidden">
            <LuLock className="w-4 h-4 opacity-50" />
          </div>
        </div>
      </header>

      {/* Reader Container */}
      <main className="flex-grow bg-base-200 relative">
        {/* Spinner: Visible until iframe finishes loading */}
        {(isIframeLoading || !proxyUrl) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-base-200">
            <LuLoaderCircle className="w-10 h-10 text-primary animate-spin" />
            <p className="mt-4 text-xs font-medium opacity-50 animate-pulse uppercase tracking-tighter">
              Verifying Permissions...
            </p>
          </div>
        )}

        {proxyUrl && (
          <iframe
            src={proxyUrl}
            title={book.title}
            className={`w-full h-full border-none transition-opacity duration-700 ${
              isIframeLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setLoadedUrl(proxyUrl)}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            allowFullScreen
          />
        )}
      </main>
    </div>
  );
};

const ErrorView = ({ onBack }: { onBack: () => void }) => (
  <div className="flex h-screen items-center justify-center bg-black text-white p-4">
    <div className="text-center">
      <LuLock className="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p className="mb-4 opacity-70">Unauthorized access or session expired.</p>
      <button onClick={onBack} className="btn btn-primary btn-sm px-8">
        Return Home
      </button>
    </div>
  </div>
);

export default Reader;
