"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useStores, useFeaturedStores, useNearestStore } from "@/hooks/useStores";
import { useProvinces } from "@/hooks/useProvinces";
import { useCategories } from "@/hooks/useCategories";
import { useAds } from "@/hooks/useAds";
import { useUpcomingEvents } from "@/hooks/useEvents";
import { EventShowcase } from "@/components/events";
import { useGeolocation } from "@/hooks/useGeolocation";
import { SearchBar } from "@/components/search/SearchBar";
import { StoreFilters } from "@/components/search/StoreFilters";
import { StoreGrid } from "@/components/store/StoreGrid";
import { Pagination } from "@/components/ui/Pagination";
import { BannerAd } from "@/components/ads/BannerAd";
import { SponsoredStoreCard } from "@/components/ads/SponsoredStoreCard";
import { SITE_NAME } from "@/lib/constants";
import { MOOD_OPTIONS, VIBE_DIMENSIONS } from "@/lib/mood";
import { resolveImageUrl, cn } from "@/lib/utils";

export default function HomePage() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [minPrice, setMinPrice] = useState<number | undefined>();
  const [maxPrice, setMaxPrice] = useState<number | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortByDistance, setSortByDistance] = useState(true);
  const pageSize = 12;

  // Geolocation
  const { latitude, longitude, permitted, loading: geoLoading } = useGeolocation();

  // Queries
  const { data: featuredStores, isLoading: isFeaturedLoading } = useFeaturedStores(6);
  const { data: storesData, isLoading: isStoresLoading } = useStores({
    q: searchQuery || undefined,
    province: selectedProvince,
    category: selectedCategory,
    minPrice,
    maxPrice,
    page: currentPage,
    pageSize,
    lat: permitted && sortByDistance ? latitude ?? undefined : undefined,
    lng: permitted && sortByDistance ? longitude ?? undefined : undefined,
    sortByDistance: permitted && sortByDistance,
  });
  const { data: provinces = [], isLoading: isProvincesLoading } = useProvinces();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  // T107: Ad queries for home page
  const { data: bannerAds = [] } = useAds({ type: "Banner", limit: 1 });
  const { data: sponsoredAds = [] } = useAds({ type: "Sponsored", limit: 3 });

  // Upcoming events for home page
  const { data: upcomingEvents = [], isLoading: isEventsLoading } = useUpcomingEvents({ limit: 4 });

  // Nearest store as fallback for hero when no featured stores
  const { data: nearestStore } = useNearestStore(
    permitted ? latitude ?? undefined : undefined,
    permitted ? longitude ?? undefined : undefined
  );

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleProvinceChange = useCallback((province: string | undefined) => {
    setSelectedProvince(province);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((category: string | undefined) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const handlePriceChange = useCallback((min: number | undefined, max: number | undefined) => {
    setMinPrice(min);
    setMaxPrice(max);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const stores = storesData?.items || [];
  const totalPages = storesData?.totalPages || 1;
  const totalCount = storesData?.totalCount || 0;

  const hasActiveFilters = searchQuery || selectedProvince || selectedCategory || minPrice !== undefined;

  const quickStats = useMemo(
    () => [
      { label: "Mood Matches", value: "2.4K+", description: "ผู้ใช้ที่ให้คะแนน Mood & Vibe" },
      { label: "เมืองที่ครอบคลุม", value: provinces.length ? `${provinces.length}+` : "45+", description: "ทั่วไทย" },
      { label: "รีวิวรอบดึก", value: totalCount > 0 ? `${totalCount}+` : "ใหม่ทุกคืน", description: "อัปเดตสดๆ" },
    ],
    [provinces.length, totalCount]
  );

  const moodHighlights = useMemo(() => {
    if (!featuredStores || featuredStores.length === 0) return [];
    return featuredStores.slice(0, 3).map((store, index) => {
      const mood = MOOD_OPTIONS[index % MOOD_OPTIONS.length];
      return {
        id: store.id,
        name: store.name,
        slug: store.slug,
        province: store.provinceName,
        categories: store.categoryNames,
        mood,
        logoUrl: store.logoUrl,
        bannerUrl: store.bannerUrl,
      };
    });
  }, [featuredStores]);

  // Use featured store first, fallback to nearest store
  const heroHighlight = useMemo(() => {
    if (moodHighlights[0]) {
      return moodHighlights[0];
    }
    if (nearestStore) {
      return {
        id: nearestStore.id,
        name: nearestStore.name,
        slug: nearestStore.slug,
        province: nearestStore.provinceName,
        categories: nearestStore.categoryNames,
        mood: MOOD_OPTIONS[0],
        logoUrl: nearestStore.logoUrl,
        bannerUrl: nearestStore.bannerUrl,
      };
    }
    return null;
  }, [moodHighlights, nearestStore]);

  const heroMoodIndex = heroHighlight ? MOOD_OPTIONS.findIndex((option) => option.id === heroHighlight.mood.id) : 0;
  const heroSecondaryMood = MOOD_OPTIONS[(heroMoodIndex + 1) % MOOD_OPTIONS.length];

  const heroVibePreview = useMemo(
    () =>
      VIBE_DIMENSIONS.slice(0, 3).map((dimension, index) => ({
        dimension,
        score: [3, 4, 3][index] ?? 5,
      })),
    []
  );

  const heroImage = heroHighlight
    ? (resolveImageUrl(heroHighlight.bannerUrl) || resolveImageUrl(heroHighlight.logoUrl) || "/logo.svg")
    : "/logo.svg";
  const heroMatchScore = heroHighlight ? 90 + ((heroHighlight.id?.length ?? 0) % 7) : 90;

  const handleMoodQuickSelect = useCallback(
    (moodLabel: string) => {
      setSearchQuery(moodLabel);
      setCurrentPage(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    []
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-night via-night-light/40 to-night py-16 md:py-24">
        <div className="absolute inset-0">
          <div className="absolute inset-y-0 left-1/2 w-1/2 bg-gradient-to-l from-primary/10 via-transparent to-transparent blur-3xl" />
          <div className="absolute -top-16 -right-16 w-72 h-72 bg-accent/20 rounded-full blur-[160px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10 flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="lg:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted">
              Mood-first Nightlife Compass
              <span className="rounded-full bg-primary/20 px-3 py-1 text-[10px] font-semibold text-primary-light">AI + Data</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-snug text-surface-light">
              เลือก “อารมณ์” ก่อน แล้วให้ AI พาไปหาร้านที่ใช่
            </h1>
            <p className="text-base md:text-lg text-muted max-w-xl">
              Nightnice คือแพลตฟอร์มแรกที่จับ Mood ของคุณแล้วใช้ข้อมูลรีวิวจริง + โมเดล AI เพื่อไกด์บาร์/ผับที่ตรงค่ำคืนนั้น โดยไม่ต้องไถเมนูยาว ๆ หรือเปิดหลายแท็บ
            </p>
            <ul className="space-y-2 text-sm text-muted/90">
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-2 w-2 rounded-full bg-primary/70" />
                Mood Journey 6 โหมด คลิกเดียวค้นหาได้เลย
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-2 w-2 rounded-full bg-accent/70" />
                Mood Pulse จากคนเคยไปจริง อัปเดตทุกคืน
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 block h-2 w-2 rounded-full bg-gold/70" />
                Vibe Dimensions 6 มิติ ช่วยตัดสินใจได้ไวกว่าเดิม
              </li>
            </ul>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              <div className="flex-1 rounded-2xl bg-night/60 border border-white/10 shadow-glow-blue/30">
                <SearchBar
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="ค้นหาร้าน ชื่อร้าน หรือ Mood..."
                />
              </div>
              <Link
                href="#mood-journey"
                className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-glow-purple transition hover:scale-[1.02]"
              >
                เปิด Mood Journey
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {quickStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-2xl font-bold text-surface-light">{stat.value}</p>
                  <p className="text-xs uppercase tracking-wide text-muted mt-1">{stat.label}</p>
                  <p className="text-xs text-muted/80 mt-1">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
          {heroHighlight && (
            <div className="lg:w-1/2">
              <div className="relative rounded-[32px] border border-white/10 bg-night-lighter/80 p-8 backdrop-blur">
                <div className="absolute -top-10 -right-6 w-40 h-40 bg-primary/25 blur-3xl" />
                <div className="relative z-10 space-y-5">
                  <div className="flex items-start gap-5">
                    <div className="relative flex-shrink-0">
                      <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-white/10 shadow-card bg-night/60">
                        <Image
                          src={heroImage}
                          alt={heroHighlight.name}
                          fill
                          className={heroImage.endsWith('.svg') ? "object-contain p-3" : "object-cover"}
                          sizes="112px"
                          priority
                        />
                      </div>
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-night px-3 py-1 text-xs font-semibold text-surface-light shadow-lg border border-white/10">
                        Match {heroMatchScore}%
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs uppercase tracking-[0.4em] text-primary-light">Mood-first</p>
                      <h3 className="text-2xl font-display font-semibold text-surface-light">{heroHighlight.name}</h3>
                      <p className="text-sm text-muted">
                        {heroHighlight.province || "ทั่วไทย"} · 650m จากคุณ
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-light">
                          {heroHighlight.mood.title}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-light">
                          {heroSecondaryMood.title}
                        </span>
                      </div>
                    </div>
                    <Image
                      src="/logo.svg"
                      alt={`${SITE_NAME} logo`}
                      width={48}
                      height={48}
                      className="drop-shadow-glow hidden sm:block"
                    />
                  </div>

                  <div className="border-t border-white/10 pt-4 space-y-3">
                    {heroVibePreview.map((item) => (
                      <div key={item.dimension.id} className="flex items-center gap-3">
                        <p className="text-xs text-muted w-16">{item.dimension.label}</p>
                        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full bg-gradient-to-r", item.dimension.bar)}
                            style={{ width: `${item.score * 10}%` }}
                          />
                        </div>
                        <span className="text-xs text-surface-light">{item.score}/10</span>
                      </div>
                    ))}
                  </div>

                  <p className="text-sm text-muted">
                    "{heroHighlight.mood.description} · นั่งคุยกันได้ยาวๆ"
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/store/${heroHighlight.slug}`}
                      className="flex-1 inline-flex items-center justify-center rounded-2xl bg-white/90 text-night px-5 py-3 text-sm font-semibold hover:bg-white transition"
                    >
                      ดูรายละเอียด
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Mood Journey */}
      <section id="mood-journey" className="bg-night py-12 md:py-16 border-t border-white/5">
        <div className="container mx-auto px-4 space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-muted">เลือกโหมดแล้วลุย</p>
              <h2 className="text-2xl md:text-3xl font-display font-semibold text-surface-light">
                Mood Journey – ปัดหาอารมณ์ที่ใช่
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted">
              <span>Tip: คลิก Mood เพื่อค้นหาทันที ·</span>
              <span>Swipe ➜ เพื่อดูทั้งหมด</span>
            </div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-4 min-w-full snap-x snap-mandatory pb-3">
              {MOOD_OPTIONS.map((mood, index) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodQuickSelect(mood.title)}
                  className="min-w-[260px] snap-start rounded-3xl border border-white/10 bg-gradient-to-br from-night-lighter/90 to-night/80 p-5 text-left transition hover:-translate-y-1 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm uppercase tracking-wide text-muted">{mood.title}</p>
                    <span className="text-[10px] text-primary-light">{index + 1}/6</span>
                  </div>
                  <p className="mt-3 text-surface-light text-base font-semibold line-clamp-2">{mood.description}</p>
                  <p className="mt-2 text-xs text-muted">{mood.tagline}</p>
                  <span className="mt-4 inline-flex items-center text-xs font-semibold text-primary-light">
                    ไปดูร้านโหมดนี้ →
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live mood highlights */}
      {moodHighlights.length > 0 && (
        <section className="bg-night-light py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-muted">Live Mood Highlights</p>
                <h2 className="text-2xl font-display font-semibold text-surface-light">ร้านที่คนบอกว่าบรรยากาศสุด</h2>
              </div>
              <Link href="/popular" className="text-sm text-primary-light hover:text-primary">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {moodHighlights.map((item) => (
                <Link
                  href={`/store/${item.slug}`}
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-night/70 p-5 transition hover:-translate-y-1 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted">Mood Match</p>
                      <p className="text-lg font-semibold text-surface-light">{item.mood.title}</p>
                    </div>
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-muted">
                      สดใหม่
                    </span>
                  </div>
                  <p className="text-xl font-display text-surface-light mb-2 line-clamp-1">{item.name}</p>
                  <p className="text-sm text-muted mb-3">
                    {item.province || "ทั่วไทย"} · {item.categories.slice(0, 2).join(", ")}
                  </p>
                  <p className="text-xs text-muted/80">
                    “{item.mood.description}” — คลิกดูคะแนน 6 มิติ
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* T107: Banner Ad Section */}
      {bannerAds.length > 0 && (
        <section className="py-8 bg-night">
          <div className="container mx-auto px-4">
            <BannerAd ad={bannerAds[0]} />
          </div>
        </section>
      )}

      {/* T107: Sponsored Stores Section */}
      {!hasActiveFilters && sponsoredAds.length > 0 && (
        <section className="py-10 bg-night relative">
          <div className="section-divider absolute top-0 left-0 right-0" />
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl md:text-2xl font-display font-bold text-surface-light">
                ร้านสปอนเซอร์
              </h2>
              <span className="badge-gold px-3 py-1 rounded-full text-xs font-semibold">
                Sponsored
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sponsoredAds.map((ad) => (
                <SponsoredStoreCard key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Stores Section - Show only when no filters active */}
      {!hasActiveFilters && featuredStores && featuredStores.length > 0 && (
        <section className="py-10 bg-night-light relative">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center">
                  <StarIcon className="w-4 h-4 text-gold" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-surface-light">
                    ร้านแนะนำ
                  </h2>
                  <p className="text-xs text-muted">คัดสรรร้านยอดนิยมสำหรับคุณ</p>
                </div>
              </div>
              <Link
                href="/stores?featured=true"
                className="hidden sm:flex items-center gap-2 text-sm text-primary-light hover:text-primary transition-colors group"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <StoreGrid
              stores={featuredStores}
              isLoading={isFeaturedLoading}
              emptyMessage="ไม่มีร้านแนะนำในขณะนี้"
            />
            <div className="mt-6 sm:hidden text-center">
              <Link
                href="/stores?featured=true"
                className="inline-flex items-center gap-2 text-sm text-primary-light hover:text-primary transition-colors"
              >
                <span>ดูร้านแนะนำทั้งหมด</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* All Stores Section */}
      <section className="py-10 bg-night relative">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="container mx-auto px-4">
          {/* Section Header with Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <GridIcon className="w-4 h-4 text-primary-light" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-surface-light">
                    {hasActiveFilters ? "ผลการค้นหา" : "ร้านทั้งหมด"}
                  </h2>
                  {totalCount > 0 && (
                    <p className="text-sm text-muted">
                      พบ {totalCount.toLocaleString()} ร้าน
                      {permitted && sortByDistance && " • เรียงจากใกล้สุด"}
                    </p>
                  )}
                </div>
              </div>

              {/* Distance Sort Toggle */}
              {permitted && (
                <button
                  onClick={() => setSortByDistance(!sortByDistance)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${sortByDistance
                    ? "bg-gradient-primary text-white shadow-glow-blue"
                    : "bg-night-lighter text-muted hover:text-surface-light border border-white/10"
                    }`}
                >
                  <LocationIcon className="w-4 h-4" />
                  ร้านใกล้ฉัน
                </button>
              )}
              {!permitted && !geoLoading && (
                <span className="text-xs text-muted flex items-center gap-2">
                  <LocationIcon className="w-4 h-4" />
                  อนุญาตตำแหน่งเพื่อดูร้านใกล้คุณ
                </span>
              )}
            </div>

            {/* Filters */}
            <StoreFilters
              provinces={provinces}
              categories={categories}
              selectedProvince={selectedProvince}
              selectedCategory={selectedCategory}
              selectedMinPrice={minPrice}
              selectedMaxPrice={maxPrice}
              onProvinceChange={handleProvinceChange}
              onCategoryChange={handleCategoryChange}
              onPriceChange={handlePriceChange}
              isLoading={isProvincesLoading || isCategoriesLoading}
            />
          </div>

          {/* Stores Grid */}
          <StoreGrid
            stores={stores}
            isLoading={isStoresLoading}
            emptyMessage={
              hasActiveFilters
                ? "ไม่พบร้านที่ตรงกับเงื่อนไข"
                : "ไม่มีร้านในระบบ"
            }
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </section>

      {/* Upcoming Events Section - Show only when no filters active */}
      {!hasActiveFilters && upcomingEvents.length > 0 && (
        <section className="py-10 bg-night relative">
          <div className="section-divider absolute top-0 left-0 right-0" />
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-accent-light" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-surface-light">
                    อีเวนท์ที่กำลังจะมาถึง
                  </h2>
                  <p className="text-xs text-muted">กิจกรรมสุดพิเศษจากร้านชั้นนำ</p>
                </div>
              </div>
              <Link
                href="/events"
                className="hidden sm:flex items-center gap-2 text-sm text-primary-light hover:text-primary transition-colors group"
              >
                <span>ดูทั้งหมด</span>
                <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <EventShowcase
              events={upcomingEvents}
              isLoading={isEventsLoading}
              emptyMessage="ไม่มีอีเวนท์ในขณะนี้"
            />
            <div className="mt-6 text-center">
              <Link
                href="/events"
                className="inline-flex items-center gap-2 text-sm text-primary-light hover:text-primary transition-colors sm:hidden"
              >
                <span>ดูอีเวนท์ทั้งหมด</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                href="/events/calendar"
                className="inline-flex items-center gap-2 ml-4 text-sm text-muted hover:text-surface-light transition-colors"
              >
                <CalendarIcon className="w-4 h-4" />
                <span>ดูปฏิทินอีเวนท์</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/10 to-gold/10" />
        <div className="absolute inset-0 bg-starfield opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
              <SparkleIcon className="w-4 h-4 text-gold" />
              <span className="text-sm text-gold-light font-medium">สำหรับเจ้าของร้าน</span>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-surface-light mb-6">
              คุณมีร้านอยากลงโฆษณา?
            </h2>
            <p className="text-lg text-muted mb-10 max-w-xl mx-auto">
              ลงร้านของคุณกับ {SITE_NAME} เพื่อเข้าถึงลูกค้าที่กำลังมองหาร้านกลางคืนในประเทศไทย
            </p>

            <Link
              href="/advertise"
              className="inline-flex items-center gap-3 px-8 py-4 btn-gold text-lg font-semibold rounded-2xl group"
            >
              <span>ลงโฆษณากับเรา</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// Icon Components
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
