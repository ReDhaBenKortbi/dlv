import { useState, useEffect } from "react";
import { useObjectUrl } from "../../hooks/useObjectUrl";
import { useParams, useNavigate, Link } from "react-router-dom";
import LoadingScreen from "../../components/common/LoadingScreen";
import { useBook } from "../../hooks/books/useBook";
import { useBookEditions } from "../../hooks/books/useBookEditions";
import { useBookMutations } from "../../hooks/books/useBookMutations";
import { uploadImageToCloudinary } from "../../services/cloudinaryService";

import {
  TARGET_LANGUAGES,
  FOCUS_SKILLS,
  PROFICIENCY_LEVELS,
  BOOK_TIERS,
} from "../../constants/bookOptions";
import type {
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
  BookTier,
} from "../../constants/bookOptions";

const EditBook = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  const { book, isLoading: fetching } = useBook(bookId);

  // Sibling tier editions of the same title, so a cover change can be pushed
  // across the whole series.
  const { editions } = useBookEditions(book);
  const siblings = editions.filter((e) => e.id !== bookId);

  // 2. Mutations hook
  const { edit, editSilent, isProcessing } = useBookMutations();

  const [formData, setFormData] = useState<{
    title: string;
    author: string;
    description: string;
    indexURL: string;
    coverURL: string;
    targetLanguage: TargetLanguageCode | "";
    focusSkill: FocusSkillCode | "";
    proficiencyLevel: ProficiencyLevelCode | "";
    bookTier: BookTier;
    groupKey: string;
  }>({
    title: "",
    author: "",
    description: "",
    indexURL: "",
    coverURL: "",
    targetLanguage: "",
    focusSkill: "",
    proficiencyLevel: "",
    bookTier: "FREE",
    groupKey: "",
  });

  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  // Blob URL for a freshly-picked file; falls back to the stored cover.
  const newCoverPreview = useObjectUrl(newCoverFile);
  const preview = newCoverPreview || formData.coverURL;
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  // Editions of the same title normally share one cover image (see
  // AddBook's "reuse cover" flow) — default to keeping them in sync
  // whenever a new image is picked here, instead of silently forking it.
  const [syncCoverToSiblings, setSyncCoverToSiblings] = useState(true);

  // 4. Sync Database Data to Form (Only runs once when 'book' arrives)
  useEffect(() => {
    if (book) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        indexURL: book.indexURL,
        coverURL: book.coverURL,
        targetLanguage: book.targetLanguage || "",
        focusSkill: book.focusSkill || "",
        proficiencyLevel: book.proficiencyLevel || "",
        bookTier: book.bookTier ?? "FREE",
        groupKey: book.groupKey || "",
      });
    }
  }, [book]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId) return;

    let finalCoverURL = formData.coverURL;

    try {
      // Step A: Handle Image Upload if necessary
      if (newCoverFile) {
        setIsUploadingImage(true);
        finalCoverURL = await uploadImageToCloudinary(newCoverFile);
      }

      // Step B: Call edit with two separate arguments
      // This matches: edit(id: string, updates: Partial<Book>)
      const success = await edit(bookId, {
        ...formData,
        coverURL: finalCoverURL,
        targetLanguage: formData.targetLanguage || undefined,
        focusSkill: formData.focusSkill || undefined,
        proficiencyLevel: formData.proficiencyLevel || undefined,
        // Send even when blank so clearing the field actually un-groups the
        // book — `|| undefined` here would get dropped by JSON.stringify
        // and silently leave the old groupKey in place.
        groupKey: formData.groupKey.trim(),
      });

      // Step B2: Push the new cover to sibling editions too, so the whole
      // series keeps pointing at the same image instead of drifting apart.
      if (success && newCoverFile && syncCoverToSiblings && siblings.length > 0) {
        await Promise.all(
          siblings.map((sibling) =>
            editSilent(sibling.id, { coverURL: finalCoverURL }),
          ),
        );
      }

      // Step C: Redirect only if the mutation was successful
      if (success) {
        navigate("/admin/manage-books");
      }
    } catch (error) {
      // The notify.promise inside the hook handles the error UI,
      // but we catch it here to ensure the loading state resets.
      console.error("Edit flow failed:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (fetching) return <LoadingScreen />;

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold">Edit: {formData.title}</h1>
        <Link
          to={`/admin/add-book?fromId=${bookId}`}
          className="btn btn-sm btn-outline"
        >
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
                className={`btn btn-xs ${
                  sibling.bookTier === "GOLD"
                    ? "btn-warning"
                    : sibling.bookTier === "PRO"
                      ? "btn-secondary"
                      : "btn-outline"
                }`}
              >
                {sibling.bookTier}
              </Link>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleUpdate} className="flex flex-col md:flex-row gap-8">
        {/* Left: Cover */}
        <div className="w-full md:w-1/3">
          <img src={preview || ""} className="rounded shadow mb-4" />
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={(e) => setNewCoverFile(e.target.files?.[0] ?? null)}
          />
          {newCoverFile && siblings.length > 0 && (
            <label className="flex items-start gap-2 mt-3 text-xs bg-base-200 border border-base-300 rounded-lg p-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-xs mt-0.5"
                checked={syncCoverToSiblings}
                onChange={(e) => setSyncCoverToSiblings(e.target.checked)}
              />
              <span>
                Apply this cover to the other {siblings.length} edition
                {siblings.length > 1 ? "s" : ""} of this title too, so they
                stay in sync.
              </span>
            </label>
          )}
        </div>

        {/* Right: Fields */}
        <div className="flex-1 space-y-4">
          <input
            className="input input-bordered w-full"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Title"
          />

          <input
            className="input input-bordered w-full"
            value={formData.author}
            onChange={(e) =>
              setFormData({ ...formData, author: e.target.value })
            }
            placeholder="Author"
          />

          <input
            className="input input-bordered w-full"
            value={formData.indexURL}
            onChange={(e) =>
              setFormData({ ...formData, indexURL: e.target.value })
            }
            placeholder="Index URL"
          />

          {/* ACADEMIC INFO ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <select
              className="select select-bordered w-full"
              value={formData.targetLanguage}
              onChange={(e) =>
                setFormData({ ...formData, targetLanguage: e.target.value as TargetLanguageCode | "" })
              }
            >
              <option value="">Language</option>
              {TARGET_LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>

            <select
              className="select select-bordered w-full"
              value={formData.focusSkill}
              onChange={(e) =>
                setFormData({ ...formData, focusSkill: e.target.value as FocusSkillCode | "" })
              }
            >
              <option value="">Skill</option>
              {FOCUS_SKILLS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>

            <select
              className="select select-bordered w-full"
              value={formData.proficiencyLevel}
              onChange={(e) =>
                setFormData({ ...formData, proficiencyLevel: e.target.value as ProficiencyLevelCode | "" })
              }
            >
              <option value="">Level</option>
              {PROFICIENCY_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.label}
                </option>
              ))}
            </select>
          </div>

          {/* ACCESS TIER SELECTION */}
          <div className="bg-base-200 p-4 rounded-xl border border-base-300">
            <label className="label pt-0">
              <span className="label-text text-xs uppercase tracking-widest opacity-60 font-bold">
                Access Tier
              </span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData.bookTier}
              onChange={(e) =>
                setFormData({ ...formData, bookTier: e.target.value as BookTier })
              }
            >
              {BOOK_TIERS.map((tier) => (
                <option key={tier.id} value={tier.id}>
                  {tier.label}
                </option>
              ))}
            </select>
          </div>

          {/* GROUP KEY — links tier editions of the same title together */}
          <div className="bg-base-200 p-4 rounded-xl border border-base-300">
            <label className="label pt-0">
              <span className="label-text text-xs uppercase tracking-widest opacity-60 font-bold">
                Group Key (optional)
              </span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g. english-grammar-foundations"
              value={formData.groupKey}
              onChange={(e) =>
                setFormData({ ...formData, groupKey: e.target.value })
              }
            />
            <p className="text-xs opacity-50 mt-2">
              Books sharing the same Group Key render as one library card
              with an edition switcher. Leave blank for a standalone book.
            </p>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isUploadingImage || isProcessing}
          >
            {isUploadingImage || isProcessing
              ? "Saving Changes..."
              : "Update Book"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBook;
