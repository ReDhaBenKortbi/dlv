import { apiClient } from './ApiClient';
import type { BookRepo, DomainBook, CreateBookInput } from '../../application/ports/BookRepo';
import type {
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
} from '../../constants/bookOptions';

interface ApiBook {
  id: string;
  title: string;
  author: string;
  description: string;
  coverURL: string;
  indexURL: string;
  isPremium: boolean;
  category?: string;
  targetLanguage?: string;
  focusSkill?: string;
  proficiencyLevel?: string;
  averageRating: number;
  totalReviews: number;
  createdAt: string;
  updatedAt: string;
}

function toBook(api: ApiBook): DomainBook {
  return {
    id: api.id,
    title: api.title,
    author: api.author,
    description: api.description,
    coverURL: api.coverURL,
    indexURL: api.indexURL,
    isPremium: api.isPremium,
    category: api.category,
    targetLanguage: api.targetLanguage as TargetLanguageCode | undefined,
    focusSkill: api.focusSkill as FocusSkillCode | undefined,
    proficiencyLevel: api.proficiencyLevel as ProficiencyLevelCode | undefined,
    averageRating: api.averageRating,
    totalReviews: api.totalReviews,
    createdAt: new Date(api.createdAt),
    updatedAt: api.updatedAt ? new Date(api.updatedAt) : undefined,
  };
}

export function makeApiBookRepo(): BookRepo {
  return {
    async findAll(): Promise<DomainBook[]> {
      const books = await apiClient.get<ApiBook[]>('/books');
      return books.map(toBook);
    },

    async findById(id: string): Promise<DomainBook | null> {
      try {
        const book = await apiClient.get<ApiBook>(`/books/${id}`);
        return toBook(book);
      } catch {
        return null;
      }
    },

    async create(input: CreateBookInput): Promise<string> {
      const book = await apiClient.post<ApiBook>('/books', input);
      return book.id;
    },

    async update(id: string, updates: Partial<Omit<DomainBook, 'id'>>): Promise<void> {
      await apiClient.patch(`/books/${id}`, updates);
    },

    // Rating is updated by the backend when reviews are created/deleted.
    // This no-op satisfies the port interface without a redundant API call.
    async updateRating(_bookId: string, _avg: number, _total: number): Promise<void> {
      return;
    },

    async delete(id: string): Promise<void> {
      await apiClient.delete(`/books/${id}`);
    },
  };
}
