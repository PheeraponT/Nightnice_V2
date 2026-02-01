"use client";

import { useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type EventUpdateDto } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import { EventForm } from "@/components/admin/events/EventForm";

export default function AdminEventEditPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const { showToast } = useToast();
  const [error, setError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const token = getToken();

  // Fetch event data
  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ["admin-event", id],
    queryFn: () => api.admin.getEvent(token!, id),
    enabled: !!token,
  });

  // Fetch stores for form (all stores, no pagination)
  const { data: stores } = useQuery({
    queryKey: ["admin-stores-dropdown"],
    queryFn: () => api.admin.getStoresForDropdown(token!),
    enabled: !!token,
  });

  const updateMutation = useMutation({
    mutationFn: (data: EventUpdateDto) => api.admin.updateEvent(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-events"] });
      queryClient.invalidateQueries({ queryKey: ["admin-event", id] });
      showToast("อัปเดตอีเวนท์สำเร็จ", "success");
      router.push("/admin/events");
    },
    onError: (err: Error) => {
      const message = err.message || "เกิดข้อผิดพลาดในการอัปเดตอีเวนท์";
      setError(message);
      showToast(message, "error");
    },
  });

  const handleSubmit = useCallback(
    async (data: EventUpdateDto) => {
      setError("");
      await updateMutation.mutateAsync(data);
    },
    [updateMutation]
  );

  const handleImageUpload = useCallback(
    async (file: File) => {
      if (!token) return;
      setIsUploadingImage(true);
      try {
        await api.admin.uploadEventImage(token, id, file);
        queryClient.invalidateQueries({ queryKey: ["admin-event", id] });
        showToast("อัพโหลดรูปภาพสำเร็จ", "success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการอัพโหลดรูป";
        setError(message);
        showToast(message, "error");
      } finally {
        setIsUploadingImage(false);
      }
    },
    [token, id, queryClient, showToast]
  );

  if (isLoadingEvent) {
    return (
      <div className="text-center py-12 text-muted">กำลังโหลด...</div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">ไม่พบอีเวนท์</p>
        <Link href="/admin/events" className="text-primary hover:underline">
          กลับไปหน้ารายการอีเวนท์
        </Link>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-surface-light">แก้ไขอีเวนท์</h1>
          <p className="text-muted mt-1">{event.title}</p>
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
        initialData={event}
        stores={stores || []}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="บันทึกการเปลี่ยนแปลง"
        onImageUpload={handleImageUpload}
        isUploadingImage={isUploadingImage}
      />
    </div>
  );
}
