"use client";

import Link from "next/link";
import Image from "next/image";
import { useFirebaseAuth } from "@/contexts/FirebaseAuthContext";
import { useOwnedStores } from "@/hooks/useOwnerDashboard";
import { cn } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/utils";

export default function OwnerDashboardPage() {
  const { user, loading } = useFirebaseAuth();
  const { data: stores, isLoading } = useOwnedStores();

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-night text-surface-light">
        <section className="relative py-12 md:py-16 bg-hero overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-night" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="h-8 w-48 mx-auto rounded-full bg-white/5 animate-pulse" />
              <div className="h-12 w-80 mx-auto rounded-2xl bg-white/5 animate-pulse" />
              <div className="h-6 w-64 mx-auto rounded-xl bg-white/5 animate-pulse" />
            </div>
          </div>
        </section>
        <section className="pb-12 -mt-6">
          <div className="container mx-auto px-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card space-y-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 rounded bg-white/5 animate-pulse" />
                      <div className="h-4 w-24 rounded bg-white/5 animate-pulse" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-16 rounded-2xl bg-white/5 animate-pulse" />
                    <div className="h-16 rounded-2xl bg-white/5 animate-pulse" />
                    <div className="h-16 rounded-2xl bg-white/5 animate-pulse" />
                  </div>
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
          <div className="w-16 h-16 mx-auto rounded-full bg-night-lighter/70 border border-white/10 flex items-center justify-center">
            <LockIcon className="w-7 h-7 text-muted" />
          </div>
          <h1 className="text-2xl font-display font-bold">
            กรุณาเข้าสู่ระบบ
          </h1>
          <p className="text-muted">
            คุณต้องเข้าสู่ระบบเพื่อเข้าถึง Owner Dashboard
          </p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary/20 border border-primary/40 text-primary-light font-semibold text-sm hover:bg-primary/30 transition-all duration-300"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            ไปหน้าบัญชี
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-night text-surface-light">
      {/* Hero */}
      <section className="relative py-12 md:py-16 bg-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-night" />
        <div className="absolute inset-x-0 top-8 flex justify-center opacity-50 blur-3xl pointer-events-none">
          <div className="w-72 h-72 bg-accent/40 rounded-full mix-blend-screen" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-sm text-muted hover:text-surface-light transition-colors"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              กลับหน้าบัญชี
            </Link>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/30 text-xs tracking-[0.4em] uppercase text-accent-light">
              Venue Owner
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold">
              Owner Dashboard
            </h1>
            <p className="text-muted text-base md:text-lg">
              จัดการร้านของคุณ แก้ไขข้อมูล ดูสถิติ และตอบรีวิวลูกค้า
            </p>
          </div>
        </div>
      </section>

      {/* Store List */}
      <section className="pb-12 -mt-6 relative z-10">
        <div className="container mx-auto px-4">
          {!stores || stores.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-12 shadow-card text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-night/60 flex items-center justify-center mb-4">
                <StoreIcon className="w-7 h-7 text-muted" />
              </div>
              <h2 className="text-xl font-display font-semibold">
                ยังไม่มีร้านที่คุณดูแล
              </h2>
              <p className="text-muted mt-2 max-w-md mx-auto">
                หากคุณเป็นเจ้าของร้านและต้องการจัดการร้านผ่านระบบนี้ กรุณาติดต่อทีมงาน Nightnice
              </p>
              <Link
                href="/account"
                className="inline-flex items-center gap-2 mt-6 px-5 py-3 rounded-2xl border border-white/15 text-sm hover:border-primary/40 hover:text-primary-light transition-all duration-300"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                กลับหน้าบัญชี
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stores.map((store) => (
                <Link
                  key={store.id}
                  href={`/account/owner/${store.id}`}
                  className="group rounded-3xl border border-white/10 bg-night-lighter/70 backdrop-blur-2xl p-6 shadow-card hover:border-accent/40 hover:shadow-glow-blue transition-all duration-300"
                >
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-night-lighter flex-shrink-0 border border-white/10">
                      {store.logoUrl ? (
                        <Image
                          src={resolveImageUrl(store.logoUrl) || store.logoUrl}
                          alt={store.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted text-xs font-semibold">
                          NN
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-display font-semibold truncate group-hover:text-accent-light transition-colors">
                        {store.name}
                      </h3>
                      <p className="text-sm text-muted truncate">
                        {store.provinceName}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        store.isActive
                          ? "bg-success/10 text-success border border-success/30"
                          : "bg-white/5 text-muted border border-white/10"
                      )}
                    >
                      {store.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Categories */}
                  {store.categoryNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-4">
                      {store.categoryNames.slice(0, 3).map((cat) => (
                        <span
                          key={cat}
                          className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted border border-white/10"
                        >
                          {cat}
                        </span>
                      ))}
                      {store.categoryNames.length > 3 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted border border-white/10">
                          +{store.categoryNames.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="rounded-2xl border border-white/10 bg-night/60 p-3 text-center">
                      <p className="text-xs text-muted">รีวิว</p>
                      <p className="text-lg font-display font-semibold text-primary-light">
                        {store.reviewCount}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-night/60 p-3 text-center">
                      <p className="text-xs text-muted">คะแนน</p>
                      <p className="text-lg font-display font-semibold text-accent-light">
                        {store.averageRating !== null
                          ? store.averageRating.toFixed(1)
                          : "-"}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-night/60 p-3 text-center">
                      <p className="text-xs text-muted">วิว 30d</p>
                      <p className="text-lg font-display font-semibold text-surface-light">
                        {store.viewsLast30Days.toLocaleString("th-TH")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end text-xs text-muted group-hover:text-accent-light transition-colors">
                    <span>ดูรายละเอียด</span>
                    <ArrowRightIcon className="w-3.5 h-3.5 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          )}
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

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}
