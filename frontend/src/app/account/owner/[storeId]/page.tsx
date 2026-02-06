"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useOwnedStore } from "@/hooks/useOwnerDashboard";
import { cn, resolveImageUrl, formatDate } from "@/lib/utils";

export default function StoreOverviewPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const { user, loading } = useFirebaseAuth();
  const { data: store, isLoading } = useOwnedStore(storeId);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-night text-surface-light">
        <section className="relative py-12 md:py-16 bg-hero overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-night" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="h-5 w-32 rounded bg-white/5 animate-pulse" />
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl bg-white/5 animate-pulse" />
                <div className="space-y-3">
                  <div className="h-8 w-56 rounded-xl bg-white/5 animate-pulse" />
                  <div className="h-5 w-40 rounded bg-white/5 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="pb-12 -mt-6">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-3xl border border-white/10 bg-night-lighter/70 p-5 animate-pulse">
                  <div className="h-4 w-16 rounded bg-white/5 mb-3" />
                  <div className="h-8 w-20 rounded bg-white/5" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-night text-surface-light flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-display font-bold">กรุณาเข้าสู่ระบบ</h1>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary/20 border border-primary/40 text-primary-light font-semibold text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            ไปหน้าบัญชี
          </Link>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen bg-night text-surface-light flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-display font-bold">ไม่พบข้อมูลร้าน</h1>
          <Link
            href="/account/owner"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-white/15 text-sm hover:border-primary/40 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            กลับ Owner Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const analytics = store.analytics;

  const statCards = [
    {
      label: "วิวทั้งหมด",
      value: analytics.viewsTotal.toLocaleString("th-TH"),
      accent: "text-primary-light",
    },
    {
      label: "วิว 30 วัน",
      value: analytics.viewsLast30Days.toLocaleString("th-TH"),
      accent: "text-primary-light",
    },
    {
      label: "วิว 7 วัน",
      value: analytics.viewsLast7Days.toLocaleString("th-TH"),
      accent: "text-primary-light",
    },
    {
      label: "รีวิวทั้งหมด",
      value: analytics.totalReviews.toLocaleString("th-TH"),
      accent: "text-accent-light",
    },
    {
      label: "คะแนนเฉลี่ย",
      value: analytics.averageRating > 0 ? analytics.averageRating.toFixed(1) : "-",
      accent: "text-accent-light",
    },
    {
      label: "ร้านโปรด",
      value: analytics.favoriteCount.toLocaleString("th-TH"),
      accent: "text-error",
    },
  ];

  const quickLinks = [
    {
      href: `/account/owner/${storeId}/edit`,
      label: "แก้ไขข้อมูลร้าน",
      description: "อัปเดตรายละเอียด เวลาเปิด-ปิด และข้อมูลติดต่อ",
      icon: EditIcon,
      color: "text-primary-light",
      borderColor: "hover:border-primary/40",
    },
    {
      href: `/account/owner/${storeId}/analytics`,
      label: "ดูสถิติร้าน",
      description: "วิว คะแนน และ mood analytics",
      icon: ChartIcon,
      color: "text-accent-light",
      borderColor: "hover:border-accent/40",
    },
    {
      href: `/account/owner/${storeId}/reviews`,
      label: "จัดการรีวิว",
      description: "ดูรีวิวลูกค้าและตอบกลับ",
      icon: ChatIcon,
      color: "text-success",
      borderColor: "hover:border-success/40",
    },
  ];

  return (
    <div className="min-h-screen bg-night text-surface-light">
      {/* Hero */}
      <section className="relative py-12 md:py-16 bg-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-night" />
        {store.bannerUrl && (
          <div className="absolute inset-0 opacity-10">
            <Image
              src={resolveImageUrl(store.bannerUrl) || store.bannerUrl}
              alt=""
              fill
              className="object-cover"
            />
          </div>
        )}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <Link
              href="/account/owner"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-surface-light transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Owner Dashboard
            </Link>

            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-night-lighter flex-shrink-0 border border-white/10">
                {store.logoUrl ? (
                  <Image
                    src={resolveImageUrl(store.logoUrl) || store.logoUrl}
                    alt={store.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted text-lg font-semibold">
                    NN
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-display font-bold">
                    {store.name}
                  </h1>
                  <span
                    className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                      store.isActive
                        ? "bg-success/10 text-success border border-success/30"
                        : "bg-white/5 text-muted border border-white/10"
                    )}
                  >
                    {store.isActive ? "Active" : "Inactive"}
                  </span>
                  {store.isFeatured && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent-light border border-accent/30">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-muted mt-1">
                  {store.provinceName}
                  {store.categories.length > 0 && (
                    <span>
                      {" / "}
                      {store.categories.map((c) => c.name).join(", ")}
                    </span>
                  )}
                </p>
                {analytics.primaryMood && (
                  <p className="text-sm text-accent-light mt-1">
                    Primary Mood: {analytics.primaryMood}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Summary */}
      <section className="relative -mt-6 pb-6 z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {statCards.map((stat) => (
              <article
                key={stat.label}
                className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-5 shadow-card"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  {stat.label}
                </p>
                <p className={cn("mt-3 text-2xl font-display font-semibold", stat.accent)}>
                  {stat.value}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-3">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "group rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card transition-all duration-300",
                    link.borderColor
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl bg-night/60 border border-white/10 flex items-center justify-center", link.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-display font-semibold group-hover:text-accent-light transition-colors">
                        {link.label}
                      </h3>
                      <p className="text-sm text-muted">{link.description}</p>
                    </div>
                    <ArrowRightIcon className="w-5 h-5 text-muted group-hover:text-accent-light transition-colors" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Store Info Summary */}
      <section className="pb-12">
        <div className="container mx-auto px-4">
          <article className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-6">
            <header>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">ข้อมูลเบื้องต้น</p>
              <h2 className="text-2xl font-display">รายละเอียดร้าน</h2>
            </header>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-night/60 p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-muted mb-2">รายละเอียด</p>
                <p className="text-sm text-surface-light/80">
                  {store.description || "ยังไม่มีรายละเอียด"}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-night/60 p-4 space-y-3">
                <p className="text-xs uppercase tracking-[0.3em] text-muted mb-2">ข้อมูลติดต่อ</p>
                {store.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <PhoneIcon className="w-4 h-4 text-muted flex-shrink-0" />
                    <span>{store.phone}</span>
                  </div>
                )}
                {store.address && (
                  <div className="flex items-start gap-2 text-sm">
                    <LocationIcon className="w-4 h-4 text-muted flex-shrink-0 mt-0.5" />
                    <span>{store.address}</span>
                  </div>
                )}
                {store.openTime && store.closeTime && (
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="w-4 h-4 text-muted flex-shrink-0" />
                    <span>{store.openTime} - {store.closeTime}</span>
                  </div>
                )}
                {!store.phone && !store.address && (
                  <p className="text-sm text-muted">ยังไม่มีข้อมูลติดต่อ</p>
                )}
              </div>
            </div>

            {/* Social Links */}
            <div className="grid gap-3 md:grid-cols-3">
              {store.lineId && (
                <div className="rounded-2xl border border-white/10 bg-night/60 p-3 flex items-center gap-3">
                  <span className="text-xs text-muted">LINE</span>
                  <span className="text-sm font-medium">{store.lineId}</span>
                </div>
              )}
              {store.facebookUrl && (
                <div className="rounded-2xl border border-white/10 bg-night/60 p-3 flex items-center gap-3 min-w-0">
                  <span className="text-xs text-muted flex-shrink-0">Facebook</span>
                  <span className="text-sm font-medium truncate">{store.facebookUrl}</span>
                </div>
              )}
              {store.instagramUrl && (
                <div className="rounded-2xl border border-white/10 bg-night/60 p-3 flex items-center gap-3 min-w-0">
                  <span className="text-xs text-muted flex-shrink-0">Instagram</span>
                  <span className="text-sm font-medium truncate">{store.instagramUrl}</span>
                </div>
              )}
            </div>

            {/* Facilities */}
            {store.facilities.length > 0 && (
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted mb-3">สิ่งอำนวยความสะดวก</p>
                <div className="flex flex-wrap gap-2">
                  {store.facilities.map((f) => (
                    <span
                      key={f}
                      className="px-3 py-1.5 rounded-full text-xs bg-white/5 text-surface-light/80 border border-white/10"
                    >
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-4 text-xs text-muted pt-4 border-t border-white/10">
              <span>สร้างเมื่อ {formatDate(store.createdAt)}</span>
              <span>อัปเดตล่าสุด {formatDate(store.updatedAt)}</span>
            </div>
          </article>
        </div>
      </section>
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
