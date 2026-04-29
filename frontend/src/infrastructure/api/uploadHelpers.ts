export const MULTIPART_THRESHOLD = 5 * 1024 * 1024;
const PART_SIZE = 10 * 1024 * 1024;
export const UPLOAD_CONCURRENCY = 20; // was 5 — increased to saturate 200Mb/s with many small files
export const PART_CONCURRENCY = 6;    // was 4 — extra parallelism for large-file chunks
export const SIGN_BATCH_SIZE = 500;   // raised from 200 — fewer batches fit in HTTP/1.1's 6-connection cap, reducing queue time
const MAX_RETRIES = 3;

export function stripTopFolder(file: File): string {
  const raw = (file as File & { webkitRelativePath?: string }).webkitRelativePath ?? file.name;
  return raw.includes('/') ? raw.split('/').slice(1).join('/') : raw;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export class Semaphore {
  private active = 0;
  private queue: Array<() => void> = [];
  private readonly limit: number;

  constructor(limit: number) {
    this.limit = limit;
  }

  async run<T>(task: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await task();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.active < this.limit) {
      this.active++;
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.queue.push(() => {
        this.active++;
        resolve();
      });
    });
  }

  private release(): void {
    this.active--;
    const next = this.queue.shift();
    if (next) next();
  }
}

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export async function withRetry<T>(
  task: () => Promise<T>,
  attempts = MAX_RETRIES,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await task();
    } catch (error: unknown) {
      lastError = error;
      if (i < attempts - 1) {
        await delay(250 * 4 ** i);
      }
    }
  }
  throw lastError;
}

export function splitFileParts(size: number): Array<{ partNumber: number; start: number; end: number }> {
  const parts: Array<{ partNumber: number; start: number; end: number }> = [];
  let offset = 0;
  let partNumber = 1;
  while (offset < size) {
    const end = Math.min(offset + PART_SIZE, size);
    parts.push({ partNumber, start: offset, end });
    offset = end;
    partNumber++;
  }
  return parts;
}

export function readETag(response: Response): string {
  const etag = response.headers.get('etag') ?? response.headers.get('ETag');
  if (!etag) {
    throw new Error('Missing ETag header on S3 response — check bucket CORS ExposeHeaders includes ETag');
  }
  return etag;
}
