"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import type { AdminStoreListDto } from "@/lib/api";

interface StoreTableProps {
  stores: AdminStoreListDto[];
  onDelete?: (id: string) => void;
  isDeleting?: string | null;
}

// T122: Store table for admin list page
export function StoreTable({ stores, onDelete, isDeleting }: StoreTableProps) {
  if (stores.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        ไม่พบร้านค้า
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-muted/20">
            <th className="text-left py-3 px-4 text-sm font-medium text-muted">ชื่อร้าน</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted">จังหวัด</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-muted">ประเภท</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-muted">สถานะ</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-muted">แนะนำ</th>
            <th className="text-center py-3 px-4 text-sm font-medium text-muted">รูปภาพ</th>
            <th className="text-right py-3 px-4 text-sm font-medium text-muted">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => (
            <tr
              key={store.id}
              className="border-b border-muted/10 hover:bg-muted/5 transition-colors"
            >
              <td className="py-3 px-4">
                <div>
                  <div className="font-medium text-surface-light">{store.name}</div>
                  <div className="text-xs text-muted">/{store.slug}</div>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-muted">
                {store.provinceName}
              </td>
              <td className="py-3 px-4">
                <div className="flex flex-wrap gap-1">
                  {store.categoryNames.slice(0, 2).map((cat, i) => (
                    <Badge key={i} variant="default" size="sm">
                      {cat}
                    </Badge>
                  ))}
                  {store.categoryNames.length > 2 && (
                    <Badge variant="default" size="sm">
                      +{store.categoryNames.length - 2}
                    </Badge>
                  )}
                </div>
              </td>
              <td className="py-3 px-4 text-center">
                {store.isActive ? (
                  <Badge variant="primary" size="sm">เปิด</Badge>
                ) : (
                  <Badge variant="default" size="sm">ปิด</Badge>
                )}
              </td>
              <td className="py-3 px-4 text-center">
                {store.isFeatured && (
                  <Badge variant="accent" size="sm">แนะนำ</Badge>
                )}
              </td>
              <td className="py-3 px-4 text-center text-sm text-muted">
                {store.imageCount}
              </td>
              <td className="py-3 px-4">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/store/${store.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 text-xs text-muted hover:text-surface-light transition-colors"
                  >
                    ดู
                  </Link>
                  <Link
                    href={`/admin/stores/${store.id}/edit`}
                    className="px-3 py-1.5 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
                  >
                    แก้ไข
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(store.id)}
                      disabled={isDeleting === store.id}
                      className="px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10 rounded transition-colors disabled:opacity-50"
                    >
                      {isDeleting === store.id ? "กำลังลบ..." : "ลบ"}
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
