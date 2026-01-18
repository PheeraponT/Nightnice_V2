"use client";

import { useState, type FormEvent } from "react";
import { FACILITIES } from "@/lib/constants";
import type {
  StoreCreateDto,
  StoreUpdateDto,
  AdminStoreDto,
  ProvinceDto,
  CategoryDto,
} from "@/lib/api";

interface StoreFormProps {
  initialData?: AdminStoreDto;
  provinces: ProvinceDto[];
  categories: CategoryDto[];
  onSubmit: (data: StoreCreateDto | StoreUpdateDto) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
}

// T123: Store form for create and edit
export function StoreForm({
  initialData,
  provinces,
  categories,
  onSubmit,
  isSubmitting,
  submitLabel = "บันทึก",
}: StoreFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    provinceId: initialData?.provinceId || "",
    categoryIds: initialData?.categories.map((c) => c.id) || [],
    description: initialData?.description || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    latitude: initialData?.latitude?.toString() || "",
    longitude: initialData?.longitude?.toString() || "",
    googleMapUrl: initialData?.googleMapUrl || "",
    lineId: initialData?.lineId || "",
    facebookUrl: initialData?.facebookUrl || "",
    instagramUrl: initialData?.instagramUrl || "",
    priceRange: initialData?.priceRange?.toString() || "",
    openTime: initialData?.openTime || "",
    closeTime: initialData?.closeTime || "",
    facilities: initialData?.facilities || [],
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "กรุณากรอกชื่อร้าน";
    }

    if (!formData.provinceId) {
      newErrors.provinceId = "กรุณาเลือกจังหวัด";
    }

    if (formData.categoryIds.length === 0) {
      newErrors.categoryIds = "กรุณาเลือกประเภทร้านอย่างน้อย 1 ประเภท";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: StoreCreateDto | StoreUpdateDto = {
      name: formData.name.trim(),
      provinceId: formData.provinceId,
      categoryIds: formData.categoryIds,
      description: formData.description.trim() || undefined,
      phone: formData.phone.trim() || undefined,
      address: formData.address.trim() || undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      googleMapUrl: formData.googleMapUrl.trim() || undefined,
      lineId: formData.lineId.trim() || undefined,
      facebookUrl: formData.facebookUrl.trim() || undefined,
      instagramUrl: formData.instagramUrl.trim() || undefined,
      priceRange: formData.priceRange ? parseInt(formData.priceRange) : undefined,
      openTime: formData.openTime || undefined,
      closeTime: formData.closeTime || undefined,
      facilities: formData.facilities.length > 0 ? formData.facilities : undefined,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
    };

    await onSubmit(data);
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData((prev) => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter((f) => f !== facility)
        : [...prev.facilities, facility],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">ข้อมูลพื้นฐาน</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              ชื่อร้าน <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.name ? "border-red-500" : "border-muted/30"
              }`}
              placeholder="ชื่อร้าน"
            />
            {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
          </div>

          {/* Province */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              จังหวัด <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.provinceId}
              onChange={(e) => setFormData({ ...formData, provinceId: e.target.value })}
              className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.provinceId ? "border-red-500" : "border-muted/30"
              }`}
            >
              <option value="">เลือกจังหวัด</option>
              {provinces.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.provinceId && <p className="text-red-400 text-sm mt-1">{errors.provinceId}</p>}
          </div>

          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              ช่วงราคา
            </label>
            <select
              value={formData.priceRange}
              onChange={(e) => setFormData({ ...formData, priceRange: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">ไม่ระบุ</option>
              <option value="1">$ - ราคาประหยัด</option>
              <option value="2">$$ - ราคาปานกลาง</option>
              <option value="3">$$$ - ราคาสูง</option>
              <option value="4">$$$$ - พรีเมียม</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              รายละเอียด
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="รายละเอียดเกี่ยวกับร้าน"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          ประเภทร้าน <span className="text-red-400">*</span>
        </h2>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryToggle(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.categoryIds.includes(cat.id)
                  ? "bg-primary text-white"
                  : "bg-dark border border-muted/30 text-muted hover:border-primary/50"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {errors.categoryIds && <p className="text-red-400 text-sm mt-2">{errors.categoryIds}</p>}
      </div>

      {/* Contact */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">ข้อมูลติดต่อ</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">เบอร์โทร</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="08X-XXX-XXXX"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">LINE ID</label>
            <input
              type="text"
              value={formData.lineId}
              onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="@lineid"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">Facebook</label>
            <input
              type="url"
              value={formData.facebookUrl}
              onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">Instagram</label>
            <input
              type="url"
              value={formData.instagramUrl}
              onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://instagram.com/..."
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-surface-light mb-1.5">ที่อยู่</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="ที่อยู่ร้าน"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">ตำแหน่งที่ตั้ง</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">ละติจูด</label>
            <input
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="13.7563"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">ลองจิจูด</label>
            <input
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="100.5018"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">Google Maps URL</label>
            <input
              type="url"
              value={formData.googleMapUrl}
              onChange={(e) => setFormData({ ...formData, googleMapUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://goo.gl/maps/..."
            />
          </div>
        </div>
      </div>

      {/* Hours */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">เวลาเปิด-ปิด</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">เวลาเปิด</label>
            <input
              type="time"
              value={formData.openTime}
              onChange={(e) => setFormData({ ...formData, openTime: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">เวลาปิด</label>
            <input
              type="time"
              value={formData.closeTime}
              onChange={(e) => setFormData({ ...formData, closeTime: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
        </div>
      </div>

      {/* Facilities */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">สิ่งอำนวยความสะดวก</h2>
        <div className="flex flex-wrap gap-2">
          {FACILITIES.map((facility) => (
            <button
              key={facility.key}
              type="button"
              onClick={() => handleFacilityToggle(facility.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                formData.facilities.includes(facility.key)
                  ? "bg-accent text-white"
                  : "bg-dark border border-muted/30 text-muted hover:border-accent/50"
              }`}
            >
              {facility.icon} {facility.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">สถานะ</h2>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-muted/30 bg-dark text-primary focus:ring-primary/50"
            />
            <span className="text-surface-light">เปิดใช้งาน</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-5 h-5 rounded border-muted/30 bg-dark text-accent focus:ring-accent/50"
            />
            <span className="text-surface-light">ร้านแนะนำ</span>
          </label>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "กำลังบันทึก..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
