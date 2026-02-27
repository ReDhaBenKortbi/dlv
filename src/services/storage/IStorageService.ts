// src/services/storage/IStorageService.ts

export interface IStorageService {
  /**
   * Uploads a file and returns the public URL.
   * @param file The file object (e.g., from an input field).
   * @param path The destination path (e.g., 'receipts/user123_timestamp.jpg').
   * @returns A promise that resolves to the public URL of the uploaded file.
   */
  uploadFile(file: File, path: string): Promise<string>;

  /**
   * Deletes a file from storage.
   * @param pathOrUrl The path or public URL of the file to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  deleteFile(pathOrUrl: string): Promise<void>;
}
