import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as reviewService from "@/services/reviewService";
import { useAuth } from "@/context/AuthContext";
import { queryKeys } from "@/lib/queryKeys";

export const useReviews = (bookId: string, page = 1, limit = 9) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Writing a review changes the book's averageRating/totalReviews aggregates,
  // so the book queries have to go too.
  const invalidateReviews = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.forBook(bookId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.books.all });
  };

  const {
    data: reviewsData,
    isLoading: isLoadingReviews,
  } = useQuery({
    queryKey: queryKeys.reviews.list(bookId, page, limit),
    queryFn: () => reviewService.getReviewsByBookId(bookId, page, limit),
  });
  const reviews = reviewsData?.data ?? [];
  const meta = reviewsData?.meta;

  // 2. Fetch the current user's review (if it exists) — independent of
  // pagination, so it stays correct no matter which page is loaded.
  const { data: userReview } = useQuery({
    queryKey: queryKeys.reviews.mine(bookId, user?.id),
    queryFn: () => reviewService.getUserReviewForBook(bookId),
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: reviewService.addReview,
    onSuccess: invalidateReviews,
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) =>
      reviewService.deleteReview(reviewId, bookId),
    onSuccess: invalidateReviews,
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
