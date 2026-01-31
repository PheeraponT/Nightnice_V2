"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type StoreUpdateDto } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { StoreForm } from "@/components/admin/stores/StoreForm";

// T127: Admin store edit page
export default function AdminStoreEditPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [error, setError] = useState("");

  const token = getToken();

  // Fetch store data
  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: ["admin-store", id],
    queryFn: () => api.admin.getStore(token!, id),
    enabled: !!token,
  });

  // Fetch provinces and categories for form
  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces"],
    queryFn: api.public.getProvinces,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: api.public.getCategories,
  });

  const updateMutation = useMutation({
    mutationFn: (data: StoreUpdateDto) => api.admin.updateStore(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      queryClient.invalidateQueries({ queryKey: ["admin-store", id] });
      router.push("/admin/stores");
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปเดตร้าน");
    },
  });

  const handleSubmit = useCallback(
    async (data: StoreUpdateDto) => {
      setError("");
      await updateMutation.mutateAsync(data);
    },
    [updateMutation]
  );

  if (isLoadingStore) {
    return (
      <div className="text-center py-12 text-muted">กำลังโหลด...</div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">ไม่พบร้านค้า</p>
        <Link href="/admin/stores" className="text-primary hover:underline">
          กลับไปหน้ารายการร้าน
        </Link>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-surface-light">แก้ไขร้าน</h1>
          <p className="text-muted mt-1">{store.name}</p>
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
        initialData={store}
        provinces={provinces}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="บันทึกการเปลี่ยนแปลง"
      />
    </div>
  );
}
