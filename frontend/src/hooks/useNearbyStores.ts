"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// T085: Hook for fetching nearby stores
export function useNearbyStores(slug: string, radius: number = 5, count: number = 6) {
  return useQuery({
    queryKey: ["stores", slug, "nearby", radius, count],
    queryFn: () => api.public.getNearbyStores(slug, radius, count),
    enabled: !!slug,
  });
}
