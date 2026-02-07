"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { StoreListItem, StoreDetailResponse, PaginationMeta } from "@/types";

interface StoreSearchParams {
  q?: string;
  province?: string;
  category?: string;
  mood?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  page?: number;
  pageSize?: number;
  lat?: number;
  lng?: number;
  sortByDistance?: boolean;
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

export function useNearestStore(lat?: number, lng?: number) {
  return useQuery({
    queryKey: ["stores", "nearest", lat, lng],
    queryFn: () => api.public.getStores({
      lat,
      lng,
      sortByDistance: true,
      pageSize: 1,
      page: 1,
    }),
    enabled: lat !== undefined && lng !== undefined,
    select: (data) => data.items[0] ?? null,
  });
}
