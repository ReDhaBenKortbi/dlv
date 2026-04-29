import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
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
  const { logger, uploadFile, uploadBookContent, createBook, deleteBook } = useUseCases();

  const [fields, setFields] = useState<BookFormValues>(INITIAL_FIELDS);
  const [isPremium, setIsPremium] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ bytesDone: number; bytesTotal: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const cancelUpload = useCallback(() => {
    abortRef.current?.abort();
  }, []);

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

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    setFolderFiles(selected);
  };

  const validatePublishInputs = (): boolean => {
    if (!coverFile) {
      toast.error("Please provide a cover image.");
      return false;
    }
    if (folderFiles.length === 0) {
      toast.error("Please select the book folder.");
      return false;
    }
    const hasIndex = folderFiles.some((f) =>
      ((f as File & { webkitRelativePath?: string }).webkitRelativePath ?? f.name).endsWith("index.html"),
    );
    if (!hasIndex) {
      toast.error("The selected folder must contain an index.html file.");
      return false;
    }
    return true;
  };

  const createBookRecord = async (coverURL: string): Promise<string | null> =>
    createBook({
      title: fields.title.trim(),
      author: fields.author.trim(),
      description: fields.description.trim(),
      coverURL,
      isPremium,
      targetLanguage: fields.targetLanguage as TargetLanguageCode,
      focusSkill: fields.focusSkill as FocusSkillCode,
      proficiencyLevel: fields.proficiencyLevel as ProficiencyLevelCode,
      category: "Academic",
    });

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePublishInputs() || !coverFile) return;

    setIsUploading(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let createdBookId: string | null = null;
    try {
      const coverURL = await uploadFile(coverFile);
      createdBookId = await createBookRecord(coverURL);
      if (!createdBookId) return;

      await uploadBookContent(
        createdBookId,
        folderFiles,
        (bytesDone, bytesTotal) => setUploadProgress({ bytesDone, bytesTotal }),
        controller.signal,
      );

      toast.success("Book published successfully!");
      navigate("/admin/manage-books");
    } catch (error: unknown) {
      const wasAborted = error instanceof DOMException && error.name === "AbortError";
      if (wasAborted) {
        toast.info("Upload cancelled. Partial progress is saved — re-pick the same folder to resume.");
      } else {
        logger.error("Publishing failed", error);
        if (createdBookId) {
          try {
            await deleteBook(createdBookId);
          } catch (cleanupError: unknown) {
            logger.error("Orphan cleanup failed", cleanupError);
          }
        }
        toast.error("Publishing failed. Please try again.");
      }
    } finally {
      abortRef.current = null;
      setIsUploading(false);
      setUploadProgress(null);
    }
  };

  return {
    fields,
    handleFieldChange,
    isPremium,
    setIsPremium,
    coverFile,
    setCoverFile,
    folderFiles,
    handleFolderChange,
    imagePreview,
    isUploading,
    uploadProgress,
    handlePublish,
    cancelUpload,
  };
}
