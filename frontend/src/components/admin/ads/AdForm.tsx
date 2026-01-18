"use client";

import { useState, type FormEvent } from "react";
import type {
  AdminAdDto,
  AdCreateDto,
  AdUpdateDto,
  AdminProvinceDto,
  AdminCategoryDto,
} from "@/lib/api";

interface AdFormProps {
  ad?: AdminAdDto;
  provinces: AdminProvinceDto[];
  categories: AdminCategoryDto[];
  onSubmit: (data: AdCreateDto | AdUpdateDto) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const adTypes = [
  { value: "banner", label: "แบนเนอร์" },
  { value: "sponsored", label: "Sponsored" },
  { value: "featured", label: "Featured" },
];

// T148: Ad form component for create/edit
export function AdForm({
  ad,
  provinces,
  categories,
  onSubmit,
  onCancel,
  isSubmitting,
}: AdFormProps) {
  const isEdit = !!ad;

  const formatDateForInput = (dateStr?: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    adType: ad?.adType || "banner",
    title: ad?.title || "",
    imageUrl: ad?.imageUrl || "",
    targetUrl: ad?.targetUrl || "",
    startDate: formatDateForInput(ad?.startDate) || "",
    endDate: formatDateForInput(ad?.endDate) || "",
    isActive: ad?.isActive ?? true,
    priority: ad?.priority?.toString() || "0",
    targetProvinces: ad?.targetProvinces || [],
    targetCategories: ad?.targetCategories || [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.adType) {
      newErrors.adType = "กรุณาเลือกประเภทโฆษณา";
    }
    if (!formData.startDate) {
      newErrors.startDate = "กรุณาระบุวันเริ่มต้น";
    }
    if (!formData.endDate) {
      newErrors.endDate = "กรุณาระบุวันสิ้นสุด";
    }
    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "วันสิ้นสุดต้องมากกว่าหรือเท่ากับวันเริ่มต้น";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      adType: formData.adType,
      title: formData.title.trim() || undefined,
      imageUrl: formData.imageUrl.trim() || undefined,
      targetUrl: formData.targetUrl.trim() || undefined,
      startDate: formData.startDate,
      endDate: formData.endDate,
      isActive: formData.isActive,
      priority: parseInt(formData.priority) || 0,
      targetProvinces: formData.targetProvinces.length > 0 ? formData.targetProvinces : undefined,
      targetCategories: formData.targetCategories.length > 0 ? formData.targetCategories : undefined,
    };

    await onSubmit(data);
  };

  const toggleProvince = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      targetProvinces: prev.targetProvinces.includes(id)
        ? prev.targetProvinces.filter((p) => p !== id)
        : [...prev.targetProvinces, id],
    }));
  };

  const toggleCategory = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      targetCategories: prev.targetCategories.includes(id)
        ? prev.targetCategories.filter((c) => c !== id)
        : [...prev.targetCategories, id],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-darker rounded-xl border border-muted/20 w-full max-w-2xl my-4">
        <div className="p-6 border-b border-muted/20">
          <h2 className="text-lg font-semibold text-surface-light">
            {isEdit ? "แก้ไขโฆษณา" : "เพิ่มโฆษณาใหม่"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Ad Type */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              ประเภทโฆษณา <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.adType}
              onChange={(e) => setFormData({ ...formData, adType: e.target.value })}
              className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.adType ? "border-red-500" : "border-muted/30"
              }`}
            >
              {adTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.adType && <p className="text-red-400 text-sm mt-1">{errors.adType}</p>}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              ชื่อโฆษณา
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="เช่น โปรโมชั่นเปิดร้านใหม่"
            />
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              URL รูปภาพ
            </label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://example.com/image.jpg"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="h-20 object-contain rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {/* Target URL */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              URL ปลายทาง
            </label>
            <input
              type="url"
              value={formData.targetUrl}
              onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://example.com/promotion"
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-light mb-1.5">
                วันเริ่มต้น <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.startDate ? "border-red-500" : "border-muted/30"
                }`}
              />
              {errors.startDate && <p className="text-red-400 text-sm mt-1">{errors.startDate}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-light mb-1.5">
                วันสิ้นสุด <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                  errors.endDate ? "border-red-500" : "border-muted/30"
                }`}
              />
              {errors.endDate && <p className="text-red-400 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>

          {/* Priority and Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-light mb-1.5">
                ลำดับความสำคัญ
              </label>
              <input
                type="number"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                min={0}
                className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div className="flex items-center pt-7">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 rounded border-muted/30 bg-dark text-primary focus:ring-primary/50"
                />
                <span className="text-surface-light">เปิดใช้งาน</span>
              </label>
            </div>
          </div>

          {/* Target Provinces */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              จังหวัดเป้าหมาย
            </label>
            <p className="text-xs text-muted mb-2">
              ถ้าไม่เลือก จะแสดงทุกจังหวัด
            </p>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-dark rounded-xl border border-muted/30">
              {provinces.map((province) => (
                <button
                  key={province.id}
                  type="button"
                  onClick={() => toggleProvince(province.id)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    formData.targetProvinces.includes(province.id)
                      ? "bg-primary text-white"
                      : "bg-darker text-muted hover:text-surface-light"
                  }`}
                >
                  {province.name}
                </button>
              ))}
            </div>
          </div>

          {/* Target Categories */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              ประเภทร้านเป้าหมาย
            </label>
            <p className="text-xs text-muted mb-2">
              ถ้าไม่เลือก จะแสดงทุกประเภท
            </p>
            <div className="flex flex-wrap gap-2 p-2 bg-dark rounded-xl border border-muted/30">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className={`px-3 py-1 text-sm rounded-full transition-colors ${
                    formData.targetCategories.includes(category.id)
                      ? "bg-primary text-white"
                      : "bg-darker text-muted hover:text-surface-light"
                  }`}
                >
                  {category.iconEmoji && `${category.iconEmoji} `}
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-muted/20">
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
