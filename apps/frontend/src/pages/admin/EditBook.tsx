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
} from "../../constants/bookOptions";

const EditBook = () => {
  const { bookId } = useParams();
  const navigate = useNavigate();

  // 1. Fetch current book data
  const { book, isLoading: fetching } = useBooks(bookId);

  // 2. Mutations hook
  const { edit, isProcessing } = useBookMutations();

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    description: "",
    category: "",
    coverURL: "",
    // Add new fields here
    targetLanguage: "" as any,
    focusSkill: "" as any,
    proficiencyLevel: "" as any,
    isPremium: false,
  });

  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // 4. Sync Database Data to Form (Only runs once when 'book' arrives)
  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        description: book.description,
        category: book.category || "General",
        coverURL: book.coverURL,
        targetLanguage: book.targetLanguage || "",
        focusSkill: book.focusSkill || "",
        proficiencyLevel: book.proficiencyLevel || "",
        isPremium: !!book.isPremium, // Ensure it's a boolean
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

          <textarea
            className="textarea textarea-bordered w-full h-32"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          {/* ACADEMIC INFO ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <select
              className="select select-bordered w-full"
              value={formData.targetLanguage}
              onChange={(e) =>
                setFormData({ ...formData, targetLanguage: e.target.value })
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
                setFormData({ ...formData, focusSkill: e.target.value })
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
                setFormData({ ...formData, proficiencyLevel: e.target.value })
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
              <span className="label-text text-xs uppercase trackPng-widest opacity-60 font-bold">
                Pricing & Access
              </span>
            </label>
            <select
              className={`select select-bordered w-full ${formData.isPremium ? "select-warning" : ""}`}
              value={formData.isPremium ? "premium" : "freemium"} // Convert boolean to string for UI
              onChange={
                (e) =>
                  setFormData({
                    ...formData,
                    isPremium: e.target.value === "premium",
                  }) // Convert back to boolean
              }
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
