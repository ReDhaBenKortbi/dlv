// Pure domain Book type — no Firebase, no Timestamps.
// Infrastructure adapters convert Firestore Timestamps to Date before
// returning these types.

import type {
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
} from "./vocabulary";

export interface DomainBook {
  id: string;
  title: string;
  author: string;
  description: string;
  coverURL: string;
  indexURL: string;
  isPremium: boolean;
  category?: string;
  targetLanguage?: TargetLanguageCode;
  focusSkill?: FocusSkillCode;
  proficiencyLevel?: ProficiencyLevelCode;
  averageRating?: number;
  totalReviews?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export type CreateBookInput = Omit<DomainBook, "id" | "createdAt" | "updatedAt">;
export type UpdateBookInput = Partial<Omit<DomainBook, "id">>;
