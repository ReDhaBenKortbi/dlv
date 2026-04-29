import { BookPreview } from "../../components/admin/BookPreview";
import { BookFormFields } from "../../components/admin/BookFormFields";
import { UploadProgressModal } from "../../components/common/UploadProgressModal";
import { useAddBookPage } from "../../hooks/books/useAddBookPage";
import { useUploadGuard } from "../../hooks/books/useUploadGuard";

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
    cancelUpload,
  } = useAddBookPage();

  useUploadGuard(isUploading);

  const handleCancel = () => {
    if (window.confirm("Cancel this upload? Files already uploaded are kept on the server. You can resume later by re-selecting the same folder.")) {
      cancelUpload();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* LEFT — FORM */}
        <div className="flex-1">
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200">
            <div className="p-6 sm:p-8">
              <form onSubmit={handlePublish}>
                <fieldset disabled={isUploading} className="space-y-6 border-0 p-0 m-0 disabled:opacity-60">
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
                </fieldset>
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

      <UploadProgressModal
        open={isUploading && uploadProgress !== null}
        bytesDone={uploadProgress?.bytesDone ?? 0}
        bytesTotal={uploadProgress?.bytesTotal ?? 0}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AddBook;
