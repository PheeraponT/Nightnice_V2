"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, type StoreCreateDto, type StoreUpdateDto } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { StoreForm } from "@/components/admin/stores/StoreForm";

// T126: Admin store create page
export default function AdminStoreCreatePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [error, setError] = useState("");

  const token = getToken();

  // Fetch provinces and categories for form
  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces"],
    queryFn: api.public.getProvinces,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: api.public.getCategories,
  });

  const createMutation = useMutation({
    mutationFn: (data: StoreCreateDto) => api.admin.createStore(token!, data),
    onSuccess: () => {
      router.push("/admin/stores");
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการสร้างร้าน");
    },
  });

  const handleSubmit = useCallback(
    async (data: StoreCreateDto | StoreUpdateDto) => {
      setError("");
      await createMutation.mutateAsync(data as StoreCreateDto);
    },
    [createMutation]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/stores"
          className="text-muted hover:text-surface-light transition-colors"
        >
          ← กลับ
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-light">เพิ่มร้านใหม่</h1>
          <p className="text-muted mt-1">กรอกข้อมูลร้านค้าใหม่</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <StoreForm
        provinces={provinces}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel="สร้างร้าน"
      />
    </div>
  );
}
