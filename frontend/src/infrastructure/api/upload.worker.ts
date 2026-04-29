/// <reference lib="webworker" />
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

interface PreparedFile {
  file: File;
  fileName: string;
  contentType: string;
}

export interface UploadWorkerInput {
  bookId: string;
  files: File[];
  apiBaseUrl: string;
  token: string | null;
}

export type UploadWorkerMessage =
  | { type: 'progress'; bytesDone: number; bytesTotal: number }
  | { type: 'done' }
  | { type: 'error'; message: string };

const ctx = self as DedicatedWorkerGlobalScope;

function makeApi(apiBaseUrl: string, token: string | null) {
  async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(err.message ?? `HTTP ${res.status}`);
    }
    if (res.status === 204) return undefined as T;
    if (res.status === 404) return null as T;
    return res.json() as Promise<T>;
  }
  return {
    get: <T>(path: string) => request<T>(path, 'GET'),
    post: <T>(path: string, body?: unknown) => request<T>(path, 'POST', body),
    patch: <T>(path: string, body?: unknown) => request<T>(path, 'PATCH', body),
    delete: (path: string, body?: unknown) => request<void>(path, 'DELETE', body),
  };
}

interface ManifestEntry {
  fileName: string;
  status: 'pending' | 'complete';
}

interface UploadSessionResponse {
  id: string;
  bookId: string;
  status: 'in_progress' | 'complete' | 'failed';
  manifest: ManifestEntry[];
}

class SessionTracker {
  private queue: string[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private inFlight: Promise<void> = Promise.resolve();
  private readonly api: Api;
  private readonly bookId: string;

  constructor(api: Api, bookId: string) {
    this.api = api;
    this.bookId = bookId;
  }

  markComplete(fileName: string): void {
    this.queue.push(fileName);
    if (this.queue.length >= 50) {
      void this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => void this.flush(), 2000);
    }
  }

  async flush(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.queue.length === 0) return this.inFlight;
    const completed = this.queue;
    this.queue = [];
    this.inFlight = this.inFlight
      .catch(() => undefined)
      .then(() =>
        this.api
          .patch(`/books/${this.bookId}/upload-session`, { completed })
          .then(() => undefined)
          .catch(() => undefined),
      );
    return this.inFlight;
  }

  async finalize(status: 'complete' | 'failed'): Promise<void> {
    await this.flush();
    await this.api
      .patch(`/books/${this.bookId}/upload-session`, { status })
      .catch(() => undefined);
  }
}

type Api = ReturnType<typeof makeApi>;

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
  api: Api,
  bookId: string,
  smalls: PreparedFile[],
  onBytes: (delta: number) => void,
  onFileComplete: (fileName: string) => void,
): Promise<void> {
  if (smalls.length === 0) return;

  const batches: PreparedFile[][] = [];
  for (let i = 0; i < smalls.length; i += SIGN_BATCH_SIZE) {
    batches.push(smalls.slice(i, i + SIGN_BATCH_SIZE));
  }

  const signedBatches = await Promise.all(
    batches.map((batch) =>
      api.post<SignBatchResponse>(`/books/${bookId}/content/sign-batch`, {
        files: batch.map(({ fileName, contentType }) => ({ fileName, contentType })),
      }),
    ),
  );

  const allSigned: SignedFile[] = signedBatches.flatMap((r) => r.files);
  const semaphore = new Semaphore(UPLOAD_CONCURRENCY);
  const completed = new Set<string>();

  await Promise.all(
    smalls.map((prep, idx) =>
      semaphore.run(async () => {
        const { url, key } = allSigned[idx];
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
        onFileComplete(prep.fileName);
      }),
    ),
  );
}

async function uploadLargeFile(
  api: Api,
  bookId: string,
  prep: PreparedFile,
  onBytes: (delta: number) => void,
  onFileComplete: (fileName: string) => void,
): Promise<void> {
  const initiate = await api.post<InitiateResponse>(
    `/books/${bookId}/content/multipart/initiate`,
    { fileName: prep.fileName, contentType: prep.contentType },
  );

  const parts = splitFileParts(prep.file.size);
  const partNumbers = parts.map((p) => p.partNumber);

  try {
    const { partUrls } = await api.post<SignPartsResponse>(
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

    await api.post(`/books/${bookId}/content/multipart/complete`, {
      uploadId: initiate.uploadId,
      key: initiate.key,
      parts: completedParts,
    });
    onFileComplete(prep.fileName);
  } catch (error) {
    await api
      .delete(`/books/${bookId}/content/multipart/abort`, {
        uploadId: initiate.uploadId,
        key: initiate.key,
      })
      .catch(() => undefined);
    throw error;
  }
}

async function waitForIndexUrl(api: Api, bookId: string): Promise<void> {
  const intervalMs = 2000;
  const timeoutMs = 5 * 60 * 1000;
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const book = await api
      .get<{ indexURL: string | null }>(`/books/${bookId}`)
      .catch(() => null);
    if (book && book.indexURL) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error('Flipbook processing timed out — book.indexURL not set');
}

async function resolveSkipSet(
  api: Api,
  bookId: string,
  prepared: PreparedFile[],
): Promise<Set<string>> {
  const existing = await api
    .get<UploadSessionResponse | null>(`/books/${bookId}/upload-session`)
    .catch(() => null);

  if (existing && existing.status === 'in_progress') {
    return new Set(
      existing.manifest.filter((m) => m.status === 'complete').map((m) => m.fileName),
    );
  }

  await api.post(`/books/${bookId}/upload-session`, {
    files: prepared.map((p) => ({ fileName: p.fileName })),
  });
  return new Set();
}

async function run(input: UploadWorkerInput): Promise<void> {
  const api = makeApi(input.apiBaseUrl, input.token);
  const prepared = prepare(input.files);
  const totalBytes = prepared.reduce((sum, p) => sum + p.file.size, 0);

  const skip = await resolveSkipSet(api, input.bookId, prepared);
  const tracker = new SessionTracker(api, input.bookId);

  const alreadyDoneBytes = prepared
    .filter((p) => skip.has(p.fileName))
    .reduce((sum, p) => sum + p.file.size, 0);

  let bytesDone = alreadyDoneBytes;
  const PROGRESS_INTERVAL_MS = 250;
  let lastPostedAt = 0;
  let scheduled = false;
  const postProgress = () => {
    lastPostedAt = Date.now();
    scheduled = false;
    const msg: UploadWorkerMessage = { type: 'progress', bytesDone, bytesTotal: totalBytes };
    ctx.postMessage(msg);
  };
  const reportBytes = (delta: number) => {
    bytesDone += delta;
    const now = Date.now();
    const since = now - lastPostedAt;
    if (since >= PROGRESS_INTERVAL_MS) {
      postProgress();
    } else if (!scheduled) {
      scheduled = true;
      setTimeout(postProgress, PROGRESS_INTERVAL_MS - since);
    }
  };
  const flushProgress = () => {
    if (scheduled) scheduled = false;
    postProgress();
  };
  flushProgress();

  const remaining = prepared.filter((p) => !skip.has(p.fileName));
  const smalls = remaining.filter((p) => p.file.size < MULTIPART_THRESHOLD);
  const larges = remaining.filter((p) => p.file.size >= MULTIPART_THRESHOLD);

  try {
    await uploadSmallFiles(api, input.bookId, smalls, reportBytes, (name) => tracker.markComplete(name));

    const largeSemaphore = new Semaphore(2);
    await Promise.all(
      larges.map((prep) =>
        largeSemaphore.run(() =>
          uploadLargeFile(api, input.bookId, prep, reportBytes, (name) => tracker.markComplete(name)),
        ),
      ),
    );

    const entryFileName = findEntryFileName(prepared);
    if (!entryFileName) throw new Error('No .html entry file found in uploaded folder');

    flushProgress();
    await api.post(`/books/${input.bookId}/content/process`, { entryFileName });
    await waitForIndexUrl(api, input.bookId);
    await tracker.finalize('complete');
  } catch (error) {
    await tracker.finalize('failed');
    throw error;
  }
}

ctx.onmessage = (event: MessageEvent<UploadWorkerInput>) => {
  run(event.data)
    .then(() => {
      const msg: UploadWorkerMessage = { type: 'done' };
      ctx.postMessage(msg);
    })
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Upload failed';
      const msg: UploadWorkerMessage = { type: 'error', message };
      ctx.postMessage(msg);
    });
};
