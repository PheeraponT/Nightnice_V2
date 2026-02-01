"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useStores } from "@/hooks/useStores";
import { useProvinces } from "@/hooks/useProvinces";
import { useCategories } from "@/hooks/useCategories";
import { useGeolocation } from "@/hooks/useGeolocation";
import { SearchBar } from "@/components/search/SearchBar";
import { StoreGrid } from "@/components/store/StoreGrid";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";
import { cn, checkIfOpen } from "@/lib/utils";

export default function StoresPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialProvince = searchParams.get("province") || undefined;
  const initialCategory = searchParams.get("category") || undefined;
  const initialPage = parseInt(searchParams.get("page") || "1", 10);
  const initialSearch = searchParams.get("q") || "";

  // State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(initialProvince);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [sortByDistance, setSortByDistance] = useState(true);
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const pageSize = 24;

  // Geolocation
  const { latitude, longitude, permitted, loading: geoLoading } = useGeolocation();

  // Queries
  const { data: provinces = [], isLoading: isProvincesLoading } = useProvinces();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();
  const { data: storesData, isLoading: isStoresLoading } = useStores({
    q: searchQuery || undefined,
    province: selectedProvince,
    category: selectedCategory,
    page: currentPage,
    pageSize,
    lat: permitted && sortByDistance ? latitude ?? undefined : undefined,
    lng: permitted && sortByDistance ? longitude ?? undefined : undefined,
    sortByDistance: permitted && sortByDistance,
  });

  const allStores = storesData?.items || [];

  // Filter by open now if enabled
  const stores = useMemo(() => {
    if (!openNowOnly) return allStores;
    return allStores.filter((store) => checkIfOpen(store.openTime, store.closeTime));
  }, [allStores, openNowOnly]);

  const totalPages = storesData?.totalPages || 1;
  const totalCount = openNowOnly ? stores.length : (storesData?.totalCount || 0);

  // Update URL when filters change
  const updateUrl = useCallback(
    (params: {
      province?: string;
      category?: string;
      page?: number;
      q?: string;
    }) => {
      const url = new URLSearchParams();
      if (params.province) url.set("province", params.province);
      if (params.category) url.set("category", params.category);
      if (params.page && params.page > 1) url.set("page", String(params.page));
      if (params.q) url.set("q", params.q);
      const queryString = url.toString();
      router.push(`/stores${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [router]
  );

  // Handlers
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
      updateUrl({ province: selectedProvince, category: selectedCategory, q: value });
    },
    [selectedProvince, selectedCategory, updateUrl]
  );

  const handleProvinceChange = useCallback(
    (province: string | undefined) => {
      setSelectedProvince(province);
      setCurrentPage(1);
      updateUrl({ province, category: selectedCategory, q: searchQuery });
    },
    [selectedCategory, searchQuery, updateUrl]
  );

  const handleCategoryChange = useCallback(
    (category: string | undefined) => {
      setSelectedCategory(category);
      setCurrentPage(1);
      updateUrl({ province: selectedProvince, category, q: searchQuery });
    },
    [selectedProvince, searchQuery, updateUrl]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateUrl({ province: selectedProvince, category: selectedCategory, page, q: searchQuery });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [selectedProvince, selectedCategory, searchQuery, updateUrl]
  );

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedProvince(undefined);
    setSelectedCategory(undefined);
    setOpenNowOnly(false);
    setCurrentPage(1);
    router.push("/stores", { scroll: false });
  }, [router]);

  const hasActiveFilters = searchQuery || selectedProvince || selectedCategory || openNowOnly;

  // Get selected names for display
  const selectedProvinceName = useMemo(() => {
    if (!selectedProvince) return null;
    return provinces.find((p) => p.slug === selectedProvince)?.name || selectedProvince;
  }, [selectedProvince, provinces]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find((c) => c.slug === selectedCategory)?.name || selectedCategory;
  }, [selectedCategory, categories]);

  return (
    <div className="min-h-screen bg-night">
      {/* Header */}
      <section className="relative py-12 md:py-16 bg-hero overflow-hidden">
        {/* Decorative stars */}
        <div className="absolute top-10 left-20 w-1.5 h-1.5 bg-gold rounded-full animate-twinkle" />
        <div className="absolute top-20 right-32 w-1 h-1 bg-primary-light rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-10 left-1/3 w-1 h-1 bg-accent-light rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <StoreIcon className="w-4 h-4 text-primary-light" />
              <span className="text-sm text-primary-light font-medium">Directory</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">ร้านทั้งหมด</span>
            </h1>
            <p className="text-muted mb-8 text-lg">
              ค้นหาและกรองร้านตามหมวดหมู่และจังหวัด
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="ค้นหาชื่อร้าน..."
              />
            </div>
          </div>
        </div>

        {/* Bottom gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-night to-transparent" />
      </section>

      {/* Filters Section */}
      <section className="py-6 bg-night-light border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Province Filter */}
            <Select
              options={[
                { value: "", label: "ทุกจังหวัด" },
                ...provinces.map((province) => ({
                  value: province.slug,
                  label: `${province.name} (${province.storeCount})`,
                })),
              ]}
              value={selectedProvince || ""}
              onChange={(e) => handleProvinceChange(e.target.value || undefined)}
              disabled={isProvincesLoading}
              label="จังหวัด"
              className="flex-1"
            />

            {/* Category Filter */}
            <Select
              options={[
                { value: "", label: "ทุกหมวดหมู่" },
                ...categories.map((category) => ({
                  value: category.slug,
                  label: `${category.name} (${category.storeCount})`,
                })),
              ]}
              value={selectedCategory || ""}
              onChange={(e) => handleCategoryChange(e.target.value || undefined)}
              disabled={isCategoriesLoading}
              label="หมวดหมู่"
              className="flex-1"
            />
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">ตัวกรอง:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-primary-light text-sm rounded-full border border-primary/30">
                  <SearchIcon className="w-3 h-3" />
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={() => handleSearchChange("")}
                    className="hover:text-white ml-1"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedProvinceName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent/15 text-accent-light text-sm rounded-full border border-accent/30">
                  <MapPinIcon className="w-3 h-3" />
                  {selectedProvinceName}
                  <button
                    onClick={() => handleProvinceChange(undefined)}
                    className="hover:text-white ml-1"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedCategoryName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold/15 text-gold-light text-sm rounded-full border border-gold/30">
                  <GridIcon className="w-3 h-3" />
                  {selectedCategoryName}
                  <button
                    onClick={() => handleCategoryChange(undefined)}
                    className="hover:text-white ml-1"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {openNowOnly && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-success/15 text-success text-sm rounded-full border border-success/30">
                  <ClockIcon className="w-3 h-3" />
                  เปิดอยู่ตอนนี้
                  <button
                    onClick={() => setOpenNowOnly(false)}
                    className="hover:text-white ml-1"
                  >
                    <CloseIcon className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button
                onClick={handleClearFilters}
                className="text-sm text-muted hover:text-surface-light transition-colors flex items-center gap-1"
              >
                <CloseIcon className="w-3.5 h-3.5" />
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="py-4 bg-night border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange(undefined)}
              className={`pill-category ${!selectedCategory ? 'active' : ''}`}
            >
              ทั้งหมด
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={`pill-category ${selectedCategory === category.slug ? 'active' : ''}`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <StoreIcon className="w-5 h-5 text-primary-light" />
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-surface-light">
                  {hasActiveFilters ? "ผลการค้นหา" : "ร้านทั้งหมด"}
                </h2>
                <p className="text-sm text-muted">
                  {isStoresLoading ? "กำลังโหลด..." : `พบ ${totalCount.toLocaleString()} ร้าน`}
                  {permitted && sortByDistance && !isStoresLoading && " • เรียงจากใกล้สุด"}
                </p>
              </div>
            </div>

            {/* View Options */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Open Now Toggle */}
              <button
                onClick={() => setOpenNowOnly(!openNowOnly)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                  openNowOnly
                    ? "bg-success/20 text-success border border-success/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                    : "bg-night-lighter text-muted hover:text-surface-light border border-white/10"
                )}
              >
                <ClockIcon className="w-4 h-4" />
                เปิดอยู่ตอนนี้
              </button>

              {/* Distance Sort Toggle */}
              {permitted && (
                <button
                  onClick={() => setSortByDistance(!sortByDistance)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
                    sortByDistance
                      ? "bg-gradient-primary text-white shadow-glow-blue"
                      : "bg-night-lighter text-muted hover:text-surface-light border border-white/10"
                  )}
                >
                  <LocationIcon className="w-4 h-4" />
                  ร้านใกล้ฉัน
                </button>
              )}
              <Link
                href="/map"
                className="flex items-center gap-2 px-4 py-2.5 bg-night-lighter border border-white/10 rounded-xl text-muted hover:text-surface-light hover:border-primary/30 hover:shadow-glow-blue transition-all duration-300"
              >
                <MapIcon className="w-4 h-4" />
                <span className="text-sm font-medium">ดูแผนที่</span>
              </Link>
            </div>
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
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// Icon Components
function StoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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
