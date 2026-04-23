import LoadingScreen from "../../components/common/LoadingScreen";
import { BookFormFields } from "../../components/admin/BookFormFields";
import { useEditBookPage } from "../../hooks/books/useEditBookPage";
import { formatBytes } from "../../infrastructure/api/uploadHelpers";

const EditBook = () => {
  const {
    fetching,
    fields,
    handleFieldChange,
    isPremium,
    setIsPremium,
    preview,
    handleFileChange,
    isUploadingImage,
    isProcessing,
    handleUpdate,
    folderFiles,
    handleFolderChange,
    isUploadingContent,
    contentProgress,
    handleContentUpload,
    formTitle,
  } = useEditBookPage();

  if (fetching) return <LoadingScreen />;

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-6">Edit: {formTitle}</h1>

      <form onSubmit={handleUpdate} className="flex flex-col md:flex-row gap-8">
        {/* Left: Cover */}
        <div className="w-full md:w-1/3">
          <img src={preview || ""} className="rounded shadow mb-4" />
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={(e) => e.target.files && handleFileChange(e.target.files[0])}
          />
        </div>

        {/* Right: Fields */}
        <div className="flex-1 space-y-4">
          <BookFormFields values={fields} onChange={handleFieldChange} />

          {/* ACCESS TIER SELECTION */}
          <div className="bg-base-200 p-4 rounded-xl border border-base-300">
            <label className="label pt-0">
              <span className="label-text text-xs uppercase tracking-widest opacity-60 font-bold">
                Pricing & Access
              </span>
            </label>
            <select
              className={`select select-bordered w-full ${isPremium ? "select-warning" : ""}`}
              value={isPremium ? "premium" : "freemium"}
              onChange={(e) => setIsPremium(e.target.value === "premium")}
            >
              <option value="freemium">🔓 Freemium (Public)</option>
              <option value="premium">💎 Premium (Subscribers Only)</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isUploadingImage || isProcessing}
          >
            {isUploadingImage || isProcessing ? "Saving Changes..." : "Update Book"}
          </button>
        </div>
      </form>
      {/* CONTENT RE-UPLOAD */}
      <div className="mt-10 bg-base-100 rounded-2xl shadow border border-base-200 p-6 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-warning">
          Replace Book Content
        </h2>
        <p className="text-xs text-base-content/50">
          Upload a new folder to replace the current HTML/CSS/JS content.
        </p>
        <input
          type="file"
          // @ts-expect-error webkitdirectory is not in TS typings
          webkitdirectory=""
          multiple
          onChange={handleFolderChange}
          className="file-input file-input-bordered bg-base-200 border-warning/40 w-full"
        />
        {folderFiles.length > 0 && (
          <p className="text-xs text-base-content/50">{folderFiles.length} files selected</p>
        )}
        {contentProgress && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-base-content/60">
              <span>Uploading…</span>
              <span>
                {formatBytes(contentProgress.bytesDone)} / {formatBytes(contentProgress.bytesTotal)}
              </span>
            </div>
            <progress
              className="progress progress-warning w-full"
              value={contentProgress.bytesDone}
              max={contentProgress.bytesTotal || 1}
            />
          </div>
        )}
        <button
          type="button"
          className="btn btn-warning btn-sm"
          disabled={folderFiles.length === 0 || isUploadingContent}
          onClick={handleContentUpload}
        >
          {isUploadingContent ? <span className="loading loading-spinner loading-xs" /> : "Upload Content"}
        </button>
      </div>
    </div>
  );
};

export default EditBook;
