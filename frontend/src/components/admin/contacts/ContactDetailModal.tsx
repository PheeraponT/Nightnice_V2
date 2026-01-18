"use client";

import type { AdminContactDto } from "@/lib/api";

interface ContactDetailModalProps {
  contact: AdminContactDto;
  onClose: () => void;
  onMarkAsRead: () => void;
  onDelete: () => void;
  isMarkingRead: boolean;
  isDeleting: boolean;
}

const inquiryTypeLabels: Record<string, string> = {
  general: "ทั่วไป",
  advertising: "ลงโฆษณา",
  listing: "ลงร้าน",
  feedback: "ข้อเสนอแนะ",
  other: "อื่นๆ",
};

// T150: Contact detail modal component
export function ContactDetailModal({
  contact,
  onClose,
  onMarkAsRead,
  onDelete,
  isMarkingRead,
  isDeleting,
}: ContactDetailModalProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-darker rounded-xl border border-muted/20 w-full max-w-lg">
        <div className="p-6 border-b border-muted/20 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-surface-light">รายละเอียดข้อความ</h2>
            {!contact.isRead && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary mt-1 inline-block">
                ยังไม่ได้อ่าน
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted hover:text-surface-light transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted mb-1">ชื่อ</p>
              <p className="text-surface-light font-medium">{contact.name}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">ประเภท</p>
              <p className="text-surface-light">
                {inquiryTypeLabels[contact.inquiryType] || contact.inquiryType}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted mb-1">อีเมล</p>
              <a
                href={`mailto:${contact.email}`}
                className="text-primary hover:underline"
              >
                {contact.email}
              </a>
            </div>
            {contact.phone && (
              <div>
                <p className="text-xs text-muted mb-1">โทรศัพท์</p>
                <a
                  href={`tel:${contact.phone}`}
                  className="text-primary hover:underline"
                >
                  {contact.phone}
                </a>
              </div>
            )}
          </div>

          {contact.storeName && (
            <div>
              <p className="text-xs text-muted mb-1">ชื่อร้าน</p>
              <p className="text-surface-light">{contact.storeName}</p>
            </div>
          )}

          {contact.packageInterest && (
            <div>
              <p className="text-xs text-muted mb-1">แพ็คเกจที่สนใจ</p>
              <p className="text-surface-light">{contact.packageInterest}</p>
            </div>
          )}

          {/* Message */}
          <div>
            <p className="text-xs text-muted mb-1">ข้อความ</p>
            <div className="p-4 bg-dark rounded-xl border border-muted/20">
              <p className="text-surface-light whitespace-pre-wrap">{contact.message}</p>
            </div>
          </div>

          {/* Date */}
          <div>
            <p className="text-xs text-muted mb-1">วันที่ส่ง</p>
            <p className="text-muted text-sm">{formatDate(contact.createdAt)}</p>
          </div>
        </div>

        <div className="p-6 border-t border-muted/20 flex justify-between">
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "กำลังลบ..." : "ลบข้อความ"}
          </button>
          <div className="flex gap-3">
            {!contact.isRead && (
              <button
                onClick={onMarkAsRead}
                disabled={isMarkingRead}
                className="px-4 py-2 bg-accent text-white font-medium rounded-xl hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {isMarkingRead ? "กำลังบันทึก..." : "ทำเครื่องหมายว่าอ่านแล้ว"}
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-dark text-surface-light font-medium rounded-xl hover:bg-dark/80 transition-colors"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
