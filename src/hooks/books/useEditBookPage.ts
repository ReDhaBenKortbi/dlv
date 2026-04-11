import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useBooks } from "./useBooks";
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

export function useEditBookPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const { logger, uploadFile } = useUseCases();
  const { book, isLoading: fetching } = useBooks(bookId);
  const { edit, isProcessing } = useBookMutations();

  const [fields, setFields] = useState<BookFormValues>(INITIAL_FIELDS);
  const [isPremium, setIsPremium] = useState(false);
  const [coverURL, setCoverURL] = useState("");
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    if (book) {
      setFields({
        title: book.title,
        author: book.author,
        description: book.description,
        targetLanguage: book.targetLanguage ?? "",
        focusSkill: book.focusSkill ?? "",
        proficiencyLevel: book.proficiencyLevel ?? "",
      });
      setIsPremium(!!book.isPremium);
      setCoverURL(book.coverURL);
      setPreview(book.coverURL);
    }
  }, [book]);

  const handleFieldChange = (field: keyof BookFormValues, value: string) => {
    setFields((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file: File) => {
    setNewCoverFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId) return;

    let finalCoverURL = coverURL;
    try {
      if (newCoverFile) {
        setIsUploadingImage(true);
        finalCoverURL = await uploadFile(newCoverFile);
      }

      const success = await edit(bookId, {
        title: fields.title,
        author: fields.author,
        description: fields.description,
        targetLanguage: fields.targetLanguage as TargetLanguageCode || undefined,
        focusSkill: fields.focusSkill as FocusSkillCode || undefined,
        proficiencyLevel: fields.proficiencyLevel as ProficiencyLevelCode || undefined,
        coverURL: finalCoverURL,
        isPremium,
      });

      if (success) {
        navigate("/admin/manage-books");
      }
    } catch (error: unknown) {
      logger.error("Edit flow failed", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  return {
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
    formTitle: fields.title,
  };
}
