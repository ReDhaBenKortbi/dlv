import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { ArrowLeft, Lock, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { apiClient } from "../../infrastructure/api/ApiClient";
import { useAuth } from "../../context/AuthContext";
import { useBooks } from "../../hooks/books/useBooks";
import LoadingScreen from "../../components/common/LoadingScreen";

interface ContentUrlResponse {
  url: string;
  expiresIn: number;
}

const REFRESH_LEEWAY_MS = 60 * 1000;

const Reader = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSubscribed, isAdmin, user } = useAuth();
  const { book, isLoading, isError } = useBooks(id);

  const [contentUrl, setContentUrl] = useState<string>("");
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!id || !user) return;

    let cancelled = false;

    const load = async () => {
      try {
        const res = await apiClient.get<ContentUrlResponse>(
          `/books/${id}/content-url`,
        );
        if (cancelled) return;
        setContentUrl(res.url);
        const refreshIn = Math.max(
          res.expiresIn * 1000 - REFRESH_LEEWAY_MS,
          30 * 1000,
        );
        refreshTimer.current = setTimeout(() => void load(), refreshIn);
      } catch (error) {
        if (cancelled) return;
        const message =
          error instanceof Error ? error.message : "Failed to load book";
        toast.error(message);
      }
    };

    void load();

    return () => {
      cancelled = true;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [id, user]);

  useEffect(() => {
    const preventAction = (e: MouseEvent) => e.preventDefault();
    document.addEventListener("contextmenu", preventAction);
    return () => document.removeEventListener("contextmenu", preventAction);
  }, []);

  if (isLoading) return <LoadingScreen />;
  if (isError || !book) return <ErrorView onBack={() => navigate("/")} />;
  if (book.isPremium && !isSubscribed && !isAdmin)
    return <Navigate to="/subscription" replace />;

  return (
    <div className="h-screen w-full bg-base-100 flex flex-col overflow-hidden">
      <header className="px-4 py-3 bg-base-200/80 backdrop-blur-md flex justify-between items-center border-b border-base-300 z-20">
        <button
          onClick={() => navigate("/")}
          className="btn btn-sm btn-ghost gap-2 normal-case"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Library</span>
        </button>

        <div className="flex flex-col items-center text-center px-2 min-w-0">
          <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">
            Currently Reading
          </span>
          <span className="text-sm font-semibold truncate max-w-[150px] sm:max-w-md">
            {book.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex badge badge-outline gap-1.5 py-3 opacity-70">
            <ShieldCheck className="w-3 h-3 text-success" />
            <span className="text-[10px] uppercase font-bold">
              Secure Reader
            </span>
          </div>
          <div className="sm:hidden">
            <Lock className="w-4 h-4 opacity-50" />
          </div>
        </div>
      </header>

      <main className="flex-grow bg-base-200 relative">
        {(isIframeLoading || !contentUrl) && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-base-200">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="mt-4 text-xs font-medium opacity-50 animate-pulse uppercase tracking-tighter">
              Verifying Permissions...
            </p>
          </div>
        )}

        {contentUrl && (
          <iframe
            key={contentUrl}
            src={contentUrl}
            title={book.title}
            className={`w-full h-full border-none transition-opacity duration-700 ${
              isIframeLoading ? "opacity-0" : "opacity-100"
            }`}
            onLoad={() => setIsIframeLoading(false)}
            sandbox="allow-scripts allow-same-origin"
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
      <Lock className="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p className="mb-4 opacity-70">Unauthorized access or session expired.</p>
      <button onClick={onBack} className="btn btn-primary btn-sm px-8">
        Return Home
      </button>
    </div>
  </div>
);

export default Reader;
