"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api, type EventCreateDto, type EventUpdateDto } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { EventForm } from "@/components/admin/events/EventForm";

export default function AdminEventCreatePage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState("");

  const token = getToken();

  // Fetch stores for form (all stores, no pagination)
  const { data: stores } = useQuery({
    queryKey: ["admin-stores-dropdown"],
    queryFn: () => api.admin.getStoresForDropdown(token!),
    enabled: !!token,
  });

  const createMutation = useMutation({
    mutationFn: (data: EventCreateDto) => api.admin.createEvent(token!, data),
    onSuccess: () => {
      showToast("สร้างอีเวนท์สำเร็จ", "success");
      router.push("/admin/events");
    },
    onError: (err: Error) => {
      const message = err.message || "เกิดข้อผิดพลาดในการสร้างอีเวนท์";
      setError(message);
      showToast(message, "error");
    },
  });

  const handleSubmit = useCallback(
    async (data: EventCreateDto | EventUpdateDto) => {
      setError("");
      await createMutation.mutateAsync(data as EventCreateDto);
    },
    [createMutation]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/events"
          className="text-muted hover:text-surface-light transition-colors"
        >
          ← กลับ
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-light">เพิ่มอีเวนท์ใหม่</h1>
          <p className="text-muted mt-1">กรอกข้อมูลอีเวนท์ใหม่</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Form */}
      <EventForm
        stores={stores || []}
        onSubmit={handleSubmit}
        isSubmitting={createMutation.isPending}
        submitLabel="สร้างอีเวนท์"
      />
    </div>
  );
}
