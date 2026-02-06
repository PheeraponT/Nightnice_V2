import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  api,
  type OwnerStoreListDto,
  type OwnerStoreDetailDto,
  type OwnerStoreUpdateDto,
  type OwnerViewAnalyticsDto,
  type OwnerRatingAnalyticsDto,
  type StoreMoodInsightDto,
} from '@/lib/api';
import { getIdToken } from '@/lib/firebase';

export const ownerKeys = {
  all: ['owner'] as const,
  stores: () => [...ownerKeys.all, 'stores'] as const,
  store: (storeId: string) => [...ownerKeys.all, 'store', storeId] as const,
  views: (storeId: string, days: number) => [...ownerKeys.all, 'views', storeId, days] as const,
  ratings: (storeId: string) => [...ownerKeys.all, 'ratings', storeId] as const,
  mood: (storeId: string) => [...ownerKeys.all, 'mood', storeId] as const,
};

export function useOwnedStores() {
  return useQuery({
    queryKey: ownerKeys.stores(),
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.getStores(token);
    },
    staleTime: 60 * 1000,
  });
}

export function useOwnedStore(storeId: string) {
  return useQuery({
    queryKey: ownerKeys.store(storeId),
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.getStore(token, storeId);
    },
    enabled: !!storeId,
    staleTime: 60 * 1000,
  });
}

export function useUpdateOwnedStore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, data }: { storeId: string; data: OwnerStoreUpdateDto }) => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.updateStore(token, storeId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.store(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: ownerKeys.stores() });
    },
  });
}

export function useUploadOwnerLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, file }: { storeId: string; file: File }) => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.uploadLogo(token, storeId, file);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.store(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: ownerKeys.stores() });
    },
  });
}

export function useDeleteOwnerLogo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId }: { storeId: string }) => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.deleteLogo(token, storeId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.store(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: ownerKeys.stores() });
    },
  });
}

export function useUploadOwnerBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, file }: { storeId: string; file: File }) => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.uploadBanner(token, storeId, file);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.store(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: ownerKeys.stores() });
    },
  });
}

export function useDeleteOwnerBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId }: { storeId: string }) => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.deleteBanner(token, storeId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.store(variables.storeId) });
      queryClient.invalidateQueries({ queryKey: ownerKeys.stores() });
    },
  });
}

export function useViewAnalytics(storeId: string, days: number = 30) {
  return useQuery({
    queryKey: ownerKeys.views(storeId, days),
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.getViewAnalytics(token, storeId, days);
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRatingAnalytics(storeId: string) {
  return useQuery({
    queryKey: ownerKeys.ratings(storeId),
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.getRatingAnalytics(token, storeId);
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useMoodAnalytics(storeId: string) {
  return useQuery({
    queryKey: ownerKeys.mood(storeId),
    queryFn: async () => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.getMoodAnalytics(token, storeId);
    },
    enabled: !!storeId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReplyToReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, reviewId, reply }: { storeId: string; reviewId: string; reply: string }) => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.createReviewReply(token, storeId, reviewId, reply);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.ratings(variables.storeId) });
    },
  });
}

export function useUpdateReviewReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, reviewId, reply }: { storeId: string; reviewId: string; reply: string }) => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.updateReviewReply(token, storeId, reviewId, reply);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.ratings(variables.storeId) });
    },
  });
}

export function useDeleteReviewReply() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ storeId, reviewId }: { storeId: string; reviewId: string }) => {
      const token = await getIdToken();
      if (!token) throw new Error('กรุณาเข้าสู่ระบบ');
      return api.owner.deleteReviewReply(token, storeId, reviewId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.ratings(variables.storeId) });
    },
  });
}
