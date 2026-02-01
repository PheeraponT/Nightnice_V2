"use client";

import { useEffect, useRef } from "react";
import { api } from "@/lib/api";

/**
 * Hook for tracking store page views for popularity metrics.
 * Tracks after 2 seconds to ensure user actually viewed the page.
 * Prevents duplicate tracking with ref.
 */
export function useViewTracking(storeId: string | undefined) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!storeId || tracked.current) return;

    const trackView = async () => {
      try {
        await api.public.trackStoreView(storeId, window.location.pathname);
        tracked.current = true;
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    };

    // Delay tracking to ensure user actually viewed the page
    const timeout = setTimeout(trackView, 2000);
    return () => clearTimeout(timeout);
  }, [storeId]);
}
