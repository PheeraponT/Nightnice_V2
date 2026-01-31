"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type AdminContactDto } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { ContactTable } from "@/components/admin/contacts/ContactTable";
import { ContactDetailModal } from "@/components/admin/contacts/ContactDetailModal";

// T151: Admin contacts page
export default function AdminContactsPage() {
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [viewingContact, setViewingContact] = useState<AdminContactDto | null>(null);
  const [deletingContact, setDeletingContact] = useState<AdminContactDto | null>(null);
  const [error, setError] = useState("");

  const token = getToken();

  const { data: contacts = [], isLoading, error: fetchError } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: () => api.admin.getContacts(token!),
    enabled: !!token,
    retry: 1,
  });

  const { data: unreadCount } = useQuery({
    queryKey: ["admin-contacts-unread"],
    queryFn: () => api.admin.getUnreadContactCount(token!),
    enabled: !!token,
    refetchInterval: 30000, // Refresh every 30 seconds
    retry: 1,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.admin.markContactAsRead(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-contacts-unread"] });
      if (viewingContact) {
        setViewingContact({ ...viewingContact, isRead: true });
      }
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาด");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.admin.deleteContact(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-contacts"] });
      queryClient.invalidateQueries({ queryKey: ["admin-contacts-unread"] });
      setDeletingContact(null);
      setViewingContact(null);
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการลบ");
      setDeletingContact(null);
    },
  });

  const handleView = useCallback((contact: AdminContactDto) => {
    setError("");
    setViewingContact(contact);
  }, []);

  const handleMarkAsRead = useCallback((contact: AdminContactDto) => {
    setError("");
    markAsReadMutation.mutate(contact.id);
  }, [markAsReadMutation]);

  const handleDelete = useCallback((contact: AdminContactDto) => {
    setError("");
    setDeletingContact(contact);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deletingContact) return;
    await deleteMutation.mutateAsync(deletingContact.id);
  }, [deletingContact, deleteMutation]);

  const handleCancel = useCallback(() => {
    setViewingContact(null);
    setDeletingContact(null);
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
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-surface-light">ข้อความติดต่อ</h1>
              {unreadCount && unreadCount.count > 0 && (
                <span className="px-2 py-0.5 text-sm rounded-full bg-primary/20 text-primary">
                  {unreadCount.count} ใหม่
                </span>
              )}
            </div>
            <p className="text-muted mt-1">ดูและจัดการข้อความจากผู้ใช้</p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-darker rounded-xl p-4 border border-muted/20">
          <p className="text-muted text-sm">ทั้งหมด</p>
          <p className="text-2xl font-bold text-surface-light mt-1">
            {contacts.length}
          </p>
        </div>
        <div className="bg-darker rounded-xl p-4 border border-muted/20">
          <p className="text-muted text-sm">ยังไม่ได้อ่าน</p>
          <p className="text-2xl font-bold text-primary mt-1">
            {unreadCount?.count || 0}
          </p>
        </div>
        <div className="bg-darker rounded-xl p-4 border border-muted/20">
          <p className="text-muted text-sm">อ่านแล้ว</p>
          <p className="text-2xl font-bold text-surface-light mt-1">
            {contacts.length - (unreadCount?.count || 0)}
          </p>
        </div>
      </div>

      {/* Contact Table */}
      <ContactTable
        contacts={contacts}
        onView={handleView}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />

      {/* Contact Detail Modal */}
      {viewingContact && (
        <ContactDetailModal
          contact={viewingContact}
          onClose={handleCancel}
          onMarkAsRead={() => markAsReadMutation.mutate(viewingContact.id)}
          onDelete={() => setDeletingContact(viewingContact)}
          isMarkingRead={markAsReadMutation.isPending}
          isDeleting={deleteMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingContact && !viewingContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-darker rounded-xl border border-muted/20 w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-surface-light mb-4">ยืนยันการลบ</h2>
            <p className="text-muted mb-6">
              คุณต้องการลบข้อความจาก &quot;{deletingContact.name}&quot; หรือไม่?
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
