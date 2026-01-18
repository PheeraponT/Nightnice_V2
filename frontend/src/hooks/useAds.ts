"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type AdTargetingParams } from "@/lib/api";

// Re-export the type for convenience
export type { AdTargetingParams };

// T105: Hook for fetching targeted ads
export function useAds(params?: AdTargetingParams) {
  return useQuery({
    queryKey: ["ads", params?.province, params?.category, params?.type, params?.limit],
    queryFn: () => api.public.getAds(params),
    staleTime: 60 * 1000, // Cache for 1 minute
  });
}
