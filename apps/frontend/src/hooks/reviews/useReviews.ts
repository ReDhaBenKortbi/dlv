import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as reviewService from "../../services/reviewService";
import { useAuth } from "../../context/AuthContext";

export const useReviews = (bookId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // 1. Fetch all reviews for this book
  const { data: reviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ["reviews", bookId],
    queryFn: () => reviewService.getReviewsByBookId(bookId),
  });

  // 2. Fetch the current user's review (if it exists)
  const { data: userReview } = useQuery({
    queryKey: ["userReview", bookId, user?.id],
    queryFn: () => reviewService.getUserReviewForBook(bookId, user!.id),
    enabled: !!user,
  });

  // 3. Add Review Mutation
  const addMutation = useMutation({
    mutationFn: reviewService.addReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
      queryClient.invalidateQueries({
        queryKey: ["userReview", bookId, user?.id],
      });
      // Also invalidate the book query so the BookCard/Details shows new rating
      queryClient.invalidateQueries({ queryKey: ["books", bookId] });
    },
  });

  // 4. Delete Review Mutation (Corrected to pass bookId)
  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) =>
      reviewService.deleteReview(reviewId, bookId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", bookId] });
      queryClient.invalidateQueries({
        queryKey: ["userReview", bookId, user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ["books", bookId] });
    },
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
