/**
 * Toast messages, as a thin layer over `sonner`.
 *
 * Everything goes through here rather than importing `sonner` directly, so
 * wording and behaviour stay consistent and swapping the library later means
 * changing one file. `notify.promise` in particular replaced the hand-rolled
 * loading/success/error toast trios that had been written out at each
 * mutation call site.
 */
import { toast as sonnerToast } from "sonner";
import type { ExternalToast } from "sonner";

type PromiseMessages<T = unknown> = {
  loading: string | React.ReactNode;
  success: string | React.ReactNode | ((data: T) => React.ReactNode);
  error: string | React.ReactNode | ((error: unknown) => React.ReactNode);
};

export const notify = {
  success: (message: string) => sonnerToast.success(message),
  error: (message: string) => sonnerToast.error(message),

  /**
   * Shows loading/success/error toasts for `promise` and resolves to whether
   * it succeeded, so callers can gate follow-up work (navigation, cascading
   * writes) on the result.
   *
   * `sonnerToast.promise()` does NOT return a promise — it returns a toast
   * handle carrying an `unwrap()`. Awaiting the handle directly resolves
   * immediately, which is why this used to return `true` unconditionally and
   * never actually waited. `unwrap()` returns the real promise and rethrows
   * on rejection.
   */
  promise: async <T>(
    promise: Promise<T>,
    messages: PromiseMessages<T>,
    options?: ExternalToast,
  ): Promise<boolean> => {
    try {
      await sonnerToast
        .promise(promise, {
          loading: messages.loading,
          success: messages.success,
          error: messages.error,
          ...options,
        })
        .unwrap();
      return true;
    } catch {
      return false;
    }
  },
};
