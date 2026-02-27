import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { storage } from "../../config/firebase";

import type { IStorageService } from "./IStorageService";

export class FirebaseStorageProvider implements IStorageService {
  //upload file to firebase storage, it returns the file URL
  async uploadFile(file: File, path: string): Promise<string> {
    try {
      // 1. Create a reference to the specific path in your bucket
      const storageRef = ref(storage, path);

      // 2. Upload the raw file bytes
      await uploadBytes(storageRef, file);

      // 3. Get the public URL to view the file
      const downloadUrl = await getDownloadURL(storageRef);

      return downloadUrl;
    } catch (error) {
      console.error("Firebase upload failed:", error);
      throw new Error("Failed to upload file to Firebase Storage.");
    }
  }

  //delete file from firebase storage
  async deleteFile(pathOrUrl: string): Promise<void> {
    try {
      //reference to file
      const storageRef = ref(storage, pathOrUrl);

      await deleteObject(storageRef);
    } catch (error) {
      console.error("Firebase delete failed:", error);
      throw new Error("Failed to delete file from Firebase Storage.");
    }
  }
}
