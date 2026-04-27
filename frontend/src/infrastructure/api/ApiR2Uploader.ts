import { apiClient } from "./ApiClient";
import type { FileUploader } from "../../application/ports/FileUploader";

interface SignResponse {
  key: string;
  putUrl: string;
  publicUrl: string;
}

export interface ApiR2UploaderOptions {
  signEndpoint: string;
  allowedContentTypes?: ReadonlyArray<string>;
}

const DEFAULT_ALLOWED = ["image/jpeg", "image/png", "image/webp"] as const;

export function makeApiR2Uploader(options: ApiR2UploaderOptions): FileUploader {
  const allowed = options.allowedContentTypes ?? DEFAULT_ALLOWED;

  return {
    async upload(file: File): Promise<string> {
      if (!allowed.includes(file.type)) {
        throw new Error(
          `Unsupported file type "${file.type}". Allowed: ${allowed.join(", ")}`,
        );
      }

      const signed = await apiClient.post<SignResponse>(options.signEndpoint, {
        fileName: file.name,
        contentType: file.type,
      });

      const putRes = await fetch(signed.putUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!putRes.ok) {
        throw new Error(
          `Upload failed: ${putRes.status} ${putRes.statusText}`,
        );
      }

      return signed.publicUrl;
    },
  };
}
