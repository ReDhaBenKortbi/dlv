import type {
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
} from "../../constants/bookOptions";

/** Domain entity — uses Date, never Firebase Timestamp. */
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

export type CreateBookInput = Omit<DomainBook, "id" | "createdAt" | "updatedAt" | "indexURL"> & { indexURL?: string };

export interface BookRepo {
  findAll(): Promise<DomainBook[]>;
  findById(id: string): Promise<DomainBook | null>;
  create(input: CreateBookInput): Promise<string>;
  update(id: string, updates: Partial<Omit<DomainBook, "id">>): Promise<void>;
  updateRating(bookId: string, averageRating: number, totalReviews: number): Promise<void>;
  delete(id: string): Promise<void>;
  uploadBookContent(
    bookId: string,
    files: File[],
    onProgress?: (bytesDone: number, bytesTotal: number) => void,
  ): Promise<void>;
}
