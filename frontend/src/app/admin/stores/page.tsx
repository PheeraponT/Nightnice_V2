"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { StoreTable } from "@/components/admin/stores/StoreTable";
import { Pagination } from "@/components/ui/Pagination";

// T125: Admin stores list page
export default function AdminStoresPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = getToken();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-stores", page, search],
    queryFn: () =>
      api.admin.getStores(token!, {
        page,
        pageSize: 20,
        query: search || undefined,
      }),
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteStore(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
    },
  });

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("คุณต้องการลบร้านนี้หรือไม่?")) return;

      setDeletingId(id);
      try {
        await deleteMutation.mutateAsync(id);
      } finally {
        setDeletingId(null);
      }
    },
    [deleteMutation]
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-light">จัดการร้าน</h1>
          <p className="text-muted mt-1">
            {data?.totalCount || 0} ร้านในระบบ
          </p>
        </div>
        <Link
          href="/admin/stores/new"
          className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          + เพิ่มร้านใหม่
        </Link>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="ค้นหาชื่อร้าน..."
          className="flex-1 max-w-md px-4 py-2.5 bg-darker border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </div>

      {/* Table */}
      <div className="bg-darker rounded-xl border border-muted/20">
        {isLoading ? (
          <div className="text-center py-12 text-muted">กำลังโหลด...</div>
        ) : (
          <StoreTable
            stores={data?.items || []}
            onDelete={handleDelete}
            isDeleting={deletingId}
          />
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <Pagination
          currentPage={page}
          totalPages={data.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
