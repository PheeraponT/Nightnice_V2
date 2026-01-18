"use client";

import { useState, type FormEvent } from "react";
import type { AdminCategoryDto, CategoryCreateDto, CategoryUpdateDto } from "@/lib/api";

interface CategoryFormProps {
  category?: AdminCategoryDto;
  onSubmit: (data: CategoryCreateDto | CategoryUpdateDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

// T135: Category form component for create/edit
export function CategoryForm({
  category,
  onSubmit,
  onCancel,
  isSubmitting,
}: CategoryFormProps) {
  const isEdit = !!category;
  const [formData, setFormData] = useState({
    name: category?.name || "",
    iconEmoji: category?.iconEmoji || "",
    sortOrder: category?.sortOrder?.toString() || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อประเภทร้าน";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      name: formData.name.trim(),
      iconEmoji: formData.iconEmoji.trim() || undefined,
      sortOrder: formData.sortOrder ? parseInt(formData.sortOrder) : undefined,
    };

    await onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-darker rounded-xl border border-muted/20 w-full max-w-md">
        <div className="p-6 border-b border-muted/20">
          <h2 className="text-lg font-semibold text-surface-light">
            {isEdit ? "แก้ไขประเภทร้าน" : "เพิ่มประเภทร้านใหม่"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              ชื่อประเภท <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.name ? "border-red-500" : "border-muted/30"
              }`}
              placeholder="เช่น ร้านเหล้า, บาร์, ผับ"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Icon Emoji */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              ไอคอน (Emoji)
            </label>
            <input
              type="text"
              value={formData.iconEmoji}
              onChange={(e) => setFormData({ ...formData, iconEmoji: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="เช่น 🍺, 🍸, 🎵"
              maxLength={10}
            />
            <p className="text-muted text-xs mt-1">
              ใส่ emoji เพื่อแสดงเป็นไอคอนของประเภท
            </p>
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
              placeholder="ถ้าไม่ระบุจะใช้ลำดับถัดไป"
            />
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
              {isSubmitting ? "กำลังบันทึก..." : isEdit ? "บันทึก" : "สร้าง"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
