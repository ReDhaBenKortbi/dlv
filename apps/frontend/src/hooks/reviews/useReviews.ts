import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as reviewService from "../../services/reviewService";
import { useAuth } from "../../context/AuthContext";

export const useReviews = (bookId: string, page = 1, limit = 9) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // 1. Fetch this page of reviews for this book
  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
  } = useQuery({
    queryKey: ["reviews", bookId, page, limit],
    queryFn: () => reviewService.getReviewsByBookId(bookId, page, limit),
  });
  const reviews = reviewsData?.data ?? [];
  const meta = reviewsData?.meta;

  // 2. Fetch the current user's review (if it exists) — independent of
  // pagination, so it stays correct no matter which page is loaded.
  const { data: userReview } = useQuery({
    queryKey: ["userReview", bookId, user?.id],
    queryFn: () => reviewService.getUserReviewForBook(bookId),
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
    meta,
    userReview,
    isLoadingReviews,
    addReview: addMutation.mutate,
    isAdding: addMutation.isPending,
    deleteReview: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
