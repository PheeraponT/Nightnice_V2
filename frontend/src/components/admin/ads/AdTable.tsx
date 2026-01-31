"use client";

import type { AdminAdListDto } from "@/lib/api";

interface AdTableProps {
  ads: AdminAdListDto[];
  onEdit: (ad: AdminAdListDto) => void;
  onDelete: (ad: AdminAdListDto) => void;
  onViewMetrics: (ad: AdminAdListDto) => void;
}

const adTypeLabels: Record<string, string> = {
  banner: "แบนเนอร์",
  sponsored: "Sponsored",
  featured: "Featured",
};

// T147: Ad table component
export function AdTable({ ads, onEdit, onDelete, onViewMetrics }: AdTableProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date();
  };

  const getStatusBadge = (ad: AdminAdListDto) => {
    if (!ad.isActive) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-gray-500/20 text-gray-400">
          ปิดใช้งาน
        </span>
      );
    }
    if (isExpired(ad.endDate)) {
      return (
        <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400">
          หมดอายุ
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400">
        แสดงอยู่
      </span>
    );
  };

  const getCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return "0.00%";
    return ((clicks / impressions) * 100).toFixed(2) + "%";
  };

  return (
    <div className="bg-darker rounded-xl border border-muted/20 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-muted/20 bg-dark/50">
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">โฆษณา</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">ประเภท</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">ช่วงเวลา</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">สถานะ</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Impressions</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">Clicks</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-muted">CTR</th>
              <th className="px-4 py-3 text-right text-sm font-medium text-muted">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-muted/10">
            {ads.map((ad) => (
              <tr key={ad.id} className="hover:bg-dark/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {ad.imageUrl ? (
                      <img
                        src={ad.imageUrl}
                        alt={ad.title || "Ad"}
                        className="w-16 h-10 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-10 bg-dark rounded flex items-center justify-center text-muted text-xs">
                        No Image
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-surface-light">
                        {ad.title || ad.storeName || "โฆษณา"}
                      </p>
                      {ad.storeName && ad.title && (
                        <p className="text-xs text-muted">{ad.storeName}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-surface-light">
                  {adTypeLabels[ad.adType] || ad.adType}
                </td>
                <td className="px-4 py-3 text-sm text-muted">
                  <div>{formatDate(ad.startDate)}</div>
                  <div>ถึง {formatDate(ad.endDate)}</div>
                </td>
                <td className="px-4 py-3">{getStatusBadge(ad)}</td>
                <td className="px-4 py-3 text-sm text-surface-light">
                  {(ad.impressions ?? 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-surface-light">
                  {(ad.clicks ?? 0).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-surface-light">
                  {getCTR(ad.impressions ?? 0, ad.clicks ?? 0)}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => onViewMetrics(ad)}
                    className="text-accent hover:text-accent/80 text-sm font-medium"
                  >
                    สถิติ
                  </button>
                  <button
                    onClick={() => onEdit(ad)}
                    className="text-primary hover:text-primary/80 text-sm font-medium"
                  >
                    แก้ไข
                  </button>
                  <button
                    onClick={() => onDelete(ad)}
                    className="text-red-400 hover:text-red-300 text-sm font-medium"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
            {ads.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-muted">
                  ยังไม่มีโฆษณา
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
