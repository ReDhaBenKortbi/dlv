import type {
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
} from "../constants/bookOptions";

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverURL: string;
  indexURL: string;
  isPremium: boolean;

  targetLanguage?: TargetLanguageCode; // e.g., "AR", "EN"
  focusSkill?: FocusSkillCode; // e.g., "GRAMMAR"
  proficiencyLevel?: ProficiencyLevelCode; // e.g., "A1", "B2"

  // --- RATING FIELDS ---
  averageRating?: number;
  totalReviews?: number;

  // --- TIMESTAMPS ---
  createdAt: string;
  updatedAt?: string;
}

// For creating a new book, we don't need the id or timestamps
export type NewBook = Omit<Book, "id" | "createdAt" | "updatedAt">;
