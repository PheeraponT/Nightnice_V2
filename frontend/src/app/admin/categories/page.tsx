"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  api,
  type AdminCategoryDto,
  type CategoryCreateDto,
  type CategoryUpdateDto,
} from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";

// T137: Admin categories page
export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategoryDto | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<AdminCategoryDto | null>(null);
  const [error, setError] = useState("");

  const token = getToken();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => api.admin.getCategories(token!),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: CategoryCreateDto) => api.admin.createCategory(token!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setShowForm(false);
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการสร้างประเภท");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: CategoryUpdateDto }) =>
      api.admin.updateCategory(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setEditingCategory(null);
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปเดต");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteCategory(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeletingCategory(null);
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการลบ");
      setDeletingCategory(null);
    },
  });

  const handleCreate = useCallback(() => {
    setError("");
    setShowForm(true);
  }, []);

  const handleEdit = useCallback((category: AdminCategoryDto) => {
    setError("");
    setEditingCategory(category);
  }, []);

  const handleDelete = useCallback((category: AdminCategoryDto) => {
    setError("");
    setDeletingCategory(category);
  }, []);

  const handleSubmitCreate = useCallback(
    async (data: CategoryCreateDto | CategoryUpdateDto) => {
      setError("");
      await createMutation.mutateAsync(data as CategoryCreateDto);
    },
    [createMutation]
  );

  const handleSubmitEdit = useCallback(
    async (data: CategoryCreateDto | CategoryUpdateDto) => {
      if (!editingCategory) return;
      setError("");
      await updateMutation.mutateAsync({ id: editingCategory.id, data: data as CategoryUpdateDto });
    },
    [editingCategory, updateMutation]
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingCategory) return;
    await deleteMutation.mutateAsync(deletingCategory.id);
  }, [deletingCategory, deleteMutation]);

  const handleCancel = useCallback(() => {
    setShowForm(false);
    setEditingCategory(null);
    setDeletingCategory(null);
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
            <h1 className="text-2xl font-bold text-surface-light">จัดการประเภทร้าน</h1>
            <p className="text-muted mt-1">เพิ่ม แก้ไข หรือลบประเภทร้าน</p>
          </div>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          + เพิ่มประเภทใหม่
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Category Table */}
      <CategoryTable
        categories={categories}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Create Form Modal */}
      {showForm && (
        <CategoryForm
          onSubmit={handleSubmitCreate}
          onCancel={handleCancel}
          isSubmitting={createMutation.isPending}
        />
      )}

      {/* Edit Form Modal */}
      {editingCategory && (
        <CategoryForm
          category={editingCategory}
          onSubmit={handleSubmitEdit}
          onCancel={handleCancel}
          isSubmitting={updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-darker rounded-xl border border-muted/20 w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-surface-light mb-4">ยืนยันการลบ</h2>
            <p className="text-muted mb-6">
              คุณต้องการลบประเภท &quot;{deletingCategory.name}&quot; หรือไม่?
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
