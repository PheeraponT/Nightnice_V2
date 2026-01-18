"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useProvinces() {
  return useQuery({
    queryKey: ["provinces"],
    queryFn: () => api.public.getProvinces(),
  });
}

export function useProvincesGrouped() {
  return useQuery({
    queryKey: ["provinces", "grouped"],
    queryFn: () => api.public.getProvincesGrouped(),
  });
}

export function useProvince(slug: string) {
  return useQuery({
    queryKey: ["province", slug],
    queryFn: () => api.public.getProvinceBySlug(slug),
    enabled: !!slug,
  });
}

// T074: Province detail for SEO landing page
export function useProvinceDetail(slug: string) {
  return useQuery({
    queryKey: ["province", slug, "detail"],
    queryFn: () => api.public.getProvinceDetail(slug),
    enabled: !!slug,
  });
}

// T073: Regions list
export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: () => api.public.getRegions(),
  });
}
