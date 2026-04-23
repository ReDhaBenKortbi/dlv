import { BookPreview } from "../../components/admin/BookPreview";
import { BookFormFields } from "../../components/admin/BookFormFields";
import { useAddBookPage } from "../../hooks/books/useAddBookPage";
import { formatBytes } from "../../infrastructure/api/uploadHelpers";

const AddBook = () => {
  const {
    fields,
    handleFieldChange,
    isPremium,
    setIsPremium,
    setCoverFile,
    handleFolderChange,
    folderFiles,
    imagePreview,
    isUploading,
    uploadProgress,
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

                {/* COVER + FOLDER SECTION */}
                <div className="bg-base-200/50 border border-base-300 rounded-xl p-5 space-y-4">
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

                  <div>
                    <label className="text-xs font-bold text-warning uppercase">
                      Book Folder (HTML/CSS/JS)
                    </label>
                    <input
                      type="file"
                      // @ts-expect-error webkitdirectory is not in TS typings
                      webkitdirectory=""
                      multiple
                      onChange={handleFolderChange}
                      className="file-input file-input-bordered bg-base-100 border-warning/40 mt-1 w-full"
                      required
                    />
                    {folderFiles.length > 0 && (
                      <p className="text-xs text-base-content/50 mt-1">
                        {folderFiles.length} files selected
                      </p>
                    )}
                  </div>
                </div>

                {/* UPLOAD PROGRESS */}
                {uploadProgress && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-base-content/60">
                      <span>Uploading…</span>
                      <span>
                        {formatBytes(uploadProgress.bytesDone)} / {formatBytes(uploadProgress.bytesTotal)}
                      </span>
                    </div>
                    <progress
                      className="progress progress-primary w-full"
                      value={uploadProgress.bytesDone}
                      max={uploadProgress.bytesTotal || 1}
                    />
                  </div>
                )}

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
                      disabled={isUploading}
                    >
                      {isUploading ? (
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
