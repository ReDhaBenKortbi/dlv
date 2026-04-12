import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBookMutations } from "./useBookMutations";
import { useUseCases } from "../../presentation/providers/UseCasesContext";
import type { BookFormValues } from "../../components/admin/BookFormFields";
import type {
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
} from "../../constants/bookOptions";

const INITIAL_FIELDS: BookFormValues = {
  title: "",
  author: "",
  description: "",
  targetLanguage: "",
  focusSkill: "",
  proficiencyLevel: "",
};

export function useAddBookPage() {
  const navigate = useNavigate();
  const { logger, uploadFile } = useUseCases();
  const { add, isProcessing } = useBookMutations();

  const [fields, setFields] = useState<BookFormValues>(INITIAL_FIELDS);
  const [isPremium, setIsPremium] = useState(false);
  const [flipbookURL, setFlipbookURL] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (!coverFile) {
      setImagePreview("");
      return;
    }
    const objectUrl = URL.createObjectURL(coverFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [coverFile]);

  const handleFieldChange = (field: keyof BookFormValues, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coverFile || !flipbookURL) {
      toast.error("Please provide both a cover image and the Netlify URL.");
      return;
    }

    setIsUploadingImage(true);
    try {
      const coverURL = await uploadFile(coverFile);
      const success = await add({
        title: fields.title.trim(),
        author: fields.author.trim(),
        description: fields.description.trim(),
        indexURL: flipbookURL.trim(),
        coverURL,
        isPremium,
        targetLanguage: fields.targetLanguage as TargetLanguageCode,
        focusSkill: fields.focusSkill as FocusSkillCode,
        proficiencyLevel: fields.proficiencyLevel as ProficiencyLevelCode,
        category: "Academic",
      });

      if (success) {
        navigate("/admin/manage-books");
      }
    } catch (error: unknown) {
      logger.error("Publishing failed", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return {
    fields,
    handleFieldChange,
    isPremium,
    setIsPremium,
    flipbookURL,
    setFlipbookURL,
    coverFile,
    setCoverFile,
    imagePreview,
    isUploadingImage,
    isProcessing,
    handlePublish,
  };
}
