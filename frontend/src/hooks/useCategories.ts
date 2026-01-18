"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => api.public.getCategories(),
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: ["category", slug],
    queryFn: () => api.public.getCategoryBySlug(slug),
    enabled: !!slug,
  });
}

// T076: Category detail for SEO landing page
export function useCategoryDetail(slug: string) {
  return useQuery({
    queryKey: ["category", slug, "detail"],
    queryFn: () => api.public.getCategoryDetail(slug),
    enabled: !!slug,
  });
}
