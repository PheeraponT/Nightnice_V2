"use client";

import { useState, type FormEvent } from "react";
import type { AdminProvinceDto, ProvinceUpdateDto } from "@/lib/api";

interface ProvinceEditFormProps {
  province: AdminProvinceDto;
  onSubmit: (data: ProvinceUpdateDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// T133: Province edit form component
export function ProvinceEditForm({
  province,
  onSubmit,
  onCancel,
  isSubmitting,
}: ProvinceEditFormProps) {
  const [formData, setFormData] = useState({
    seoDescription: province.seoDescription || "",
    sortOrder: province.sortOrder.toString(),
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const data: ProvinceUpdateDto = {
      seoDescription: formData.seoDescription.trim() || undefined,
      sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : undefined,
    };

    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-darker rounded-xl border border-muted/20 w-full max-w-lg">
        <div className="p-6 border-b border-muted/20">
          <h2 className="text-lg font-semibold text-surface-light">แก้ไขจังหวัด</h2>
          <p className="text-muted text-sm mt-1">{province.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Province info (read-only) */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-dark/50 rounded-xl">
            <div>
              <span className="text-muted text-sm">Slug</span>
              <p className="text-surface-light">{province.slug}</p>
            </div>
            <div>
              <span className="text-muted text-sm">ภูมิภาค</span>
              <p className="text-surface-light">{province.regionName}</p>
            </div>
          </div>

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              ลำดับการแสดงผล
            </label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
              min={0}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* SEO Description */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              SEO Description
            </label>
            <textarea
              value={formData.seoDescription}
              onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="คำอธิบายสำหรับ SEO (meta description)"
            />
            <p className="text-muted text-xs mt-1">
              แนะนำ 150-160 ตัวอักษร | ปัจจุบัน: {formData.seoDescription.length} ตัวอักษร
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-muted hover:text-surface-light transition-colors disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
