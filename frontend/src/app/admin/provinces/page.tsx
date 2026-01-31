"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AdminProvinceDto, type ProvinceUpdateDto } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ProvinceTable } from "@/components/admin/provinces/ProvinceTable";
import { ProvinceEditForm } from "@/components/admin/provinces/ProvinceEditForm";

// T136: Admin provinces page
export default function AdminProvincesPage() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [editingProvince, setEditingProvince] = useState<AdminProvinceDto | null>(null);
  const [error, setError] = useState("");

  const token = getToken();

  const { data: provinces = [], isLoading, error: fetchError } = useQuery({
    queryKey: ["admin-provinces"],
    queryFn: () => api.admin.getProvinces(token!),
    enabled: !!token,
    retry: 1,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: ProvinceUpdateDto }) =>
      api.admin.updateProvince(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-provinces"] });
      setEditingProvince(null);
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปเดต");
    },
  });

  const handleEdit = useCallback((province: AdminProvinceDto) => {
    setError("");
    setEditingProvince(province);
  }, []);

  const handleSubmit = useCallback(
    async (data: ProvinceUpdateDto) => {
      if (!editingProvince) return;
      setError("");
      await updateMutation.mutateAsync({ id: editingProvince.id, data });
    },
    [editingProvince, updateMutation]
  );

  const handleCancel = useCallback(() => {
    setEditingProvince(null);
    setError("");
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted">กำลังโหลด...</div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
        เกิดข้อผิดพลาด: {fetchError instanceof Error ? fetchError.message : "ไม่สามารถโหลดข้อมูลได้"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="text-muted hover:text-surface-light transition-colors"
          >
            ← กลับ
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-surface-light">จัดการจังหวัด</h1>
            <p className="text-muted mt-1">แก้ไขข้อมูล SEO และลำดับการแสดงผล</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Province Table */}
      <ProvinceTable provinces={provinces} onEdit={handleEdit} />

      {/* Edit Modal */}
      {editingProvince && (
        <ProvinceEditForm
          province={editingProvince}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={updateMutation.isPending}
        />
      )}
    </div>
  );
}
