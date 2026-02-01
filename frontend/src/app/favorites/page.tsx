"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useFavorites } from "@/hooks/useFavorites";
import { StoreCard } from "@/components/store/StoreCard";

export default function FavoritesPage() {
  const { favorites, favoriteCount, clearAll, isHydrated } = useFavorites();

  // Fetch stores by IDs directly
  const { data: favoriteStores = [], isLoading } = useQuery({
    queryKey: ["stores", "by-ids", favorites],
    queryFn: () => api.public.getStoresByIds(favorites),
    enabled: isHydrated && favorites.length > 0,
  });

  return (
    <div className="min-h-screen bg-night">
      {/* Header */}
      <section className="relative py-12 md:py-16 bg-hero overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-10 left-20 w-1.5 h-1.5 bg-error rounded-full animate-twinkle" />
        <div className="absolute top-20 right-32 w-1 h-1 bg-primary-light rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-error/10 border border-error/20">
              <HeartIcon className="w-4 h-4 text-error" />
              <span className="text-sm text-error font-medium">My Favorites</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">ร้านโปรดของฉัน</span>
            </h1>
            <p className="text-muted text-lg">
              {favoriteCount > 0
                ? `คุณบันทึกไว้ ${favoriteCount} ร้าน`
                : "ยังไม่มีร้านโปรด กดหัวใจที่การ์ดร้านเพื่อบันทึก"}
            </p>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-night to-transparent" />
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Actions */}
          {favoriteCount > 0 && (
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                  <HeartIcon className="w-5 h-5 text-error" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-bold text-surface-light">
                    ร้านที่บันทึกไว้
                  </h2>
                  <p className="text-sm text-muted">
                    {isLoading ? "กำลังโหลด..." : `${favoriteStores.length} ร้าน`}
                  </p>
                </div>
              </div>

              <button
                onClick={clearAll}
                className="flex items-center gap-2 px-4 py-2 text-sm text-muted hover:text-error border border-white/10 hover:border-error/30 rounded-xl transition-all duration-300"
              >
                <TrashIcon className="w-4 h-4" />
                ล้างทั้งหมด
              </button>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-muted">กำลังโหลดร้านโปรด...</span>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && favoriteCount === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-night-lighter flex items-center justify-center mb-6">
                <HeartIcon className="w-10 h-10 text-muted" />
              </div>
              <h3 className="text-xl font-display font-semibold text-surface-light mb-2">
                ยังไม่มีร้านโปรด
              </h3>
              <p className="text-muted text-center max-w-md mb-6">
                กดปุ่มหัวใจที่การ์ดร้านเพื่อบันทึกเป็นร้านโปรด จะได้กลับมาดูได้ง่ายๆ
              </p>
              <Link
                href="/stores"
                className="btn-gradient px-6 py-3 rounded-xl text-white font-medium"
              >
                ค้นหาร้าน
              </Link>
            </div>
          )}

          {/* Favorites Grid */}
          {!isLoading && favoriteStores.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {favoriteStores.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
          )}

          {/* No matches found (favorites exist but not found in data) */}
          {!isLoading && favoriteCount > 0 && favoriteStores.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 rounded-full bg-night-lighter flex items-center justify-center mb-4">
                <SearchIcon className="w-8 h-8 text-muted" />
              </div>
              <p className="text-muted text-center">
                ไม่พบร้านที่บันทึกไว้ ร้านอาจถูกลบออกจากระบบแล้ว
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Icon Components
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
