import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateBook, deleteBook, createBook } from "../../services/bookService";
import type { Book } from "../../types/book";
import { notify } from "../../utils/toast"; // Our Adapter

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
    onSuccess: (_, variables) => {
      invalidate();
      queryClient.invalidateQueries({ queryKey: ["books", variables.id] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBook,
    onSuccess: invalidate,
  });

  // 2. Wrapped Exports with Toasts
  return {
    // Add Book
    add: async (bookData: Omit<Book, "id" | "createdAt">) => {
      const fullBook = { ...bookData, createdAt: new Date().toISOString() };
      return await notify.promise(addMutation.mutateAsync(fullBook), {
        loading: "Adding new book to library...",
        success: "Book created successfully! 📚",
        error: "Failed to create book. Please check fields.",
      });
    },

    // Edit Book
    edit: async (id: string, updates: Partial<Book>) => {
      return await notify.promise(editMutation.mutateAsync({ id, updates }), {
        loading: "Saving changes...",
        success: "Book updated successfully!",
        error: "Failed to save changes.",
      });
    },

    // Remove Book
    remove: async (id: string) => {
      return await notify.promise(deleteMutation.mutateAsync(id), {
        loading: "Deleting book from vault...",
        success: "Book deleted permanently.",
        error: "Could not delete book.",
      });
    },

    isProcessing:
      addMutation.isPending ||
      editMutation.isPending ||
      deleteMutation.isPending,
  };
};
