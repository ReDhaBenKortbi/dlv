import type { IStorageService } from "./IStorageService";
import { FirebaseStorageProvider } from "./FirebaseStorageProvider";

// 2. The Factory Function
function getStorageService(): IStorageService {
  return new FirebaseStorageProvider();
}

// 3. Export a SINGLE instance of the chosen service (Singleton pattern)
export const storageService = getStorageService();
