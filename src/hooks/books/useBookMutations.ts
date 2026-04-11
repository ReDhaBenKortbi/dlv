import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useUseCases } from "../../presentation/providers/UseCasesContext";
import type { CreateBookInput, DomainBook } from "../../application/ports/BookRepo";
import { notify } from "../../utils/toast";

export const useBookMutations = () => {
  const queryClient = useQueryClient();
  const { createBook, updateBook, deleteBook } = useUseCases();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["books"] });

  const addMutation = useMutation({
    mutationFn: createBook,
    onSuccess: invalidate,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Omit<DomainBook, "id">> }) =>
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

  return {
    add: async (bookData: CreateBookInput) =>
      notify.promise(addMutation.mutateAsync(bookData), {
        loading: "Adding new book to library...",
        success: "Book created successfully!",
        error: "Failed to create book. Please check fields.",
      }),

    edit: async (id: string, updates: Partial<Omit<DomainBook, "id">>) =>
      notify.promise(editMutation.mutateAsync({ id, updates }), {
        loading: "Saving changes...",
        success: "Book updated successfully!",
        error: "Failed to save changes.",
      }),

    remove: async (id: string) =>
      notify.promise(deleteMutation.mutateAsync(id), {
        loading: "Deleting book from vault...",
        success: "Book deleted permanently.",
        error: "Could not delete book.",
      }),

    isProcessing:
      addMutation.isPending ||
      editMutation.isPending ||
      deleteMutation.isPending,
  };
};
