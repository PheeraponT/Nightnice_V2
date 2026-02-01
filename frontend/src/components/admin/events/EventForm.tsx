"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { DatePicker, TimePicker } from "@/components/ui/DateTimePicker";
import { resolveImageUrl } from "@/lib/utils";
import type {
  EventCreateDto,
  EventUpdateDto,
  AdminEventDto,
  StoreDropdownDto,
} from "@/lib/api";

// Event types
const EVENT_TYPES = [
  { value: "DjNight", label: "DJ Night" },
  { value: "LiveMusic", label: "ดนตรีสด" },
  { value: "Party", label: "ปาร์ตี้" },
  { value: "SpecialEvent", label: "อีเวนท์พิเศษ" },
  { value: "LadiesNight", label: "Ladies Night" },
  { value: "HappyHour", label: "Happy Hour" },
  { value: "ThemeNight", label: "Theme Night" },
  { value: "Concert", label: "คอนเสิร์ต" },
  { value: "Promotion", label: "โปรโมชั่น" },
  { value: "Other", label: "อื่นๆ" },
];

// Recurrence patterns
const RECURRENCE_PATTERNS = [
  { value: "", label: "ไม่มี (ครั้งเดียว)" },
  { value: "weekly", label: "ทุกสัปดาห์" },
  { value: "biweekly", label: "ทุก 2 สัปดาห์" },
  { value: "monthly", label: "ทุกเดือน" },
];

interface EventFormProps {
  initialData?: AdminEventDto;
  stores: StoreDropdownDto[];
  onSubmit: (data: EventCreateDto | EventUpdateDto) => Promise<void>;
  isSubmitting: boolean;
  submitLabel?: string;
  onImageUpload?: (file: File) => Promise<void>;
  isUploadingImage?: boolean;
}

export function EventForm({
  initialData,
  stores,
  onSubmit,
  isSubmitting,
  submitLabel = "บันทึก",
  onImageUpload,
  isUploadingImage,
}: EventFormProps) {
  const [formData, setFormData] = useState({
    storeId: initialData?.storeId || "",
    title: initialData?.title || "",
    eventType: initialData?.eventType || "DjNight",
    description: initialData?.description || "",
    startDate: initialData?.startDate?.split("T")[0] || "",
    endDate: initialData?.endDate?.split("T")[0] || "",
    startTime: initialData?.startTime || "",
    endTime: initialData?.endTime || "",
    price: initialData?.price?.toString() || "",
    priceMax: initialData?.priceMax?.toString() || "",
    ticketUrl: initialData?.ticketUrl || "",
    isRecurring: initialData?.isRecurring ?? false,
    recurrencePattern: initialData?.recurrencePattern || "",
    isActive: initialData?.isActive ?? true,
    isFeatured: initialData?.isFeatured ?? false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.storeId) {
      newErrors.storeId = "กรุณาเลือกร้าน";
    }

    if (!formData.title.trim()) {
      newErrors.title = "กรุณากรอกชื่ออีเวนท์";
    }

    if (!formData.eventType) {
      newErrors.eventType = "กรุณาเลือกประเภทอีเวนท์";
    }

    if (!formData.startDate) {
      newErrors.startDate = "กรุณาเลือกวันที่เริ่มต้น";
    }

    if (formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = "วันที่สิ้นสุดต้องมากกว่าวันที่เริ่มต้น";
    }

    if (formData.price && formData.priceMax) {
      const price = parseFloat(formData.price);
      const priceMax = parseFloat(formData.priceMax);
      if (price > priceMax) {
        newErrors.priceMax = "ราคาสูงสุดต้องมากกว่าราคาต่ำสุด";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: EventCreateDto | EventUpdateDto = {
      storeId: formData.storeId,
      title: formData.title.trim(),
      eventType: formData.eventType,
      startDate: formData.startDate,
      description: formData.description.trim() || undefined,
      endDate: formData.endDate || undefined,
      startTime: formData.startTime || undefined,
      endTime: formData.endTime || undefined,
      price: formData.price ? parseFloat(formData.price) : undefined,
      priceMax: formData.priceMax ? parseFloat(formData.priceMax) : undefined,
      ticketUrl: formData.ticketUrl.trim() || undefined,
      isRecurring: formData.isRecurring,
      recurrencePattern: formData.isRecurring ? formData.recurrencePattern || undefined : undefined,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
    };

    await onSubmit(data);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      await onImageUpload(file);
    }
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
          {/* Store & Event Type Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SearchableSelect
              label="ร้าน *"
              placeholder="เลือกร้าน"
              searchPlaceholder="ค้นหาชื่อร้าน..."
              options={stores.map((store) => ({
                value: store.id,
                label: store.name,
                description: store.provinceName ?? undefined,
              }))}
              value={formData.storeId}
              onChange={(value) => setFormData({ ...formData, storeId: value })}
              error={errors.storeId}
            />

            <SearchableSelect
              label="ประเภทอีเวนท์ *"
              placeholder="เลือกประเภท"
              searchPlaceholder="ค้นหาประเภท..."
              options={EVENT_TYPES}
              value={formData.eventType}
              onChange={(value) => setFormData({ ...formData, eventType: value })}
              error={errors.eventType}
            />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              ชื่ออีเวนท์ <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2.5 bg-dark border rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                errors.title ? "border-red-500" : "border-muted/30"
              }`}
              placeholder="ชื่ออีเวนท์ เช่น DJ Party Night"
            />
            {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
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
              placeholder="รายละเอียดเกี่ยวกับอีเวนท์ เช่น Line Up, โปรโมชั่น, Dress Code"
            />
          </div>

          {/* Poster Image (only for edit mode) */}
          {initialData && onImageUpload && (
            <div className="pt-5 border-t border-muted/10">
              <label className="block text-sm font-medium text-surface-light mb-3">
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  รูปภาพโปสเตอร์
                </span>
              </label>
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Current Image Preview */}
                {initialData.imageUrl ? (
                  <div className="relative aspect-[3/4] w-32 flex-shrink-0 rounded-lg overflow-hidden border border-muted/20">
                    <Image
                      src={resolveImageUrl(initialData.imageUrl) || ""}
                      alt={initialData.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-[3/4] w-32 flex-shrink-0 rounded-lg bg-dark border-2 border-dashed border-muted/30 flex flex-col items-center justify-center text-muted">
                    <ImageIcon className="w-8 h-8 opacity-50" />
                  </div>
                )}

                {/* Upload */}
                <div className="flex-1 space-y-2">
                  <div className="p-4 rounded-lg border-2 border-dashed border-muted/30 hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={isUploadingImage}
                      className="w-full text-sm text-muted file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/20 file:text-primary hover:file:bg-primary/30 file:cursor-pointer disabled:opacity-50 file:transition-colors"
                    />
                  </div>
                  <p className="text-xs text-muted">JPG, PNG, WebP ไม่เกิน 5MB • แนะนำ 1080x1350 px</p>
                  {isUploadingImage && (
                    <div className="flex items-center gap-2 text-primary">
                      <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm">กำลังอัพโหลด...</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Date & Time */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          <span className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            วันที่และเวลา
          </span>
        </h2>

        {/* Date Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <DatePicker
            label="วันที่เริ่มต้น *"
            value={formData.startDate}
            onChange={(value) => setFormData({ ...formData, startDate: value })}
            placeholder="เลือกวันที่เริ่มต้น"
            error={errors.startDate}
          />

          <DatePicker
            label="วันที่สิ้นสุด"
            value={formData.endDate}
            onChange={(value) => setFormData({ ...formData, endDate: value })}
            placeholder="เลือกวันที่สิ้นสุด (ถ้ามี)"
            minDate={formData.startDate}
            error={errors.endDate}
          />
        </div>

        {/* Time Section */}
        <div className="pt-4 border-t border-muted/10">
          <p className="text-sm text-muted mb-3 flex items-center gap-2">
            <ClockIcon className="w-4 h-4" />
            เวลาจัดงาน
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TimePicker
              label="เวลาเริ่ม"
              value={formData.startTime}
              onChange={(value) => setFormData({ ...formData, startTime: value })}
              placeholder="เลือกเวลาเริ่ม"
            />

            <TimePicker
              label="เวลาสิ้นสุด"
              value={formData.endTime}
              onChange={(value) => setFormData({ ...formData, endTime: value })}
              placeholder="เลือกเวลาสิ้นสุด"
            />
          </div>
        </div>
      </div>

      {/* Pricing & Ticket */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          <span className="flex items-center gap-2">
            <TicketIcon className="w-5 h-5 text-primary" />
            ราคาและตั๋ว
          </span>
        </h2>

        <div className="space-y-5">
          {/* Price Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-light mb-1.5">
                ราคา (บาท)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">฿</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-8 pr-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0"
                />
              </div>
              <p className="text-xs text-muted mt-1">เว้นว่างหรือใส่ 0 ถ้าเข้าฟรี</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-surface-light mb-1.5">
                ราคาสูงสุด (บาท)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">฿</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={formData.priceMax}
                  onChange={(e) => setFormData({ ...formData, priceMax: e.target.value })}
                  className={`w-full pl-8 pr-4 py-2.5 bg-dark border rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 ${
                    errors.priceMax ? "border-red-500" : "border-muted/30"
                  }`}
                  placeholder="สำหรับแสดงช่วงราคา"
                />
              </div>
              {errors.priceMax && <p className="text-red-400 text-sm mt-1">{errors.priceMax}</p>}
              <p className="text-xs text-muted mt-1">เว้นว่างถ้าราคาเดียว</p>
            </div>
          </div>

          {/* Ticket URL */}
          <div>
            <label className="block text-sm font-medium text-surface-light mb-1.5">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" />
                ลิงก์ซื้อตั๋ว
              </span>
            </label>
            <input
              type="url"
              value={formData.ticketUrl}
              onChange={(e) => setFormData({ ...formData, ticketUrl: e.target.value })}
              className="w-full px-4 py-2.5 bg-dark border border-muted/30 rounded-xl text-surface-light placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="https://eventpop.me/e/xxx หรือ https://ticketmelon.com/xxx"
            />
          </div>
        </div>
      </div>

      {/* Recurring */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          <span className="flex items-center gap-2">
            <RepeatIcon className="w-5 h-5 text-primary" />
            อีเวนท์ประจำ
          </span>
        </h2>

        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-5 h-5 rounded border-muted/30 bg-dark text-primary focus:ring-primary/50"
            />
            <div>
              <span className="text-surface-light group-hover:text-primary-light transition-colors">เป็นอีเวนท์ที่จัดประจำ</span>
              <p className="text-xs text-muted">เช่น DJ Night ทุกวันศุกร์ หรือ Ladies Night ทุกวันพุธ</p>
            </div>
          </label>

          {formData.isRecurring && (
            <div className="ml-8 max-w-xs">
              <SearchableSelect
                label="รูปแบบการจัด"
                placeholder="เลือกรูปแบบ"
                options={RECURRENCE_PATTERNS}
                value={formData.recurrencePattern}
                onChange={(value) => setFormData({ ...formData, recurrencePattern: value })}
              />
            </div>
          )}
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
              <p className="text-xs text-muted">แสดงอีเวนท์ในหน้าเว็บ</p>
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
              <span className="text-surface-light font-medium">อีเวนท์แนะนำ</span>
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
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
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

function RepeatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
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

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
