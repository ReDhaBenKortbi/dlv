export interface FileUploader {
  upload(file: File): Promise<string>;
}
