import { apiClient, getApiBaseUrl, getToken } from './ApiClient';
import type { BookRepo, DomainBook, CreateBookInput } from '../../application/ports/BookRepo';
import type {
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
} from '../../constants/bookOptions';
import type { UploadWorkerInput, UploadWorkerMessage } from './upload.worker';

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

function uploadInWorker(
  input: UploadWorkerInput,
  onProgress?: (bytesDone: number, bytesTotal: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./upload.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (event: MessageEvent<UploadWorkerMessage>) => {
      const msg = event.data;
      if (msg.type === 'progress') {
        onProgress?.(msg.bytesDone, msg.bytesTotal);
      } else if (msg.type === 'done') {
        worker.terminate();
        resolve();
      } else {
        worker.terminate();
        reject(new Error(msg.message));
      }
    };
    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || 'Upload worker error'));
    };
    worker.postMessage(input);
  });
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

    async updateRating(_bookId: string, _avg: number, _total: number): Promise<void> {
      return;
    },

    async delete(id: string): Promise<void> {
      await apiClient.delete(`/books/${id}`);
    },

    async uploadBookContent(
      bookId: string,
      files: File[],
      onProgress?: (bytesDone: number, bytesTotal: number) => void,
    ): Promise<void> {
      await uploadInWorker(
        { bookId, files, apiBaseUrl: getApiBaseUrl(), token: getToken() },
        onProgress,
      );
    },
  };
}
