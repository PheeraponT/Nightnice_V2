"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type AdminAdListDto,
  type AdminAdDto,
  type AdCreateDto,
  type AdUpdateDto,
  type AdMetricsSummaryDto,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { AdTable } from "@/components/admin/ads/AdTable";
import { AdForm } from "@/components/admin/ads/AdForm";
import { AdMetricsChart } from "@/components/admin/ads/AdMetricsChart";

// T144: Admin ads page
export default function AdminAdsPage() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<AdminAdDto | null>(null);
  const [deletingAd, setDeletingAd] = useState<AdminAdListDto | null>(null);
  const [viewingMetrics, setViewingMetrics] = useState<AdMetricsSummaryDto | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [error, setError] = useState("");

  const token = getToken();

  const { data: ads = [], isLoading } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: () => api.admin.getAds(token!),
    enabled: !!token,
  });

  const { data: provinces = [] } = useQuery({
    queryKey: ["admin-provinces"],
    queryFn: () => api.admin.getProvinces(token!),
    enabled: !!token,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.admin.getCategories(token!),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: AdCreateDto) => api.admin.createAd(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      setShowForm(false);
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการสร้างโฆษณา");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AdUpdateDto }) =>
      api.admin.updateAd(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      setEditingAd(null);
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปเดต");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteAd(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ads"] });
      setDeletingAd(null);
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการลบ");
      setDeletingAd(null);
    },
  });

  const handleCreate = useCallback(() => {
    setError("");
    setShowForm(true);
  }, []);

  const handleEdit = useCallback(async (ad: AdminAdListDto) => {
    setError("");
    // Fetch full ad details for editing
    try {
      const fullAd = await api.admin.getAd(token!, ad.id);
      setEditingAd(fullAd);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลโฆษณาได้");
    }
  }, [token]);

  const handleDelete = useCallback((ad: AdminAdListDto) => {
    setError("");
    setDeletingAd(ad);
  }, []);

  const handleViewMetrics = useCallback(async (ad: AdminAdListDto) => {
    setError("");
    setLoadingMetrics(true);
    try {
      const metrics = await api.admin.getAdMetrics(token!, ad.id);
      setViewingMetrics(metrics);
    } catch (err) {
      setError("ไม่สามารถโหลดข้อมูลสถิติได้");
    } finally {
      setLoadingMetrics(false);
    }
  }, [token]);

  const handleSubmitCreate = useCallback(
    async (data: AdCreateDto | AdUpdateDto) => {
      setError("");
      await createMutation.mutateAsync(data as AdCreateDto);
    },
    [createMutation]
  );

  const handleSubmitEdit = useCallback(
    async (data: AdCreateDto | AdUpdateDto) => {
      if (!editingAd) return;
      setError("");
      await updateMutation.mutateAsync({ id: editingAd.id, data: data as AdUpdateDto });
    },
    [editingAd, updateMutation]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingAd) return;
    await deleteMutation.mutateAsync(deletingAd.id);
  }, [deletingAd, deleteMutation]);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingAd(null);
    setDeletingAd(null);
    setViewingMetrics(null);
    setError("");
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-12 text-muted">กำลังโหลด...</div>
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
            <h1 className="text-2xl font-bold text-surface-light">จัดการโฆษณา</h1>
            <p className="text-muted mt-1">เพิ่ม แก้ไข หรือลบโฆษณา</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          + เพิ่มโฆษณาใหม่
        </button>
      </div>

      {/* Loading Metrics Indicator */}
      {loadingMetrics && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-darker rounded-xl p-6 text-surface-light">
            กำลังโหลดข้อมูลสถิติ...
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Ad Table */}
      <AdTable
        ads={ads}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewMetrics={handleViewMetrics}
      />

      {/* Create Form Modal */}
      {showForm && (
        <AdForm
          provinces={provinces}
          categories={categories}
          onSubmit={handleSubmitCreate}
          onCancel={handleCancel}
          isSubmitting={createMutation.isPending}
        />
      )}

      {/* Edit Form Modal */}
      {editingAd && (
        <AdForm
          ad={editingAd}
          provinces={provinces}
          categories={categories}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancel}
          isSubmitting={updateMutation.isPending}
        />
      )}

      {/* Metrics Modal */}
      {viewingMetrics && (
        <AdMetricsChart metrics={viewingMetrics} onClose={handleCancel} />
      )}

      {/* Delete Confirmation Modal */}
      {deletingAd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-darker rounded-xl border border-muted/20 w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-surface-light mb-4">ยืนยันการลบ</h2>
            <p className="text-muted mb-6">
              คุณต้องการลบโฆษณา &quot;{deletingAd.title || deletingAd.storeName || "โฆษณา"}&quot; หรือไม่?
              <br />
              <span className="text-red-400 text-sm">
                ข้อมูลสถิติทั้งหมดจะถูกลบไปด้วย
              </span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-muted hover:text-surface-light transition-colors disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleteMutation.isPending}
                className="px-6 py-2 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteMutation.isPending ? "กำลังลบ..." : "ลบ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
