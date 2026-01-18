"use client";

import type { AdminContactDto } from "@/lib/api";

interface ContactTableProps {
  contacts: AdminContactDto[];
  onView: (contact: AdminContactDto) => void;
  onMarkAsRead: (contact: AdminContactDto) => void;
  onDelete: (contact: AdminContactDto) => void;
}

const inquiryTypeLabels: Record<string, string> = {
  general: "ทั่วไป",
  advertising: "ลงโฆษณา",
  listing: "ลงร้าน",
  feedback: "ข้อเสนอแนะ",
  other: "อื่นๆ",
};

// T150: Contact table component
export function ContactTable({ contacts, onView, onMarkAsRead, onDelete }: ContactTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-darker rounded-xl border border-muted/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-muted/20 bg-dark/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">สถานะ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">ผู้ติดต่อ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">ประเภท</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">ข้อความ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">วันที่</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted/10">
            {contacts.map((contact) => (
              <tr
                key={contact.id}
                className={`hover:bg-dark/30 transition-colors ${
                  !contact.isRead ? "bg-primary/5" : ""
                }`}
              >
                <td className="px-4 py-3">
                  {contact.isRead ? (
                    <span className="text-muted text-sm">อ่านแล้ว</span>
                  ) : (
                    <span className="px-2 py-0.5 text-xs rounded-full bg-primary/20 text-primary">
                      ใหม่
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div>
                    <p className={`font-medium ${!contact.isRead ? "text-surface-light" : "text-muted"}`}>
                      {contact.name}
                    </p>
                    <p className="text-xs text-muted">{contact.email}</p>
                    {contact.phone && (
                      <p className="text-xs text-muted">{contact.phone}</p>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-surface-light">
                  {inquiryTypeLabels[contact.inquiryType] || contact.inquiryType}
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-muted line-clamp-2 max-w-xs">
                    {contact.message}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm text-muted whitespace-nowrap">
                  {formatDate(contact.createdAt)}
                </td>
                <td className="px-4 py-3 text-right space-x-2 whitespace-nowrap">
                  <button
                    onClick={() => onView(contact)}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    ดู
                  </button>
                  {!contact.isRead && (
                    <button
                      onClick={() => onMarkAsRead(contact)}
                      className="text-accent hover:text-accent/80 text-sm font-medium"
                    >
                      อ่านแล้ว
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(contact)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted">
                  ยังไม่มีข้อความติดต่อ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
