import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBook, deleteBook, createBook } from "../../services/bookService";
import type { Book } from "../../types/book";
import { notify } from "../../utils/toast";
import { toErrorMessage } from "../../lib/errorMessage";

export const useBookMutations = () => {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["books"] });

  // 1. Mutations
  const addMutation = useMutation({
    mutationFn: createBook,
    onSuccess: invalidate,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Book> }) =>
      updateBook(id, updates),
    // `invalidate()` already clears the whole "books" prefix, which covers the
    // detail/editions/related queries too.
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: invalidate,
  });

  // 2. Wrapped Exports with Toasts
  return {
    // Add Book
    add: async (bookData: Omit<Book, "id" | "createdAt">) => {
      return await notify.promise(addMutation.mutateAsync(bookData), {
        loading: "Adding new book to library...",
        success: "Book created successfully! 📚",
        error: (err) =>
          toErrorMessage(err, "Failed to create book. Please check fields."),
      });
    },

    // Edit Book
    edit: async (id: string, updates: Partial<Book>) => {
      return await notify.promise(editMutation.mutateAsync({ id, updates }), {
        loading: "Saving changes...",
        success: "Book updated successfully!",
        error: (err) => toErrorMessage(err, "Failed to save changes."),
      });
    },

    // Same as `edit`, but without its own toast — for bulk/background
    // updates (e.g. syncing a cover across sibling editions) where one
    // toast per row would just be noise around the primary save's toast.
    editSilent: (id: string, updates: Partial<Book>) =>
      editMutation.mutateAsync({ id, updates }),

    // Remove Book
    remove: async (id: string) => {
      return await notify.promise(deleteMutation.mutateAsync(id), {
        loading: "Deleting book from vault...",
        success: "Book deleted permanently.",
        error: (err) => toErrorMessage(err, "Could not delete book."),
      });
    },

    isProcessing:
      addMutation.isPending ||
      editMutation.isPending ||
      deleteMutation.isPending,

    // Id of the book currently being deleted, so only that row shows a spinner.
    deletingId: deleteMutation.isPending
      ? deleteMutation.variables
      : undefined,
  };
};
