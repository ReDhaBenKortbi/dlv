import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { BookForm } from "@/components/admin/BookForm";
import { BookPreview } from "@/components/admin/BookPreview";
import {
  bookToFormValues,
  toBookPayload,
  useBookForm,
} from "@/hooks/books/useBookForm";
import { useBook } from "@/hooks/books/useBook";
import { useBookMutations } from "@/hooks/books/useBookMutations";
import { useObjectUrl } from "@/hooks/useObjectUrl";
import { uploadImageToCloudinary } from "@/services/cloudinaryService";
import { notify } from "@/utils/toast";
import type { BookTier } from "@/constants/bookOptions";

// Suggests the next tier up from the source edition, so cloning a FREE
// edition defaults to PRO instead of another FREE (the common case).
const NEXT_TIER: Record<BookTier, BookTier> = {
  FREE: "PRO",
  PRO: "GOLD",
  GOLD: "GOLD",
};

const AddBook = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromId = searchParams.get("fromId") || undefined;
  const isCloning = !!fromId;

  const { add, isProcessing } = useBookMutations();
  const { values, setField, reset } = useBookForm();

  // Arriving via "+ Edition" clones the source edition's shared fields and its
  // cover, rather than making the admin re-enter and re-upload the same title.
  const { book: sourceBook, isLoading: isLoadingSource } = useBook(fromId);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const coverPreview = useObjectUrl(coverFile);
  // When cloning, default to pointing at the source's cover — no second upload,
  // no duplicate image stored for what is the same book.
  const [reuseCover, setReuseCover] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (!sourceBook) return;
    reset({
      ...bookToFormValues(sourceBook),
      // Anchor the new edition to the same series. If the source wasn't grouped
      // yet, its own id becomes the shared groupKey going forward.
      groupKey: sourceBook.groupKey || sourceBook.id,
      bookTier: NEXT_TIER[sourceBook.bookTier],
      // The content URL is what must differ between editions.
      indexURL: "",
    });
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReuseCover(true);
  }, [sourceBook, reset]);

  const previewUrl =
    coverPreview || (reuseCover ? (sourceBook?.coverURL ?? "") : "");

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    const willReuseCover = reuseCover && !!sourceBook?.coverURL;
    if (!coverFile && !willReuseCover) {
      notify.error("Please provide a cover image.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const coverURL = willReuseCover
        ? sourceBook!.coverURL
        : await uploadImageToCloudinary(coverFile!);

      // Only navigate if the save actually worked.
      if (await add(toBookPayload(values, coverURL))) {
        navigate("/admin/manage-books");
      }
    } catch (error) {
      console.error("Publishing failed:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const coverSlot =
    isCloning && sourceBook && reuseCover ? (
      <div className="flex items-center gap-3 bg-base-100 border border-base-300 rounded-lg p-3">
        <img
          src={sourceBook.coverURL}
          alt="Reused cover"
          className="w-12 h-16 object-cover rounded-md flex-none"
        />
        <div className="flex-1 text-xs">
          <p className="font-bold">Reusing this title's cover</p>
          <p className="opacity-60">
            No new image will be uploaded — this edition points at the same file.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReuseCover(false)}
          className="btn btn-xs btn-outline flex-none"
        >
          Use a different image
        </button>
      </div>
    ) : (
      <>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          className="file-input file-input-bordered bg-base-100 border-base-300 w-full"
          required={!reuseCover}
        />
        {isCloning && sourceBook && (
          <button
            type="button"
            onClick={() => {
              setCoverFile(null);
              setReuseCover(true);
            }}
            className="btn btn-xs btn-ghost mt-1"
          >
            ← Reuse the original cover instead
          </button>
        )}
      </>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1">
          {isCloning && (
            <div className="alert bg-primary/10 border border-primary/30 mb-6 text-sm">
              {isLoadingSource ? (
                <span>Loading source edition…</span>
              ) : sourceBook ? (
                <span>
                  Creating a new tier edition of <strong>{sourceBook.title}</strong>.
                  Shared details and the cover image were copied over — adjust the
                  title, tier and Netlify URL below.
                </span>
              ) : (
                <span>Source edition not found — filling out a blank form.</span>
              )}
            </div>
          )}

          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200">
            <div className="p-6 sm:p-8">
              <form onSubmit={handlePublish} className="space-y-6">
                <BookForm
                  values={values}
                  onChange={setField}
                  coverSlot={coverSlot}
                />

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="btn btn-primary px-10 shadow-lg"
                    disabled={isUploadingImage || isProcessing || isLoadingSource}
                  >
                    {isUploadingImage ? (
                      <span className="loading loading-spinner" />
                    ) : (
                      "Publish to Library"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <BookPreview
            title={values.title}
            author={values.author}
            previewUrl={previewUrl}
            bookTier={values.bookTier}
          />
        </div>
      </div>
    </div>
  );
};

export default AddBook;
