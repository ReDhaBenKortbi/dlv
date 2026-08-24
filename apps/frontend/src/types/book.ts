import type {
  BookTier,
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
} from "../constants/bookOptions";

export type { BookTier };

export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  coverURL: string;
  indexURL: string;
  bookTier: BookTier;
  groupKey?: string;

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
