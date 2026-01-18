"use client";

import { useCallback, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, type AdTrackingDto } from "@/lib/api";

// T106: Hook for tracking ad impressions and clicks
export function useAdTracking() {
  const trackedImpressions = useRef<Set<string>>(new Set());

  const { mutate: track } = useMutation({
    mutationFn: (data: AdTrackingDto) => api.public.trackAdEvent(data),
    onError: (error) => {
      console.error("Failed to track ad event:", error);
    },
  });

  const trackImpression = useCallback(
    (adId: string, pageUrl?: string) => {
      // Prevent duplicate impressions for same ad on same page load
      if (trackedImpressions.current.has(adId)) {
        return;
      }

      trackedImpressions.current.add(adId);

      track({
        adId,
        eventType: "impression",
        pageUrl: pageUrl || (typeof window !== "undefined" ? window.location.href : undefined),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
    },
    [track]
  );

  const trackClick = useCallback(
    (adId: string, pageUrl?: string) => {
      track({
        adId,
        eventType: "click",
        pageUrl: pageUrl || (typeof window !== "undefined" ? window.location.href : undefined),
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
      });
    },
    [track]
  );

  return {
    trackImpression,
    trackClick,
  };
}
