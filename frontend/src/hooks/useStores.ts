"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { StoreListItem, StoreDetailResponse, PaginationMeta } from "@/types";

interface StoreSearchParams {
  q?: string;
  province?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  page?: number;
  pageSize?: number;
}

interface StoreListResponse {
  items: StoreListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export function useStores(params: StoreSearchParams = {}) {
  return useQuery({
    queryKey: ["stores", params],
    queryFn: () => api.public.getStores(params),
  });
}

export function useFeaturedStores(count: number = 6) {
  return useQuery({
    queryKey: ["stores", "featured", count],
    queryFn: () => api.public.getFeaturedStores(count),
  });
}

export function useStore(slug: string) {
  return useQuery({
    queryKey: ["store", slug],
    queryFn: () => api.public.getStoreBySlug(slug),
    enabled: !!slug,
  });
}
