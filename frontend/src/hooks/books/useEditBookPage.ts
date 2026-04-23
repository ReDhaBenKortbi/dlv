import { useState, useEffect } from "react";
import { toast } from "sonner";
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
  const { logger, uploadFile, uploadBookContent } = useUseCases();
  const { book, isLoading: fetching } = useBooks(bookId);
  const { edit, isProcessing } = useBookMutations();

  const [fields, setFields] = useState<BookFormValues>(INITIAL_FIELDS);
  const [isPremium, setIsPremium] = useState(false);
  const [coverURL, setCoverURL] = useState("");
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [folderFiles, setFolderFiles] = useState<File[]>([]);
  const [isUploadingContent, setIsUploadingContent] = useState(false);
  const [contentProgress, setContentProgress] = useState<{ bytesDone: number; bytesTotal: number } | null>(null);

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

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFolderFiles(Array.from(e.target.files ?? []));
  };

  const handleContentUpload = async () => {
    if (!bookId || folderFiles.length === 0) return;
    const hasIndex = folderFiles.some((f) =>
      ((f as File & { webkitRelativePath?: string }).webkitRelativePath ?? f.name).endsWith('index.html'),
    );
    if (!hasIndex) {
      logger.error('No index.html in folder', new Error('missing index.html'));
      return;
    }
    setIsUploadingContent(true);
    try {
      await uploadBookContent(bookId, folderFiles, (bytesDone, bytesTotal) => setContentProgress({ bytesDone, bytesTotal }));
      setFolderFiles([]);
      toast.success('Book content uploaded successfully.');
    } catch (error: unknown) {
      logger.error('Content upload failed', error);
      toast.error('Content upload failed. Please try again.');
    } finally {
      setIsUploadingContent(false);
      setContentProgress(null);
    }
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
    folderFiles,
    handleFolderChange,
    isUploadingContent,
    contentProgress,
    handleContentUpload,
    formTitle: fields.title,
  };
}
