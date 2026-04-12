import {
  CLOUDINARY_UPLOAD_PRESET,
  CLOUDINARY_CLOUD_NAME,
} from "../../utils/constants";
import type { FileUploader } from "../../application/ports/FileUploader";

export function makeCloudinaryFileUploader(): FileUploader {
  return {
    async upload(file: File): Promise<string> {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData: { error?: { message?: string } } = await response.json();
        throw new Error(errorData.error?.message ?? "Cloudinary upload failed");
      }

      const data: { secure_url: string } = await response.json();
      return data.secure_url;
    },
  };
}
