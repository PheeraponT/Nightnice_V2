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
import { cn } from "@/lib/utils";

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

  const stores = storesData?.items || [];
  const totalPages = storesData?.totalPages || 1;
  const totalCount = storesData?.totalCount || 0;

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
    setCurrentPage(1);
    router.push("/stores", { scroll: false });
  }, [router]);

  const hasActiveFilters = searchQuery || selectedProvince || selectedCategory;

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
    <div className="min-h-screen bg-darker">
      {/* Header */}
      <section className="py-8 md:py-12 bg-gradient-to-b from-darker to-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-4xl font-bold mb-4">
              <span className="text-gradient">ร้านทั้งหมด</span>
            </h1>
            <p className="text-muted mb-6">
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
      </section>

      {/* Filters Section */}
      <section className="py-4 bg-dark border-b border-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Province Filter */}
            <div className="flex-1">
              <label className="block text-sm text-muted mb-2">จังหวัด</label>
              <select
                value={selectedProvince || ""}
                onChange={(e) => handleProvinceChange(e.target.value || undefined)}
                disabled={isProvincesLoading}
                className="w-full px-4 py-2.5 bg-darker border border-muted/30 rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">ทุกจังหวัด</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.slug}>
                    {province.name} ({province.storeCount})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="flex-1">
              <label className="block text-sm text-muted mb-2">หมวดหมู่</label>
              <select
                value={selectedCategory || ""}
                onChange={(e) => handleCategoryChange(e.target.value || undefined)}
                disabled={isCategoriesLoading}
                className="w-full px-4 py-2.5 bg-darker border border-muted/30 rounded-xl text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">ทุกหมวดหมู่</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name} ({category.storeCount})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted">ตัวกรอง:</span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                  &quot;{searchQuery}&quot;
                  <button
                    onClick={() => handleSearchChange("")}
                    className="hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {selectedProvinceName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-accent/20 text-accent text-sm rounded-full">
                  {selectedProvinceName}
                  <button
                    onClick={() => handleProvinceChange(undefined)}
                    className="hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              {selectedCategoryName && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/20 text-primary text-sm rounded-full">
                  {selectedCategoryName}
                  <button
                    onClick={() => handleCategoryChange(undefined)}
                    className="hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              )}

              <button
                onClick={handleClearFilters}
                className="text-sm text-muted hover:text-surface-light underline"
              >
                ล้างตัวกรองทั้งหมด
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Category Quick Links */}
      <section className="py-4 bg-dark/50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange(undefined)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                !selectedCategory
                  ? "bg-primary text-white"
                  : "bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20"
              )}
            >
              ทั้งหมด
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryChange(category.slug)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedCategory === category.slug
                    ? "bg-primary text-white"
                    : "bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stores Grid */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-surface-light">
                {hasActiveFilters ? "ผลการค้นหา" : "ร้านทั้งหมด"}
              </h2>
              <p className="text-sm text-muted mt-1">
                {isStoresLoading ? "กำลังโหลด..." : `พบ ${totalCount.toLocaleString()} ร้าน`}
                {permitted && sortByDistance && !isStoresLoading && " (เรียงจากใกล้สุด)"}
              </p>
            </div>

            {/* View Options */}
            <div className="flex items-center gap-2">
              {/* Distance Sort Toggle */}
              {permitted && (
                <button
                  onClick={() => setSortByDistance(!sortByDistance)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    sortByDistance
                      ? "bg-primary text-white"
                      : "bg-dark border border-muted/30 text-muted hover:text-surface-light"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ร้านใกล้ฉัน
                </button>
              )}
              <Link
                href="/map"
                className="flex items-center gap-2 px-4 py-2 bg-dark border border-muted/30 rounded-xl text-muted hover:text-surface-light hover:border-primary/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-sm">ดูแผนที่</span>
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
    </div>
  );
}
