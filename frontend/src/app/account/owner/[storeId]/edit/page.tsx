"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import {
  useOwnedStore,
  useUpdateOwnedStore,
  useUploadOwnerLogo,
  useDeleteOwnerLogo,
  useUploadOwnerBanner,
  useDeleteOwnerBanner,
} from "@/hooks/useOwnerDashboard";
import { useToast } from "@/components/ui/Toast";
import { cn, resolveImageUrl } from "@/lib/utils";
import type { OwnerStoreUpdateDto } from "@/lib/api";

const PRICE_RANGE_OPTIONS = [
  { value: 1, label: "$ - ประหยัด" },
  { value: 2, label: "$$ - ปานกลาง" },
  { value: 3, label: "$$$ - สูง" },
  { value: 4, label: "$$$$ - พรีเมียม" },
];

const FACILITY_OPTIONS = [
  "parking",
  "live_music",
  "karaoke",
  "outdoor_seating",
  "wifi",
  "reservation",
];

const FACILITY_LABELS: Record<string, string> = {
  parking: "ที่จอดรถ",
  live_music: "ดนตรีสด",
  karaoke: "คาราโอเกะ",
  outdoor_seating: "ที่นั่งกลางแจ้ง",
  wifi: "WiFi",
  reservation: "รับจอง",
};

export default function EditStorePage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading } = useFirebaseAuth();
  const { data: store, isLoading } = useOwnedStore(storeId);
  const updateMutation = useUpdateOwnedStore();
  const uploadLogoMutation = useUploadOwnerLogo();
  const deleteLogoMutation = useDeleteOwnerLogo();
  const uploadBannerMutation = useUploadOwnerBanner();
  const deleteBannerMutation = useDeleteOwnerBanner();
  const { showToast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<OwnerStoreUpdateDto>({
    description: "",
    phone: "",
    address: "",
    googleMapUrl: "",
    lineId: "",
    facebookUrl: "",
    instagramUrl: "",
    priceRange: undefined,
    openTime: "",
    closeTime: "",
    facilities: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill form when store data loads
  useEffect(() => {
    if (store) {
      setForm({
        description: store.description || "",
        phone: store.phone || "",
        address: store.address || "",
        googleMapUrl: store.googleMapUrl || "",
        lineId: store.lineId || "",
        facebookUrl: store.facebookUrl || "",
        instagramUrl: store.instagramUrl || "",
        priceRange: store.priceRange || undefined,
        openTime: store.openTime || "",
        closeTime: store.closeTime || "",
        facilities: store.facilities || [],
      });
    }
  }, [store]);

  const updateField = useCallback(
    <K extends keyof OwnerStoreUpdateDto>(key: K, value: OwnerStoreUpdateDto[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      // Clear error on change
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const toggleFacility = useCallback((facility: string) => {
    setForm((prev) => {
      const current = prev.facilities || [];
      const next = current.includes(facility)
        ? current.filter((f) => f !== facility)
        : [...current, facility];
      return { ...prev, facilities: next };
    });
  }, []);

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (form.phone && !/^0[0-9]{8,9}$/.test(form.phone)) {
      newErrors.phone = "เบอร์โทรศัพท์ไม่ถูกต้อง (ต้องเริ่มด้วย 0 ตามด้วย 8-9 หลัก)";
    }

    if (form.googleMapUrl && !form.googleMapUrl.startsWith("http")) {
      newErrors.googleMapUrl = "URL ต้องเริ่มต้นด้วย http:// หรือ https://";
    }

    if (form.facebookUrl && !form.facebookUrl.startsWith("http")) {
      newErrors.facebookUrl = "URL ต้องเริ่มต้นด้วย http:// หรือ https://";
    }

    if (form.instagramUrl && !form.instagramUrl.startsWith("http")) {
      newErrors.instagramUrl = "URL ต้องเริ่มต้นด้วย http:// หรือ https://";
    }

    if (form.openTime && form.closeTime) {
      const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
      if (!timePattern.test(form.openTime)) {
        newErrors.openTime = "รูปแบบเวลาไม่ถูกต้อง (HH:mm)";
      }
      if (!timePattern.test(form.closeTime)) {
        newErrors.closeTime = "รูปแบบเวลาไม่ถูกต้อง (HH:mm)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      try {
        await updateMutation.mutateAsync({
          storeId,
          data: form,
        });
        showToast("บันทึกข้อมูลร้านสำเร็จ", "success");
      } catch (error) {
        console.error("Failed to update store:", error);
        showToast("ไม่สามารถบันทึกข้อมูลได้ กรุณาลองอีกครั้ง", "error");
      }
    },
    [form, storeId, updateMutation, validate, showToast]
  );

  const handleImageUpload = useCallback(
    async (type: "logo" | "banner", file: File) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        showToast("รองรับเฉพาะ JPEG, PNG, WebP", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showToast("ไฟล์ต้องมีขนาดไม่เกิน 5MB", "error");
        return;
      }

      try {
        if (type === "logo") {
          await uploadLogoMutation.mutateAsync({ storeId, file });
        } else {
          await uploadBannerMutation.mutateAsync({ storeId, file });
        }
        showToast(
          type === "logo" ? "อัปโหลดโลโก้สำเร็จ" : "อัปโหลดแบนเนอร์สำเร็จ",
          "success"
        );
      } catch {
        showToast("อัปโหลดไม่สำเร็จ กรุณาลองอีกครั้ง", "error");
      }
    },
    [storeId, uploadLogoMutation, uploadBannerMutation, showToast]
  );

  const handleImageDelete = useCallback(
    async (type: "logo" | "banner") => {
      try {
        if (type === "logo") {
          await deleteLogoMutation.mutateAsync({ storeId });
        } else {
          await deleteBannerMutation.mutateAsync({ storeId });
        }
        showToast(
          type === "logo" ? "ลบโลโก้สำเร็จ" : "ลบแบนเนอร์สำเร็จ",
          "success"
        );
      } catch {
        showToast("ลบไม่สำเร็จ กรุณาลองอีกครั้ง", "error");
      }
    },
    [storeId, deleteLogoMutation, deleteBannerMutation, showToast]
  );

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-night text-surface-light">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="h-5 w-32 rounded bg-white/5 animate-pulse" />
              <div className="h-10 w-64 rounded-xl bg-white/5 animate-pulse" />
              <div className="rounded-3xl border border-white/10 bg-night-lighter/70 p-8">
                <div className="space-y-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
                      <div className="h-10 w-full rounded-xl bg-white/5 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!user || !store) {
    return (
      <div className="min-h-screen bg-night text-surface-light flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-display font-bold">
            {!user ? "กรุณาเข้าสู่ระบบ" : "ไม่พบข้อมูลร้าน"}
          </h1>
          <Link
            href={!user ? "/account" : "/account/owner"}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/15 text-sm hover:border-primary/40 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            {!user ? "ไปหน้าบัญชี" : "กลับ Owner Dashboard"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night text-surface-light">
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <Link
              href={`/account/owner/${storeId}`}
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-surface-light transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              กลับหน้าร้าน {store.name}
            </Link>

            <div>
              <h1 className="text-3xl font-display font-bold">แก้ไขข้อมูลร้าน</h1>
              <p className="text-muted mt-1">{store.name}</p>
            </div>

            {/* Admin-only note */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3">
              <div className="flex items-start gap-3">
                <InfoIcon className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-200">
                  ชื่อร้าน, ตำแหน่งบนแผนที่ และหมวดหมู่ แก้ไขโดยแอดมินเท่านั้น
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Logo & Banner */}
              <article className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-6">
                <header>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">รูปภาพ</p>
                  <h2 className="text-xl font-display">โลโก้และแบนเนอร์</h2>
                </header>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Logo */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-surface-light/80">โลโก้ร้าน</label>
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-2xl border-2 border-dashed border-white/20 bg-night/60 overflow-hidden flex items-center justify-center">
                        {store.logoUrl ? (
                          <Image
                            src={resolveImageUrl(store.logoUrl) || ""}
                            alt="Logo"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-center text-muted">
                            <CameraIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                            <p className="text-[10px]">ไม่มีโลโก้</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadLogoMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-xs text-primary-light hover:bg-primary/25 transition-all disabled:opacity-50"
                        >
                          {uploadLogoMutation.isPending ? (
                            <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          ) : (
                            <UploadIcon className="w-3.5 h-3.5" />
                          )}
                          อัปโหลด
                        </button>
                        {store.logoUrl && (
                          <button
                            type="button"
                            onClick={() => handleImageDelete("logo")}
                            disabled={deleteLogoMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-muted hover:text-error hover:border-error/40 transition-all disabled:opacity-50"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            ลบ
                          </button>
                        )}
                      </div>
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload("logo", file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-muted">JPEG, PNG, WebP (สูงสุด 5MB)</p>
                  </div>

                  {/* Banner */}
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-surface-light/80">แบนเนอร์ร้าน</label>
                    <div className="relative group">
                      <div className="w-full h-32 rounded-2xl border-2 border-dashed border-white/20 bg-night/60 overflow-hidden flex items-center justify-center">
                        {store.bannerUrl ? (
                          <Image
                            src={resolveImageUrl(store.bannerUrl) || ""}
                            alt="Banner"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="text-center text-muted">
                            <CameraIcon className="w-8 h-8 mx-auto mb-1 opacity-40" />
                            <p className="text-[10px]">ไม่มีแบนเนอร์</p>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => bannerInputRef.current?.click()}
                          disabled={uploadBannerMutation.isPending}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/15 border border-primary/30 text-xs text-primary-light hover:bg-primary/25 transition-all disabled:opacity-50"
                        >
                          {uploadBannerMutation.isPending ? (
                            <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          ) : (
                            <UploadIcon className="w-3.5 h-3.5" />
                          )}
                          อัปโหลด
                        </button>
                        {store.bannerUrl && (
                          <button
                            type="button"
                            onClick={() => handleImageDelete("banner")}
                            disabled={deleteBannerMutation.isPending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 text-xs text-muted hover:text-error hover:border-error/40 transition-all disabled:opacity-50"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            ลบ
                          </button>
                        )}
                      </div>
                      <input
                        ref={bannerInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload("banner", file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-muted">JPEG, PNG, WebP (สูงสุด 5MB) แนะนำ 1200x400px</p>
                  </div>
                </div>
              </article>

              {/* Description */}
              <article className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-6">
                <header>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">ข้อมูลทั่วไป</p>
                  <h2 className="text-xl font-display">รายละเอียดร้าน</h2>
                </header>

                <FormField label="รายละเอียด" error={errors.description}>
                  <textarea
                    value={form.description || ""}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={4}
                    placeholder="อธิบายเกี่ยวกับร้านของคุณ..."
                    className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
                  />
                </FormField>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="ระดับราคา" error={errors.priceRange}>
                    <select
                      value={form.priceRange || ""}
                      onChange={(e) =>
                        updateField(
                          "priceRange",
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                      className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    >
                      <option value="">ไม่ระบุ</option>
                      {PRICE_RANGE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </article>

              {/* Operating Hours */}
              <article className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-6">
                <header>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">เวลาทำการ</p>
                  <h2 className="text-xl font-display">เวลาเปิด-ปิด</h2>
                </header>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="เวลาเปิด" error={errors.openTime}>
                    <input
                      type="time"
                      value={form.openTime || ""}
                      onChange={(e) => updateField("openTime", e.target.value)}
                      className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    />
                  </FormField>
                  <FormField label="เวลาปิด" error={errors.closeTime}>
                    <input
                      type="time"
                      value={form.closeTime || ""}
                      onChange={(e) => updateField("closeTime", e.target.value)}
                      className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    />
                  </FormField>
                </div>
              </article>

              {/* Contact Info */}
              <article className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-6">
                <header>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">การติดต่อ</p>
                  <h2 className="text-xl font-display">ข้อมูลติดต่อ</h2>
                </header>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="เบอร์โทรศัพท์" error={errors.phone}>
                    <input
                      type="tel"
                      value={form.phone || ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      placeholder="0812345678"
                      className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    />
                  </FormField>
                  <FormField label="LINE ID" error={errors.lineId}>
                    <input
                      type="text"
                      value={form.lineId || ""}
                      onChange={(e) => updateField("lineId", e.target.value)}
                      placeholder="@lineid"
                      className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    />
                  </FormField>
                </div>

                <FormField label="ที่อยู่" error={errors.address}>
                  <textarea
                    value={form.address || ""}
                    onChange={(e) => updateField("address", e.target.value)}
                    rows={2}
                    placeholder="ที่อยู่ร้าน..."
                    className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent resize-none"
                  />
                </FormField>

                <FormField label="Google Maps URL" error={errors.googleMapUrl}>
                  <input
                    type="url"
                    value={form.googleMapUrl || ""}
                    onChange={(e) => updateField("googleMapUrl", e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                  />
                </FormField>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField label="Facebook URL" error={errors.facebookUrl}>
                    <input
                      type="url"
                      value={form.facebookUrl || ""}
                      onChange={(e) => updateField("facebookUrl", e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    />
                  </FormField>
                  <FormField label="Instagram URL" error={errors.instagramUrl}>
                    <input
                      type="url"
                      value={form.instagramUrl || ""}
                      onChange={(e) => updateField("instagramUrl", e.target.value)}
                      placeholder="https://instagram.com/..."
                      className="w-full px-4 py-3 bg-night/60 border border-white/10 rounded-2xl text-surface-light placeholder:text-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                    />
                  </FormField>
                </div>
              </article>

              {/* Facilities */}
              <article className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-6">
                <header>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">บริการ</p>
                  <h2 className="text-xl font-display">สิ่งอำนวยความสะดวก</h2>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {FACILITY_OPTIONS.map((facility) => {
                    const isSelected = (form.facilities || []).includes(facility);
                    return (
                      <button
                        key={facility}
                        type="button"
                        onClick={() => toggleFacility(facility)}
                        className={cn(
                          "text-left rounded-2xl border px-4 py-3 transition-all duration-300",
                          isSelected
                            ? "border-primary/40 bg-primary/10 shadow-glow-blue"
                            : "border-white/10 bg-night/50 hover:border-white/30"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            {FACILITY_LABELS[facility] || facility}
                          </span>
                          <span
                            className={cn(
                              "inline-flex h-5 w-5 items-center justify-center rounded-md transition-all",
                              isSelected
                                ? "bg-primary/70 text-white"
                                : "bg-white/10 text-transparent"
                            )}
                          >
                            <CheckIcon className="w-3 h-3" />
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </article>

              {/* Submit */}
              <div className="flex items-center justify-between gap-4">
                <Link
                  href={`/account/owner/${storeId}`}
                  className="px-5 py-3 rounded-2xl border border-white/15 text-sm hover:border-white/30 transition-all duration-300"
                >
                  ยกเลิก
                </Link>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className={cn(
                    "px-8 py-3 rounded-2xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-sm transition-all duration-300",
                    updateMutation.isPending
                      ? "opacity-60 cursor-not-allowed"
                      : "hover:opacity-90 hover:shadow-glow-blue"
                  )}
                >
                  {updateMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      กำลังบันทึก...
                    </span>
                  ) : (
                    "บันทึกข้อมูล"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Form field wrapper ---------- */

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-surface-light/80">
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
}

/* ---------- Icon components ---------- */

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
