import { BookPreview } from "../../components/admin/BookPreview";
import { BookFormFields } from "../../components/admin/BookFormFields";
import { useAddBookPage } from "../../hooks/books/useAddBookPage";

const AddBook = () => {
  const {
    fields,
    handleFieldChange,
    isPremium,
    setIsPremium,
    flipbookURL,
    setFlipbookURL,
    setCoverFile,
    imagePreview,
    isUploadingImage,
    isProcessing,
    handlePublish,
  } = useAddBookPage();

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* LEFT — FORM */}
        <div className="flex-1">
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200">
            <div className="p-6 sm:p-8">
              <form onSubmit={handlePublish} className="space-y-6">
                <BookFormFields
                  values={fields}
                  onChange={handleFieldChange}
                  requireSelects
                />

                {/* URL + COVER SECTION */}
                <div className="bg-base-200/50 border border-base-300 rounded-xl p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-warning uppercase">
                      Netlify URL (index.html)
                    </label>
                    <input
                      type="url"
                      placeholder="https://your-flipbook.netlify.app/index.html"
                      className="input input-bordered bg-base-100 border-warning/40 mt-1 w-full"
                      value={flipbookURL}
                      onChange={(e) => setFlipbookURL(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-base-content/60 uppercase">
                      Cover Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
                      className="file-input file-input-bordered bg-base-100 border-base-300 mt-1 w-full"
                      required
                    />
                  </div>
                </div>

                {/* PREMIUM + ACTIONS */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-secondary"
                      checked={isPremium}
                      onChange={(e) => setIsPremium(e.target.checked)}
                    />
                    <span className="text-xs font-bold text-secondary uppercase">
                      Set as Premium
                    </span>
                  </label>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary px-10 shadow-lg"
                      disabled={isUploadingImage || isProcessing}
                    >
                      {isUploadingImage ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        "Publish to Library"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT — PREVIEW */}
        <div className="w-full lg:w-80">
          <BookPreview
            title={fields.title}
            author={fields.author}
            previewUrl={imagePreview}
            isPremium={isPremium}
          />
        </div>
      </div>
    </div>
  );
};

export default AddBook;
