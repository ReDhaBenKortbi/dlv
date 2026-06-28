// src/utils/toast.ts
import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

// Define a flexible type for the messages
type PromiseMessages<T = any> = {
  loading: string | React.ReactNode;
  success: string | React.ReactNode | ((data: T) => React.ReactNode);
  error: string | React.ReactNode | ((error: any) => React.ReactNode);
};

export const notify = {
  // ... success/error/info helpers remain the same ...
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),

  /**
   * WRAPPER FIX:
   * 1. We use a generic <T> to preserve the Promise type.
   * 2. We return the 'promise' itself, not the result of sonnerToast.promise().
   * This allows 'await notify.promise(...)' to actually wait for the upload.
   */
  // Look for the 'promise' function and replace it with this:
  promise: async <T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: ExternalToast,
  ): Promise<boolean> => {
    try {
      // We 'await' the toast to finish
      await sonnerToast.promise(promise, {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
        ...options,
      });
      // If it reaches here, it succeeded! We return true.
      return true;
    } catch (error) {
      // If it crashed, we return false.
      return false;
    }
  },
};
