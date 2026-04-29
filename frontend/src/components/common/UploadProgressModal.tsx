import { formatBytes } from "../../infrastructure/api/uploadHelpers";

interface UploadProgressModalProps {
  open: boolean;
  bytesDone: number;
  bytesTotal: number;
  title?: string;
  onCancel?: () => void;
}

export function UploadProgressModal({
  open,
  bytesDone,
  bytesTotal,
  title = "Uploading flipbook…",
  onCancel,
}: UploadProgressModalProps) {
  if (!open) return null;

  const percent = bytesTotal > 0 ? Math.min(100, (bytesDone / bytesTotal) * 100) : 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-base-100 rounded-2xl shadow-2xl border border-base-200 w-full max-w-md mx-4 p-6 space-y-5">
        <div className="flex items-center gap-3">
          <span className="loading loading-spinner loading-md text-primary" />
          <h2 id="upload-modal-title" className="text-lg font-bold">
            {title}
          </h2>
        </div>

        <div className="space-y-2">
          <progress
            className="progress progress-primary w-full"
            value={bytesDone}
            max={bytesTotal || 1}
          />
          <div className="flex justify-between text-xs text-base-content/70">
            <span>{percent.toFixed(1)}%</span>
            <span>
              {formatBytes(bytesDone)} / {formatBytes(bytesTotal)}
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-warning/10 border border-warning/30 p-3 text-xs text-base-content/80">
          <strong className="text-warning">Do not close this tab.</strong>{" "}
          Closing will pause the upload. You can resume later by re-selecting
          the same folder for this book.
        </div>

        {onCancel && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={onCancel}
            >
              Cancel upload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
