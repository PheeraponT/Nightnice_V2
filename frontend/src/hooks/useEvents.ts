"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { EventSearchParams } from "@/lib/api";

export function useEvents(params: EventSearchParams = {}) {
  return useQuery({
    queryKey: ["events", params],
    queryFn: () => api.public.getEvents(params),
  });
}

export function useUpcomingEvents(params?: { province?: string; eventType?: string; limit?: number }) {
  return useQuery({
    queryKey: ["events", "upcoming", params],
    queryFn: () => api.public.getUpcomingEvents(params),
  });
}

export function useFeaturedEvents(limit: number = 6) {
  return useQuery({
    queryKey: ["events", "featured", limit],
    queryFn: () => api.public.getFeaturedEvents(limit),
  });
}

export function useCalendarEvents(year: number, month: number, province?: string) {
  return useQuery({
    queryKey: ["events", "calendar", year, month, province],
    queryFn: () => api.public.getCalendarEvents(year, month, province),
  });
}

export function useEvent(slug: string) {
  return useQuery({
    queryKey: ["event", slug],
    queryFn: () => api.public.getEventBySlug(slug),
    enabled: !!slug,
  });
}

export function useStoreEvents(storeSlug: string, upcoming: boolean = true, limit: number = 10) {
  return useQuery({
    queryKey: ["events", "store", storeSlug, upcoming, limit],
    queryFn: () => api.public.getStoreEvents(storeSlug, upcoming, limit),
    enabled: !!storeSlug,
  });
}
