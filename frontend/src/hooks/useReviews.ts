import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  api,
  type ReviewDto,
  type ReviewStatsDto,
  type ReviewCreateDto,
  type ReviewUpdateDto,
  type ReviewReportDto,
  type PaginatedResponse,
} from '@/lib/api';
import { getIdToken } from '@/lib/firebase';

// Query Keys
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  list: (storeId: string, filters: { page?: number; pageSize?: number; sortBy?: string }) =>
    [...reviewKeys.lists(), storeId, filters] as const,
  stats: (storeId: string) => [...reviewKeys.all, 'stats', storeId] as const,
};

// Hook: Fetch store reviews
export function useStoreReviews(
  storeId: string,
  page: number = 1,
  pageSize: number = 10,
  sortBy: string = 'recent'
) {
  return useQuery({
    queryKey: reviewKeys.list(storeId, { page, pageSize, sortBy }),
    queryFn: () => api.public.getStoreReviews(storeId, { page, pageSize, sortBy }),
    enabled: !!storeId,
    staleTime: 0, // Always fresh - refetch immediately when invalidated
  });
}

// Hook: Fetch review statistics
export function useReviewStats(storeId: string) {
  return useQuery({
    queryKey: reviewKeys.stats(storeId),
    queryFn: () => api.public.getReviewStats(storeId),
    enabled: !!storeId,
    staleTime: 0, // Always fresh - refetch immediately when invalidated
  });
}

// Hook: Create review
export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReviewCreateDto) => {
      const token = await getIdToken();
      if (!token) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนเขียนรีวิว');
      }
      return api.public.createReview(data, token);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch reviews list and stats immediately
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.stats(variables.storeId),
        refetchType: 'active',
      });
    },
  });
}

// Hook: Update review
export function useUpdateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, data }: { reviewId: string; data: ReviewUpdateDto }) => {
      const token = await getIdToken();
      if (!token) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนแก้ไขรีวิว');
      }
      return api.public.updateReview(reviewId, data, token);
    },
    onSuccess: (updatedReview) => {
      // Invalidate and refetch reviews list and stats
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
      queryClient.invalidateQueries({ queryKey: reviewKeys.stats(updatedReview.storeId) });
    },
  });
}

// Hook: Delete review
export function useDeleteReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, storeId }: { reviewId: string; storeId: string }) => {
      const token = await getIdToken();
      if (!token) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนลบรีวิว');
      }
      return api.public.deleteReview(reviewId, token);
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch reviews list and stats immediately
      queryClient.invalidateQueries({
        queryKey: reviewKeys.lists(),
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: reviewKeys.stats(variables.storeId),
        refetchType: 'active',
      });
    },
  });
}

// Hook: Toggle helpful vote
export function useToggleHelpful() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ reviewId, storeId }: { reviewId: string; storeId: string }) => {
      const token = await getIdToken();
      if (!token) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนโหวต');
      }
      return api.public.toggleHelpful(reviewId, token);
    },
    onMutate: async ({ reviewId, storeId }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: reviewKeys.lists() });

      // Snapshot the previous value
      const previousReviews = queryClient.getQueriesData<PaginatedResponse<ReviewDto>>({
        queryKey: reviewKeys.lists(),
      });

      // Optimistically update to the new value
      queryClient.setQueriesData<PaginatedResponse<ReviewDto>>(
        { queryKey: reviewKeys.lists() },
        (old) => {
          if (!old) return old;

          return {
            ...old,
            items: old.items.map((review) => {
              if (review.id === reviewId) {
                const isCurrentlyHelpful = review.isHelpfulByCurrentUser;
                return {
                  ...review,
                  isHelpfulByCurrentUser: !isCurrentlyHelpful,
                  helpfulCount: isCurrentlyHelpful
                    ? review.helpfulCount - 1
                    : review.helpfulCount + 1,
                };
              }
              return review;
            }),
          };
        }
      );

      return { previousReviews };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousReviews) {
        context.previousReviews.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: reviewKeys.lists() });
    },
  });
}

// Hook: Report review
export function useReportReview() {
  return useMutation({
    mutationFn: async (data: ReviewReportDto) => {
      const token = await getIdToken();
      if (!token) {
        throw new Error('กรุณาเข้าสู่ระบบก่อนรายงานรีวิว');
      }
      return api.public.reportReview(data, token);
    },
  });
}
