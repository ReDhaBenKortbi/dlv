import LoadingScreen from "../../components/common/LoadingScreen";
import { BookFormFields } from "../../components/admin/BookFormFields";
import { useEditBookPage } from "../../hooks/books/useEditBookPage";

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
    </div>
  );
};

export default EditBook;
