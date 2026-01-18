"use client";

import { useMutation } from "@tanstack/react-query";
import { api, type ContactInquiryDto } from "@/lib/api";

// T095: Contact form hook with mutation
export function useContactForm() {
  return useMutation({
    mutationFn: (data: ContactInquiryDto) => api.public.submitContactInquiry(data),
  });
}
