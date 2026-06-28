import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { uploadImageToCloudinary } from "../../services/cloudinaryService";
import { BookPreview } from "../../components/admin/BookPreview";
import { useBookMutations } from "../../hooks/books/useBookMutations";
// New Pillars
import {
  TARGET_LANGUAGES, // For dropdown options
  FOCUS_SKILLS, // For dropdown options
  PROFICIENCY_LEVELS, // For dropdown options
} from "../../constants/bookOptions";

import type {
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
} from "../../constants/bookOptions";
import { toast } from "sonner";

const AddBook = () => {
  const navigate = useNavigate();
  const { add, isProcessing } = useBookMutations(); // Use our mutation hook

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
  const [isPremium, setIsPremium] = useState(false);
  const [flipbookURL, setFlipbookURL] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Status State - We only need this for the Cloudinary part now
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Handle local image preview
  useEffect(() => {
    if (!coverFile) {
      setImagePreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(coverFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile]);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Basic validation (Toasts are better than alerts!)
    if (!coverFile || !flipbookURL) {
      toast.error("Please provide both a cover image and the Netlify URL.");
      return;
    }

    setIsUploadingImage(true);

    try {
      // Step A: Upload to Cloudinary
      const coverURL = await uploadImageToCloudinary(coverFile);

      // Step B: Use our mutation hook (which now handles the loading/success toasts)
      // Step B: Use our mutation hook
      const success = await add({
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        indexURL: flipbookURL.trim(),
        coverURL,
        isPremium,
        targetLanguage: targetLanguage as TargetLanguageCode,
        focusSkill: focusSkill as FocusSkillCode,
        proficiencyLevel: proficiencyLevel as ProficiencyLevelCode,
        category: "Academic",
        // ADD THIS LINE:
      });

      // Step C: Only navigate if the Firestore save actually worked
      if (success) {
        navigate("/admin/manage-books");
      }
    } catch (err: any) {
      // We catch the error here just to stop the local loading state,
      // the hook already showed the error toast to the user.
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
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setCoverFile(e.target.files?.[0] || null)
                      }
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
            title={title}
            author={author}
            previewUrl={imagePreview}
            isPremium={isPremium}
          />
        </div>
      </div>
    </div>
  );
};

export default AddBook;
