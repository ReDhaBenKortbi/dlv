import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { BookForm } from "@/components/admin/BookForm";
import LoadingScreen from "@/components/common/LoadingScreen";
import { tierStyles } from "@/lib/tierStyles";
import {
  bookToFormValues,
  toBookPayload,
  useBookForm,
} from "@/hooks/books/useBookForm";
import { useBook } from "@/hooks/books/useBook";
import { useBookEditions } from "@/hooks/books/useBookEditions";
import { useBookMutations } from "@/hooks/books/useBookMutations";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";

const EditBook = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const { book, isLoading: fetching } = useBook(bookId);
  const { values, setField, reset } = useBookForm();
  const { edit, editSilent, isProcessing } = useBookMutations();

  // Sibling tier editions, so a cover change can be pushed across the series.
  const { editions } = useBookEditions(book);
  const siblings = editions.filter((edition) => edition.id !== bookId);

  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const newCoverPreview = useObjectUrl(newCoverFile);
  const preview = newCoverPreview || (book?.coverURL ?? "");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  // Editions of a title normally share one cover (see AddBook's reuse flow), so
  // default to keeping them in sync rather than silently forking the image.
  const [syncCoverToSiblings, setSyncCoverToSiblings] = useState(true);

  useEffect(() => {
    if (book) reset(bookToFormValues(book));
  }, [book, reset]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId || !book) return;

    try {
      let coverURL = book.coverURL;
      if (newCoverFile) {
        setIsUploadingImage(true);
        coverURL = await uploadImageToCloudinary(newCoverFile);
      }

      const success = await edit(bookId, toBookPayload(values, coverURL));

      // Push the new cover to the siblings too, so the series keeps pointing at
      // one image instead of drifting apart.
      if (success && newCoverFile && syncCoverToSiblings && siblings.length) {
        await Promise.all(
          siblings.map((sibling) => editSilent(sibling.id, { coverURL })),
        );
      }

      if (success) navigate("/admin/manage-books");
    } catch (error) {
      // The toast inside the mutation hook reports the failure; this only
      // guarantees the uploading flag is cleared.
      console.error("Edit flow failed:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (fetching) return <LoadingScreen />;

  const coverSlot = (
    <>
      <input
        type="file"
        accept="image/*"
        className="file-input file-input-bordered bg-base-100 border-base-300 w-full"
        onChange={(e) => setNewCoverFile(e.target.files?.[0] ?? null)}
      />
      {newCoverFile && siblings.length > 0 && (
        <label className="flex items-start gap-2 mt-3 text-xs bg-base-100 border border-base-300 rounded-lg p-3 cursor-pointer">
          <input
            type="checkbox"
            className="checkbox checkbox-xs mt-0.5"
            checked={syncCoverToSiblings}
            onChange={(e) => setSyncCoverToSiblings(e.target.checked)}
          />
          <span>
            Apply this cover to the other {siblings.length} edition
            {siblings.length > 1 ? "s" : ""} of this title too, so they stay in
            sync.
          </span>
        </label>
      )}
    </>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Edit: {values.title}</h1>
        <Link to={`/admin/add-book?fromId=${bookId}`} className="btn btn-sm btn-outline">
          + Add another edition
        </Link>
      </div>

      {siblings.length > 0 && (
        <div className="bg-base-200 border border-base-300 rounded-xl p-4 mb-6">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">
            Other editions of this title
          </p>
          <div className="flex flex-wrap gap-2">
            {siblings.map((sibling) => (
              <Link
                key={sibling.id}
                to={`/admin/edit-book/${sibling.id}`}
                className={`badge ${tierStyles[sibling.bookTier].badge} gap-1 py-3 hover:opacity-80`}
              >
                {sibling.bookTier}
              </Link>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleUpdate} className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/3">
          {preview && (
            <img src={preview} alt={values.title} className="rounded shadow w-full" />
          )}
        </div>

        <div className="flex-1 space-y-6">
          <BookForm values={values} onChange={setField} coverSlot={coverSlot} />

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
