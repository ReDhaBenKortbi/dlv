import { useCallback, useState } from "react";
import type { Book } from "@/types/book";
import type {
  BookTier,
  FocusSkillCode,
  ProficiencyLevelCode,
  TargetLanguageCode,
} from "@/constants/bookOptions";

/**
 * The editable fields of a book, shared by the create and edit forms.
 * The cover is deliberately absent: each page sources it differently (a fresh
 * upload, a reused sibling cover, or the stored URL) and resolves it at submit.
 */
export interface BookFormValues {
  title: string;
  author: string;
  description: string;
  indexURL: string;
  targetLanguage: TargetLanguageCode | "";
  focusSkill: FocusSkillCode | "";
  proficiencyLevel: ProficiencyLevelCode | "";
  bookTier: BookTier;
  groupKey: string;
}

const EMPTY: BookFormValues = {
  title: "",
  author: "",
  description: "",
  indexURL: "",
  targetLanguage: "",
  focusSkill: "",
  proficiencyLevel: "",
  bookTier: "FREE",
  groupKey: "",
};

/** A book as form values — the selects use "" for "not chosen". */
export const bookToFormValues = (book: Book): BookFormValues => ({
  title: book.title,
  author: book.author,
  description: book.description,
  indexURL: book.indexURL ?? "",
  targetLanguage: book.targetLanguage ?? "",
  focusSkill: book.focusSkill ?? "",
  proficiencyLevel: book.proficiencyLevel ?? "",
  bookTier: book.bookTier ?? "FREE",
  groupKey: book.groupKey ?? "",
});

/**
 * Form values as an API payload.
 *
 * `groupKey` is sent even when blank so clearing the field actually un-groups
 * the book — `|| undefined` would be dropped by JSON.stringify and silently
 * leave the old key in place. The API maps "" to null.
 */
export const toBookPayload = (values: BookFormValues, coverURL: string) => ({
  title: values.title.trim(),
  author: values.author.trim(),
  description: values.description.trim(),
  indexURL: values.indexURL.trim(),
  coverURL,
  bookTier: values.bookTier,
  groupKey: values.groupKey.trim(),
  targetLanguage: values.targetLanguage || undefined,
  focusSkill: values.focusSkill || undefined,
  proficiencyLevel: values.proficiencyLevel || undefined,
});

/**
 * State for the book form. Replaces AddBook's eleven separate useState calls
 * and EditBook's spread-the-whole-object-per-keystroke updates.
 */
export function useBookForm(initial: Partial<BookFormValues> = {}) {
  const [values, setValues] = useState<BookFormValues>({ ...EMPTY, ...initial });

  const setField = useCallback(
    <K extends keyof BookFormValues>(key: K, value: BookFormValues[K]) =>
      setValues((current) => ({ ...current, [key]: value })),
    [],
  );

  const reset = useCallback(
    (next: Partial<BookFormValues>) => setValues({ ...EMPTY, ...next }),
    [],
  );

  return { values, setField, reset };
}
