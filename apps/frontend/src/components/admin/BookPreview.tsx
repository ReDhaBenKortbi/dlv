export interface PreviewProps {
  title: string;
  author: string;
  previewUrl: string; // This will be the local blob URL from URL.createObjectURL
  isPremium?: boolean; // Optional boolean to toggle the badge
}

export const BookPreview = ({
  title,
  author,
  previewUrl,
  isPremium,
}: PreviewProps) => {
  return (
    <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 sticky top-8 transition-all duration-300">
      <div className="p-5">
        <h3 className="text-xs font-bold text-base-content/50 uppercase tracking-widest mb-4">
          Live Preview
        </h3>

        {/* COVER */}
        <div className="aspect-[3/4] bg-base-200 rounded-xl flex items-center justify-center relative overflow-hidden border border-base-300">
          {isPremium && (
            <div className="absolute top-3 right-3">
              <span className="badge badge-secondary text-[10px] px-3 py-3 font-bold shadow-sm">
                PREMIUM
              </span>
            </div>
          )}

          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Book Cover Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center opacity-40">
              <div className="text-4xl">🖼️</div>
              <p className="text-[10px] font-bold uppercase mt-2">
                No Cover Selected
              </p>
            </div>
          )}
        </div>

        {/* DETAILS */}
        <div className="mt-5 space-y-1">
          <h3 className="font-extrabold text-lg leading-tight line-clamp-2">
            {title || "Untitled Book"}
          </h3>
          <p className="text-sm text-base-content/60">
            {author || "Unknown Author"}
          </p>
        </div>

        {/* LOCK BUTTON */}
        <div className="mt-6">
          <button className="btn btn-outline btn-sm w-full opacity-70 cursor-not-allowed">
            🔒 Subscribe to Unlock
          </button>
        </div>
      </div>
    </div>
  );
};
