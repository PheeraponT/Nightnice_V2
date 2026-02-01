"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { AdminEventListDto } from "@/lib/api";

// Event type labels in Thai
const EVENT_TYPE_LABELS: Record<string, string> = {
  DjNight: "DJ Night",
  LiveMusic: "ดนตรีสด",
  Party: "ปาร์ตี้",
  SpecialEvent: "อีเวนท์พิเศษ",
  LadiesNight: "Ladies Night",
  HappyHour: "Happy Hour",
  ThemeNight: "Theme Night",
  Concert: "คอนเสิร์ต",
  Promotion: "โปรโมชั่น",
  Other: "อื่นๆ",
};

interface EventTableProps {
  events: AdminEventListDto[];
  onDelete?: (id: string) => void;
  isDeleting?: string | null;
}

export function EventTable({ events, onDelete, isDeleting }: EventTableProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        ไม่พบอีเวนท์
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-muted/20">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted">ชื่ออีเวนท์</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted">ร้าน</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted">ประเภท</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted">วันที่</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-muted">สถานะ</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-muted">แนะนำ</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="border-b border-muted/10 hover:bg-muted/5 transition-colors"
            >
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-surface-light">{event.title}</div>
                  <div className="text-xs text-muted">/{event.slug}</div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-muted">
                {event.storeName}
              </td>
              <td className="py-3 px-4">
                <Badge variant="default" size="sm">
                  {EVENT_TYPE_LABELS[event.eventType] || event.eventType}
                </Badge>
              </td>
              <td className="py-3 px-4 text-sm text-muted">
                <div>{formatDate(event.startDate)}</div>
                {event.endDate && event.endDate !== event.startDate && (
                  <div className="text-xs">ถึง {formatDate(event.endDate)}</div>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                {event.isActive ? (
                  <Badge variant="primary" size="sm">เปิด</Badge>
                ) : (
                  <Badge variant="default" size="sm">ปิด</Badge>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                {event.isFeatured && (
                  <Badge variant="accent" size="sm">แนะนำ</Badge>
                )}
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/events/${event.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 text-xs text-muted hover:text-surface-light transition-colors"
                  >
                    ดู
                  </Link>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                  >
                    แก้ไข
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(event.id)}
                      disabled={isDeleting === event.id}
                      className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                    >
                      {isDeleting === event.id ? "กำลังลบ..." : "ลบ"}
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
