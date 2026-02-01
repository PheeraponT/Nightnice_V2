"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { EventTable } from "@/components/admin/events/EventTable";
import { Pagination } from "@/components/ui/Pagination";
import { SearchableSelect } from "@/components/ui/SearchableSelect";

// Event types for filter
const EVENT_TYPES = [
  { value: "", label: "ทุกประเภท" },
  { value: "DjNight", label: "DJ Night" },
  { value: "LiveMusic", label: "ดนตรีสด" },
  { value: "Party", label: "ปาร์ตี้" },
  { value: "SpecialEvent", label: "อีเวนท์พิเศษ" },
  { value: "LadiesNight", label: "Ladies Night" },
  { value: "HappyHour", label: "Happy Hour" },
  { value: "Concert", label: "คอนเสิร์ต" },
  { value: "Promotion", label: "โปรโมชั่น" },
];

export default function AdminEventsPage() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const token = getToken();

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-events", page, search, eventType],
    queryFn: () =>
      api.admin.getEvents(token!, {
        page,
        pageSize: 20,
        query: search || undefined,
        eventType: eventType || undefined,
      }),
    enabled: !!token,
    retry: 1,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteEvent(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("คุณต้องการลบอีเวนท์นี้หรือไม่?")) return;

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
          <h1 className="text-2xl font-bold text-surface-light">จัดการอีเวนท์</h1>
          <p className="text-muted mt-1">
            {data?.totalCount || 0} อีเวนท์ในระบบ
          </p>
        </div>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
        >
          + เพิ่มอีเวนท์ใหม่
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="ค้นหาชื่ออีเวนท์..."
          className="flex-1 max-w-md px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="w-48">
          <SearchableSelect
            placeholder="ทุกประเภท"
            searchPlaceholder="ค้นหาประเภท..."
            options={EVENT_TYPES.filter((t) => t.value !== "")}
            value={eventType}
            onChange={(value) => {
              setEventType(value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          เกิดข้อผิดพลาด: {error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้"}
        </div>
      )}

      {/* Table */}
      <div className="bg-darker rounded-xl border border-muted/20">
        {isLoading ? (
          <div className="text-center py-12 text-muted">กำลังโหลด...</div>
        ) : (
          <EventTable
            events={data?.items || []}
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
