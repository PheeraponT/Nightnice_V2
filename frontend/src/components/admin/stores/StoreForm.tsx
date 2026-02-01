"use client";

import { useState, type FormEvent } from "react";
import { FACILITIES } from "@/lib/constants";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { TimePicker } from "@/components/ui/DateTimePicker";
import type {
  StoreCreateDto,
  StoreUpdateDto,
  AdminStoreDto,
  ProvinceDto,
  CategoryDto,
} from "@/lib/api";

// Price range options
const PRICE_RANGE_OPTIONS = [
  { value: "1", label: "$ - ราคาประหยัด" },
  { value: "2", label: "$$ - ราคาปานกลาง" },
  { value: "3", label: "$$$ - ราคาสูง" },
  { value: "4", label: "$$$$ - พรีเมียม" },
];

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
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          <span className="flex items-center gap-2">
            <InfoIcon className="w-5 h-5 text-primary" />
            ข้อมูลพื้นฐาน
          </span>
        </h2>

        <div className="space-y-5">
          {/* Name */}
          <div>
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

          {/* Province & Price Range Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              label="จังหวัด *"
              placeholder="เลือกจังหวัด"
              searchPlaceholder="ค้นหาจังหวัด..."
              options={provinces.map((p) => ({
                value: p.id,
                label: p.name,
              }))}
              value={formData.provinceId}
              onChange={(value) => setFormData({ ...formData, provinceId: value })}
              error={errors.provinceId}
            />

            <SearchableSelect
              label="ช่วงราคา"
              placeholder="ไม่ระบุ"
              options={PRICE_RANGE_OPTIONS}
              value={formData.priceRange}
              onChange={(value) => setFormData({ ...formData, priceRange: value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              รายละเอียด
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="รายละเอียดเกี่ยวกับร้าน บรรยากาศ จุดเด่น"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          <span className="flex items-center gap-2">
            <CategoryIcon className="w-5 h-5 text-primary" />
            ประเภทร้าน <span className="text-red-400">*</span>
          </span>
        </h2>
        <p className="text-sm text-muted mb-3">เลือกประเภทที่ตรงกับร้านของคุณ (เลือกได้หลายประเภท)</p>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleCategoryToggle(cat.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                formData.categoryIds.includes(cat.id)
                  ? "bg-primary text-white shadow-glow-blue"
                  : "bg-dark border border-muted/30 text-muted hover:border-primary/50 hover:text-surface-light"
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
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          <span className="flex items-center gap-2">
            <ContactIcon className="w-5 h-5 text-primary" />
            ข้อมูลติดต่อ
          </span>
        </h2>

        <div className="space-y-5">
          {/* Phone & LINE Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-light mb-1.5">
                <span className="flex items-center gap-1.5">
                  <PhoneIcon className="w-4 h-4" />
                  เบอร์โทร
                </span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="08X-XXX-XXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-light mb-1.5">
                <span className="flex items-center gap-1.5">
                  <LineIcon className="w-4 h-4" />
                  LINE ID
                </span>
              </label>
              <input
                type="text"
                value={formData.lineId}
                onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="@lineid"
              />
            </div>
          </div>

          {/* Social Media Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-light mb-1.5">
                <span className="flex items-center gap-1.5">
                  <FacebookIcon className="w-4 h-4" />
                  Facebook
                </span>
              </label>
              <input
                type="url"
                value={formData.facebookUrl}
                onChange={(e) => setFormData({ ...formData, facebookUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-light mb-1.5">
                <span className="flex items-center gap-1.5">
                  <InstagramIcon className="w-4 h-4" />
                  Instagram
                </span>
              </label>
              <input
                type="url"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">ที่อยู่</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="ที่อยู่ร้าน เลขที่ ซอย ถนน แขวง เขต"
            />
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          <span className="flex items-center gap-2">
            <MapPinIcon className="w-5 h-5 text-primary" />
            ตำแหน่งที่ตั้ง
          </span>
        </h2>

        <div className="space-y-5">
          {/* Google Maps URL */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" />
                Google Maps URL
              </span>
            </label>
            <input
              type="url"
              value={formData.googleMapUrl}
              onChange={(e) => setFormData({ ...formData, googleMapUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://goo.gl/maps/... หรือ https://maps.app.goo.gl/..."
            />
            <p className="text-xs text-muted mt-1">คัดลอก URL จาก Google Maps แล้ววางที่นี่</p>
          </div>

          {/* Coordinates Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-light mb-1.5">ละติจูด (Latitude)</label>
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
              <label className="block text-sm font-medium text-surface-light mb-1.5">ลองจิจูด (Longitude)</label>
              <input
                type="number"
                step="any"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="100.5018"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Hours */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          <span className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-primary" />
            เวลาเปิด-ปิด
          </span>
        </h2>
        <p className="text-sm text-muted mb-4">กำหนดเวลาเปิดและปิดปกติของร้าน</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TimePicker
            label="เวลาเปิด"
            value={formData.openTime}
            onChange={(value) => setFormData({ ...formData, openTime: value })}
            placeholder="เลือกเวลาเปิด"
          />

          <TimePicker
            label="เวลาปิด"
            value={formData.closeTime}
            onChange={(value) => setFormData({ ...formData, closeTime: value })}
            placeholder="เลือกเวลาปิด"
          />
        </div>
      </div>

      {/* Facilities */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          <span className="flex items-center gap-2">
            <FacilitiesIcon className="w-5 h-5 text-primary" />
            สิ่งอำนวยความสะดวก
          </span>
        </h2>
        <p className="text-sm text-muted mb-3">เลือกสิ่งอำนวยความสะดวกที่ร้านมีให้บริการ</p>
        <div className="flex flex-wrap gap-2">
          {FACILITIES.map((facility) => (
            <button
              key={facility.key}
              type="button"
              onClick={() => handleFacilityToggle(facility.key)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                formData.facilities.includes(facility.key)
                  ? "bg-accent text-white shadow-glow-purple"
                  : "bg-dark border border-muted/30 text-muted hover:border-accent/50 hover:text-surface-light"
              }`}
            >
              {facility.icon} {facility.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          <span className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-primary" />
            สถานะการแสดงผล
          </span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex items-center gap-3 p-4 bg-dark/50 rounded-xl cursor-pointer border border-transparent hover:border-primary/30 transition-colors">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-5 h-5 rounded border-muted/30 bg-dark text-primary focus:ring-primary/50"
            />
            <div>
              <span className="text-surface-light font-medium">เปิดใช้งาน</span>
              <p className="text-xs text-muted">แสดงร้านในหน้าเว็บ</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 bg-dark/50 rounded-xl cursor-pointer border border-transparent hover:border-accent/30 transition-colors">
            <input
              type="checkbox"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-5 h-5 rounded border-muted/30 bg-dark text-accent focus:ring-accent/50"
            />
            <div>
              <span className="text-surface-light font-medium">ร้านแนะนำ</span>
              <p className="text-xs text-muted">แสดงในหน้าแรกและมีป้าย "แนะนำ"</p>
            </div>
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

// Icons
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CategoryIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function ContactIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 5.64 2 10.11c0 3.98 3.46 7.29 8.13 7.95.31.07.75.21.86.48.1.24.07.63.03.88l-.14.85c-.04.25-.19.97.86.53s5.71-3.36 7.79-5.75C21.41 12.9 22 11.55 22 10.11 22 5.64 17.52 2 12 2zm-2 12.5H8v-5c0-.28.22-.5.5-.5s.5.22.5.5v4h1c.28 0 .5.22.5.5s-.22.5-.5.5zm2 0c-.28 0-.5-.22-.5-.5v-5c0-.28.22-.5.5-.5s.5.22.5.5v5c0 .28-.22.5-.5.5zm4.5 0h-2c-.28 0-.5-.22-.5-.5v-5c0-.28.22-.5.5-.5s.5.22.5.5v4h1.5c.28 0 .5.22.5.5s-.22.5-.5.5z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FacilitiesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
