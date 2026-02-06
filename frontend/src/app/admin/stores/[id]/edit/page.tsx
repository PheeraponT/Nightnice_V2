"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type StoreUpdateDto } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { StoreForm } from "@/components/admin/stores/StoreForm";
import { resolveImageUrl } from "@/lib/utils";

// T127: Admin store edit page
export default function AdminStoreEditPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const queryClient = useQueryClient();
  const { getToken } = useAuth();
  const [error, setError] = useState("");
  const [imageStatus, setImageStatus] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const token = getToken();

  // Fetch store data
  const { data: store, isLoading: isLoadingStore } = useQuery({
    queryKey: ["admin-store", id],
    queryFn: () => api.admin.getStore(token!, id),
    enabled: !!token,
  });

  // Fetch provinces and categories for form
  const { data: provinces = [] } = useQuery({
    queryKey: ["provinces"],
    queryFn: api.public.getProvinces,
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: api.public.getCategories,
  });

  const updateMutation = useMutation({
    mutationFn: (data: StoreUpdateDto) => api.admin.updateStore(token!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-stores"] });
      queryClient.invalidateQueries({ queryKey: ["admin-store", id] });
      router.push("/admin/stores");
    },
    onError: (err: Error) => {
      setError(err.message || "เกิดข้อผิดพลาดในการอัปเดตร้าน");
    },
  });

  // Image upload mutations
  const uploadLogoMutation = useMutation({
    mutationFn: (file: File) => api.admin.uploadStoreLogo(token!, id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store", id] });
      setImageStatus("อัปโหลดโลโก้สำเร็จ");
      setTimeout(() => setImageStatus(""), 3000);
    },
    onError: () => setImageStatus("อัปโหลดโลโก้ไม่สำเร็จ"),
  });

  const deleteLogoMutation = useMutation({
    mutationFn: () => api.admin.deleteStoreLogo(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store", id] });
      setImageStatus("ลบโลโก้สำเร็จ");
      setTimeout(() => setImageStatus(""), 3000);
    },
    onError: () => setImageStatus("ลบโลโก้ไม่สำเร็จ"),
  });

  const uploadBannerMutation = useMutation({
    mutationFn: (file: File) => api.admin.uploadStoreBanner(token!, id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store", id] });
      setImageStatus("อัปโหลดแบนเนอร์สำเร็จ");
      setTimeout(() => setImageStatus(""), 3000);
    },
    onError: () => setImageStatus("อัปโหลดแบนเนอร์ไม่สำเร็จ"),
  });

  const deleteBannerMutation = useMutation({
    mutationFn: () => api.admin.deleteStoreBanner(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-store", id] });
      setImageStatus("ลบแบนเนอร์สำเร็จ");
      setTimeout(() => setImageStatus(""), 3000);
    },
    onError: () => setImageStatus("ลบแบนเนอร์ไม่สำเร็จ"),
  });

  const handleImageUpload = useCallback(
    (type: "logo" | "banner", file: File) => {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        setImageStatus("รองรับเฉพาะ JPEG, PNG, WebP");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setImageStatus("ไฟล์ต้องมีขนาดไม่เกิน 5MB");
        return;
      }
      if (type === "logo") uploadLogoMutation.mutate(file);
      else uploadBannerMutation.mutate(file);
    },
    [uploadLogoMutation, uploadBannerMutation]
  );

  const handleSubmit = useCallback(
    async (data: StoreUpdateDto) => {
      setError("");
      await updateMutation.mutateAsync(data);
    },
    [updateMutation]
  );

  if (isLoadingStore) {
    return (
      <div className="text-center py-12 text-muted">กำลังโหลด...</div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-muted mb-4">ไม่พบร้านค้า</p>
        <Link href="/admin/stores" className="text-primary hover:underline">
          กลับไปหน้ารายการร้าน
        </Link>
      </div>
    );
  }

  const isUploading =
    uploadLogoMutation.isPending ||
    deleteLogoMutation.isPending ||
    uploadBannerMutation.isPending ||
    deleteBannerMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/stores"
          className="text-muted hover:text-surface-light transition-colors"
        >
          &larr; กลับ
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-light">แก้ไขร้าน</h1>
          <p className="text-muted mt-1">{store.name}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Image Upload Section */}
      <div className="bg-darker rounded-xl border border-muted/20 p-6">
        <h2 className="text-lg font-semibold text-surface-light mb-4 flex items-center gap-2">
          <CameraIcon className="w-5 h-5 text-primary" />
          รูปภาพร้าน
        </h2>

        {imageStatus && (
          <p className="text-sm text-primary-light mb-4">{imageStatus}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-surface-light">โลโก้ร้าน</label>
            <div className="relative w-32 h-32 rounded-xl border-2 border-dashed border-muted/30 bg-dark/50 overflow-hidden flex items-center justify-center">
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => logoInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-xs text-primary-light hover:bg-primary/25 transition-all disabled:opacity-50"
              >
                {uploadLogoMutation.isPending ? "กำลังอัปโหลด..." : "อัปโหลดโลโก้"}
              </button>
              {store.logoUrl && (
                <button
                  type="button"
                  onClick={() => deleteLogoMutation.mutate()}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-lg border border-muted/30 text-xs text-muted hover:text-red-400 hover:border-red-400/40 transition-all disabled:opacity-50"
                >
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
            <p className="text-[10px] text-muted">JPEG, PNG, WebP (สูงสุด 5MB)</p>
          </div>

          {/* Banner */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-surface-light">แบนเนอร์ร้าน</label>
            <div className="relative w-full h-32 rounded-xl border-2 border-dashed border-muted/30 bg-dark/50 overflow-hidden flex items-center justify-center">
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
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 rounded-lg bg-primary/15 border border-primary/30 text-xs text-primary-light hover:bg-primary/25 transition-all disabled:opacity-50"
              >
                {uploadBannerMutation.isPending ? "กำลังอัปโหลด..." : "อัปโหลดแบนเนอร์"}
              </button>
              {store.bannerUrl && (
                <button
                  type="button"
                  onClick={() => deleteBannerMutation.mutate()}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-lg border border-muted/30 text-xs text-muted hover:text-red-400 hover:border-red-400/40 transition-all disabled:opacity-50"
                >
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
            <p className="text-[10px] text-muted">JPEG, PNG, WebP (สูงสุด 5MB) แนะนำ 1200x400px</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <StoreForm
        initialData={store}
        provinces={provinces}
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={updateMutation.isPending}
        submitLabel="บันทึกการเปลี่ยนแปลง"
      />
    </div>
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
