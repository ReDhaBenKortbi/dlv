import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUseCases } from "../../presentation/providers/UseCasesContext";
import { useAuth } from "../../context/AuthContext";
import type { AddReviewInput } from "../../application/reviews/addReview";

export const useReviews = (bookId: string) => {
  const queryClient = useQueryClient();
  const { getReviewsByBook, getUserReview, addReview, deleteReview } = useUseCases();
  const { user } = useAuth();

  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", bookId],
    queryFn: () => getReviewsByBook(bookId),
  });

  const { data: userReview } = useQuery({
    queryKey: ["userReview", bookId, user?.uid],
    queryFn: () => getUserReview(bookId, user!.uid),
    enabled: !!user,
  });

  const invalidateReviews = () => {
    queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
    queryClient.invalidateQueries({ queryKey: ["userReview", bookId, user?.uid] });
    queryClient.invalidateQueries({ queryKey: ["books", bookId] });
  };

  const addMutation = useMutation({
    mutationFn: (input: AddReviewInput) => addReview(input),
    onSuccess: invalidateReviews,
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => deleteReview({ reviewId, bookId }),
    onSuccess: invalidateReviews,
  });

  return {
    reviews,
    userReview,
    isLoadingReviews,
    addReview: addMutation.mutate,
    isAdding: addMutation.isPending,
    deleteReview: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
