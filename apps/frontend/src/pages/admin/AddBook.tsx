import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { uploadImageToCloudinary } from "../../services/cloudinaryService";
import { BookPreview } from "../../components/admin/BookPreview";
import { useBookMutations } from "../../hooks/books/useBookMutations";
import { useBook } from "../../hooks/books/useBook";
// New Pillars
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
import { toast } from "sonner";

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
  const { add, isProcessing } = useBookMutations(); // Use our mutation hook

  // When arriving via "+ Edition" on an existing book, fetch it so we can
  // clone its shared fields (cover included) instead of asking the admin
  // to re-enter and re-upload everything for what is the same title.
  const { book: sourceBook, isLoading: isLoadingSource } = useBook(fromId);
  const isCloning = !!fromId;

  // --- NEW STATE FOR THE THREE PILLARS ---
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguageCode | "">(
    "",
  );
  const [focusSkill, setFocusSkill] = useState<FocusSkillCode | "">("");
  const [proficiencyLevel, setProficiencyLevel] = useState<
    ProficiencyLevelCode | ""
  >("");

  // Keep your existing form states (title, author, description, etc.)
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [bookTier, setBookTier] = useState<BookTier>("FREE");
  const [groupKey, setGroupKey] = useState("");
  const [flipbookURL, setFlipbookURL] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // When cloning, default to reusing the source edition's cover — no new
  // Cloudinary upload, no duplicate image stored for what's the same book.
  const [reuseCover, setReuseCover] = useState(false);

  // Status State - We only need this for the Cloudinary part now
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Prefill shared fields from the source edition once it loads.
  useEffect(() => {
    if (!sourceBook) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuthor(sourceBook.author);
    setDescription(sourceBook.description);
    setTargetLanguage((sourceBook.targetLanguage as TargetLanguageCode) || "");
    setFocusSkill((sourceBook.focusSkill as FocusSkillCode) || "");
    setProficiencyLevel(
      (sourceBook.proficiencyLevel as ProficiencyLevelCode) || "",
    );
    // Pre-filled but editable. Uniqueness is keyed on indexURL, so the title
    // may repeat across editions — only the content URL has to differ.
    setTitle(sourceBook.title);
    // Anchor the new edition to the same series. If the source wasn't
    // grouped yet, its own id becomes the shared groupKey going forward.
    setGroupKey(sourceBook.groupKey || sourceBook.id);
    setBookTier(NEXT_TIER[sourceBook.bookTier]);
    setReuseCover(true);
  }, [sourceBook]);

  // Handle local image preview for a freshly-picked file
  useEffect(() => {
    if (!coverFile) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImagePreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(coverFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile]);

  // What the live preview should show: the newly-picked file, the reused
  // source cover, or nothing yet.
  const previewUrl =
    imagePreview || (reuseCover ? sourceBook?.coverURL : "") || "";

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    const willReuseCover = reuseCover && !!sourceBook?.coverURL;

    if ((!coverFile && !willReuseCover) || !flipbookURL) {
      toast.error("Please provide both a cover image and the Netlify URL.");
      return;
    }

    setIsUploadingImage(true);

    try {
      // Reuse the source edition's cover, or upload a new one
      const coverURL = willReuseCover
        ? sourceBook!.coverURL
        : await uploadImageToCloudinary(coverFile!);

      const success = await add({
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        indexURL: flipbookURL.trim(),
        coverURL,
        bookTier,
        groupKey: groupKey.trim() || undefined,
        targetLanguage: targetLanguage as TargetLanguageCode,
        focusSkill: focusSkill as FocusSkillCode,
        proficiencyLevel: proficiencyLevel as ProficiencyLevelCode,
      });

      // Only navigate if the save actually worked
      if (success) {
        navigate("/admin/manage-books");
      }
    } catch (err: unknown) {
      console.error("Publishing failed:", err);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-10 items-start">
        {/* LEFT — FORM */}
        <div className="flex-1">
          {isCloning && (
            <div className="alert bg-primary/10 border border-primary/30 mb-6 text-sm">
              {isLoadingSource ? (
                <span>Loading source edition…</span>
              ) : sourceBook ? (
                <span>
                  Creating a new tier edition of <strong>{sourceBook.title}</strong>.
                  Shared details and the cover image were copied over — adjust
                  the title, tier and Netlify URL below.
                </span>
              ) : (
                <span>Source edition not found — filling out a blank form.</span>
              )}
            </div>
          )}
          <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200">
            <div className="p-6 sm:p-8">
              <form onSubmit={handlePublish} className="space-y-6">
                {/* TITLE + AUTHOR */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-base-content/60 uppercase">
                      Book Title
                    </label>
                    <input
                      type="text"
                      placeholder="The Great Gatsby"
                      className="input input-bordered bg-base-200 border-base-300 mt-1 w-full"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-base-content/60 uppercase">
                      Author Name
                    </label>
                    <input
                      type="text"
                      placeholder="F. Scott Fitzgerald"
                      className="input input-bordered bg-base-200 border-base-300 mt-1 w-full"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="text-xs font-bold text-base-content/60 uppercase">
                    Book Description
                  </label>
                  <textarea
                    className="textarea textarea-bordered bg-base-200 border-base-300 mt-1 h-28 w-full"
                    placeholder="Describe the flipbook content..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                {/* ACADEMIC PILLARS SECTION */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Language Select */}
                  <div>
                    <label className="text-xs font-bold text-base-content/60 uppercase">
                      Language
                    </label>
                    <select
                      className="select select-bordered bg-base-200 border-base-300 mt-1 w-full"
                      value={targetLanguage}
                      onChange={(e) =>
                        setTargetLanguage(e.target.value as TargetLanguageCode)
                      }
                      required
                    >
                      <option value="" disabled>
                        Select Language
                      </option>
                      {TARGET_LANGUAGES.map((lang) => (
                        <option key={lang.id} value={lang.id}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skill Select */}
                  <div>
                    <label className="text-xs font-bold text-base-content/60 uppercase">
                      Focus Skill
                    </label>
                    <select
                      className="select select-bordered bg-base-200 border-base-300 mt-1 w-full"
                      value={focusSkill}
                      onChange={(e) =>
                        setFocusSkill(e.target.value as FocusSkillCode)
                      }
                      required
                    >
                      <option value="" disabled>
                        Select Skill
                      </option>
                      {FOCUS_SKILLS.map((skill) => (
                        <option key={skill.id} value={skill.id}>
                          {skill.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Level Select */}
                  <div>
                    <label className="text-xs font-bold text-base-content/60 uppercase">
                      Proficiency Level
                    </label>
                    <select
                      className="select select-bordered bg-base-200 border-base-300 mt-1 w-full"
                      value={proficiencyLevel}
                      onChange={(e) =>
                        setProficiencyLevel(
                          e.target.value as ProficiencyLevelCode,
                        )
                      }
                      required
                    >
                      <option value="" disabled>
                        Select Level
                      </option>
                      {PROFICIENCY_LEVELS.map((lvl) => (
                        <option key={lvl.id} value={lvl.id}>
                          {lvl.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

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

                    {isCloning && sourceBook && reuseCover ? (
                      <div className="mt-1 flex items-center gap-3 bg-base-100 border border-base-300 rounded-lg p-3">
                        <img
                          src={sourceBook.coverURL}
                          alt="Reused cover"
                          className="w-12 h-16 object-cover rounded-md flex-none"
                        />
                        <div className="flex-1 text-xs">
                          <p className="font-bold">Reusing this title's cover</p>
                          <p className="opacity-60">
                            No new image will be uploaded — this edition
                            points at the same file.
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
                          onChange={(e) =>
                            setCoverFile(e.target.files?.[0] || null)
                          }
                          className="file-input file-input-bordered bg-base-100 border-base-300 mt-1 w-full"
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
                    )}
                  </div>
                </div>

                {/* TIER + GROUP KEY + ACTIONS */}
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <label className="text-xs font-bold text-base-content/60 uppercase">
                        Access Tier
                      </label>
                      <select
                        className="select select-bordered select-sm"
                        value={bookTier}
                        onChange={(e) => setBookTier(e.target.value as BookTier)}
                      >
                        {BOOK_TIERS.map((tier) => (
                          <option key={tier.id} value={tier.id}>
                            {tier.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-base-content/60 uppercase block mb-1 sm:mb-0 sm:hidden">
                        Group Key
                      </label>
                      <input
                        type="text"
                        placeholder="Group key (optional)"
                        title="Books sharing the same Group Key render as one library card with an edition switcher. Leave blank for a standalone book."
                        className="input input-bordered input-sm bg-base-200 border-base-300"
                        value={groupKey}
                        onChange={(e) => setGroupKey(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <button
                      type="submit"
                      className="btn btn-primary px-10 shadow-lg"
                      disabled={isUploadingImage || isProcessing || isLoadingSource}
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
            title={title}
            author={author}
            previewUrl={previewUrl}
            bookTier={bookTier}
          />
        </div>
      </div>
    </div>
  );
};

export default AddBook;
