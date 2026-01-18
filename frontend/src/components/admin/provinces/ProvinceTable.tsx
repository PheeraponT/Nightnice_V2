"use client";

import { useState } from "react";
import type { AdminProvinceDto } from "@/lib/api";

interface ProvinceTableProps {
  provinces: AdminProvinceDto[];
  onEdit: (province: AdminProvinceDto) => void;
}

// T132: Province table component
export function ProvinceTable({ provinces, onEdit }: ProvinceTableProps) {
  const [regionFilter, setRegionFilter] = useState<string>("");

  // Get unique regions
  const regions = [...new Set(provinces.map((p) => p.regionName))];

  // Filter provinces by region
  const filteredProvinces = regionFilter
    ? provinces.filter((p) => p.regionName === regionFilter)
    : provinces;

  return (
    <div className="space-y-4">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-4 py-2 bg-dark border border-muted/30 rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="">ทุกภูมิภาค</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
        <span className="text-muted text-sm">{filteredProvinces.length} จังหวัด</span>
      </div>

      {/* Table */}
      <div className="bg-darker rounded-xl border border-muted/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-muted/20 bg-dark/50">
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">ลำดับ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">จังหวัด</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">ภูมิภาค</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">จำนวนร้าน</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-muted">SEO Description</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-muted">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-muted/10">
              {filteredProvinces.map((province) => (
                <tr key={province.id} className="hover:bg-dark/30 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted">{province.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-surface-light">{province.name}</div>
                    <div className="text-sm text-muted">{province.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-light">{province.regionName}</td>
                  <td className="px-4 py-3 text-sm text-surface-light">{province.storeCount}</td>
                  <td className="px-4 py-3 text-sm text-muted max-w-xs truncate">
                    {province.seoDescription || "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => onEdit(province)}
                      className="text-primary hover:text-primary/80 text-sm font-medium"
                    >
                      แก้ไข
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
