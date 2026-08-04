import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import LoadingScreen from "../../components/common/LoadingScreen";
import { useBooks } from "../../hooks/books/useBooks"; // Reader
import { useBookMutations } from "../../hooks/books/useBookMutations"; // Writer
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

  // 1. Fetch current book data
  const { book, isLoading: fetching } = useBooks(bookId);

  // 2. Mutations hook
  const { edit, isProcessing } = useBookMutations();

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
  const [preview, setPreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

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
      setPreview(book.coverURL);
    }
  }, [book]);

  const handleFileChange = (file: File) => {
    setNewCoverFile(file);
    setPreview(URL.createObjectURL(file));
  };

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
      <h1 className="text-2xl font-bold mb-6">Edit: {formData.title}</h1>

      <form onSubmit={handleUpdate} className="flex flex-col md:flex-row gap-8">
        {/* Left: Cover */}
        <div className="w-full md:w-1/3">
          <img src={preview || ""} className="rounded shadow mb-4" />
          <input
            type="file"
            className="file-input file-input-bordered w-full"
            onChange={(e) =>
              e.target.files && handleFileChange(e.target.files[0])
            }
          />
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
