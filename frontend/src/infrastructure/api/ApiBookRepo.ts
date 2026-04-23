import { apiClient } from './ApiClient';
import type { BookRepo, DomainBook, CreateBookInput } from '../../application/ports/BookRepo';
import type {
  TargetLanguageCode,
  FocusSkillCode,
  ProficiencyLevelCode,
} from '../../constants/bookOptions';
import {
  MULTIPART_THRESHOLD,
  PART_CONCURRENCY,
  SIGN_BATCH_SIZE,
  Semaphore,
  UPLOAD_CONCURRENCY,
  readETag,
  splitFileParts,
  stripTopFolder,
  withRetry,
} from './uploadHelpers';

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

interface SignedFile {
  url: string;
  key: string;
}

interface SignBatchResponse {
  files: SignedFile[];
}

interface InitiateResponse {
  uploadId: string;
  key: string;
}

interface SignPartsResponse {
  partUrls: Record<number, string>;
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

interface PreparedFile {
  file: File;
  fileName: string;
  contentType: string;
}

function prepare(files: File[]): PreparedFile[] {
  return files.map((file) => ({
    file,
    fileName: stripTopFolder(file),
    contentType: file.type || 'application/octet-stream',
  }));
}

function findEntryFileName(prepared: PreparedFile[]): string | null {
  const candidates = prepared.filter((p) => /\.html?$/i.test(p.fileName));
  if (candidates.length === 0) return null;
  const indexHit = candidates.find((p) => /(^|\/)index\.html?$/i.test(p.fileName));
  return (indexHit ?? candidates[0]).fileName;
}

async function uploadSmallFiles(
  bookId: string,
  smalls: PreparedFile[],
  onBytes: (delta: number) => void,
): Promise<void> {
  const semaphore = new Semaphore(UPLOAD_CONCURRENCY);
  const completed = new Set<string>();

  for (let i = 0; i < smalls.length; i += SIGN_BATCH_SIZE) {
    const batch = smalls.slice(i, i + SIGN_BATCH_SIZE);
    const { files: signed } = await apiClient.post<SignBatchResponse>(
      `/books/${bookId}/content/sign-batch`,
      {
        files: batch.map(({ fileName, contentType }) => ({ fileName, contentType })),
      },
    );

    await Promise.all(
      batch.map((prep, idx) =>
        semaphore.run(async () => {
          const { url, key } = signed[idx];
          if (completed.has(key)) return;
          await withRetry(async () => {
            const res = await fetch(url, {
              method: 'PUT',
              headers: { 'Content-Type': prep.contentType },
              body: prep.file,
            });
            if (!res.ok) {
              throw new Error(`Upload failed for ${prep.fileName}: ${res.status} ${res.statusText}`);
            }
          });
          completed.add(key);
          onBytes(prep.file.size);
        }),
      ),
    );
  }
}

async function uploadLargeFile(
  bookId: string,
  prep: PreparedFile,
  onBytes: (delta: number) => void,
): Promise<void> {
  const initiate = await apiClient.post<InitiateResponse>(
    `/books/${bookId}/content/multipart/initiate`,
    { fileName: prep.fileName, contentType: prep.contentType },
  );

  const parts = splitFileParts(prep.file.size);
  const partNumbers = parts.map((p) => p.partNumber);

  try {
    const { partUrls } = await apiClient.post<SignPartsResponse>(
      `/books/${bookId}/content/multipart/sign-parts`,
      { uploadId: initiate.uploadId, key: initiate.key, partNumbers },
    );

    const partSemaphore = new Semaphore(PART_CONCURRENCY);
    const completedParts: Array<{ PartNumber: number; ETag: string }> = new Array(parts.length);

    await Promise.all(
      parts.map((part, idx) =>
        partSemaphore.run(async () => {
          const url = partUrls[part.partNumber];
          const chunk = prep.file.slice(part.start, part.end);
          const etag = await withRetry(async () => {
            const res = await fetch(url, {
              method: 'PUT',
              headers: { 'Content-Type': prep.contentType },
              body: chunk,
            });
            if (!res.ok) {
              throw new Error(
                `Part ${part.partNumber} upload failed for ${prep.fileName}: ${res.status} ${res.statusText}`,
              );
            }
            return readETag(res);
          });
          completedParts[idx] = { PartNumber: part.partNumber, ETag: etag };
          onBytes(part.end - part.start);
        }),
      ),
    );

    await apiClient.post(`/books/${bookId}/content/multipart/complete`, {
      uploadId: initiate.uploadId,
      key: initiate.key,
      parts: completedParts,
    });
  } catch (error) {
    await apiClient
      .delete(`/books/${bookId}/content/multipart/abort`, {
        uploadId: initiate.uploadId,
        key: initiate.key,
      })
      .catch(() => undefined);
    throw error;
  }
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
      const prepared = prepare(files);
      const totalBytes = prepared.reduce((sum, p) => sum + p.file.size, 0);
      let bytesDone = 0;
      const reportBytes = (delta: number) => {
        bytesDone += delta;
        onProgress?.(bytesDone, totalBytes);
      };

      const smalls = prepared.filter((p) => p.file.size < MULTIPART_THRESHOLD);
      const larges = prepared.filter((p) => p.file.size >= MULTIPART_THRESHOLD);

      await uploadSmallFiles(bookId, smalls, reportBytes);

      const largeSemaphore = new Semaphore(2);
      await Promise.all(larges.map((prep) => largeSemaphore.run(() => uploadLargeFile(bookId, prep, reportBytes))));

      const entryFileName = findEntryFileName(prepared);
      if (!entryFileName) throw new Error('No .html entry file found in uploaded folder');

      await apiClient.patch(`/books/${bookId}/content`, { entryFileName });
    },
  };
}
