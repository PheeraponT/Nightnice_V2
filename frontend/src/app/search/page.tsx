"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useStores } from "@/hooks/useStores";
import { useProvinces } from "@/hooks/useProvinces";
import { useCategories } from "@/hooks/useCategories";
import { SearchBar } from "@/components/search/SearchBar";
import { StoreGrid } from "@/components/store/StoreGrid";
import { Pagination } from "@/components/ui/Pagination";
import { Select } from "@/components/ui/Select";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get initial values from URL
  const initialQuery = searchParams.get("q") || "";
  const initialProvince = searchParams.get("province") || undefined;
  const initialCategory = searchParams.get("category") || undefined;
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  // State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(initialProvince);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(initialCategory);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const pageSize = 24;

  // Focus search input on mount
  useEffect(() => {
    const searchInput = document.querySelector('input[type="text"]') as HTMLInputElement;
    if (searchInput && !initialQuery) {
      searchInput.focus();
    }
  }, [initialQuery]);

  // Queries
  const { data: provinces = [] } = useProvinces();
  const { data: categories = [] } = useCategories();
  const { data: storesData, isLoading: isStoresLoading } = useStores({
    q: searchQuery || undefined,
    province: selectedProvince,
    category: selectedCategory,
    page: currentPage,
    pageSize,
  });

  const stores = storesData?.items || [];
  const totalPages = storesData?.totalPages || 1;
  const totalCount = storesData?.totalCount || 0;

  // Update URL when filters change
  const updateUrl = useCallback(
    (params: { q?: string; province?: string; category?: string; page?: number }) => {
      const url = new URLSearchParams();
      if (params.q) url.set("q", params.q);
      if (params.province) url.set("province", params.province);
      if (params.category) url.set("category", params.category);
      if (params.page && params.page > 1) url.set("page", String(params.page));
      const queryString = url.toString();
      router.push(`/search${queryString ? `?${queryString}` : ""}`, { scroll: false });
    },
    [router]
  );

  // Handlers
  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchQuery(value);
      setCurrentPage(1);
      updateUrl({ q: value, province: selectedProvince, category: selectedCategory });
    },
    [selectedProvince, selectedCategory, updateUrl]
  );

  const handleProvinceChange = useCallback(
    (province: string | undefined) => {
      setSelectedProvince(province);
      setCurrentPage(1);
      updateUrl({ q: searchQuery, province, category: selectedCategory });
    },
    [searchQuery, selectedCategory, updateUrl]
  );

  const handleCategoryChange = useCallback(
    (category: string | undefined) => {
      setSelectedCategory(category);
      setCurrentPage(1);
      updateUrl({ q: searchQuery, province: selectedProvince, category });
    },
    [searchQuery, selectedProvince, updateUrl]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      updateUrl({ q: searchQuery, province: selectedProvince, category: selectedCategory, page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [searchQuery, selectedProvince, selectedCategory, updateUrl]
  );

  const hasActiveFilters = searchQuery || selectedProvince || selectedCategory;

  return (
    <div className="min-h-screen bg-night">
      {/* Search Header */}
      <section className="relative py-12 md:py-16 bg-gradient-hero overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <SearchIcon className="w-4 h-4 text-primary-light" />
              <span className="text-sm text-primary-light font-medium">ค้นหา</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-display font-bold mb-4 text-surface-light">
              ค้นหาร้าน
            </h1>
            <p className="text-muted mb-8 text-lg">
              ค้นหาร้านที่คุณต้องการจากทั่วประเทศไทย
            </p>

            {/* Large Search Bar */}
            <div className="max-w-2xl mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="พิมพ์ชื่อร้านที่ต้องการค้นหา..."
                autoFocus
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 bg-night-light border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
            <Select
              options={[
                { value: "", label: "ทุกจังหวัด" },
                ...provinces.map((p) => ({
                  value: p.slug,
                  label: `${p.name} (${p.storeCount})`,
                })),
              ]}
              value={selectedProvince || ""}
              onChange={(e) => handleProvinceChange(e.target.value || undefined)}
              label="จังหวัด"
              className="flex-1"
            />
            <Select
              options={[
                { value: "", label: "ทุกหมวดหมู่" },
                ...categories.map((c) => ({
                  value: c.slug,
                  label: `${c.name} (${c.storeCount})`,
                })),
              ]}
              value={selectedCategory || ""}
              onChange={(e) => handleCategoryChange(e.target.value || undefined)}
              label="หมวดหมู่"
              className="flex-1"
            />
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <StoreIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-display font-semibold text-surface-light">
                  {hasActiveFilters ? "ผลการค้นหา" : "ร้านทั้งหมด"}
                </h2>
                <p className="text-sm text-muted">
                  {isStoresLoading ? "กำลังค้นหา..." : `พบ ${totalCount.toLocaleString()} ร้าน`}
                </p>
              </div>
            </div>

            <Link
              href="/stores"
              className="flex items-center gap-2 px-4 py-2.5 bg-night-lighter border border-white/10 rounded-xl text-muted hover:text-surface-light hover:border-primary/30 transition-all duration-200 cursor-pointer"
            >
              <GridIcon className="w-4 h-4" />
              <span className="text-sm font-medium hidden sm:inline">ดูทั้งหมด</span>
            </Link>
          </div>

          {/* No Query State */}
          {!hasActiveFilters && !isStoresLoading && stores.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-night-lighter flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-10 h-10 text-muted" />
              </div>
              <h3 className="text-xl font-display font-semibold text-surface-light mb-2">
                เริ่มค้นหาร้าน
              </h3>
              <p className="text-muted max-w-md mx-auto">
                พิมพ์ชื่อร้านหรือคำค้นหาในช่องด้านบน หรือเลือกจังหวัดและหมวดหมู่เพื่อกรองผลลัพธ์
              </p>
            </div>
          )}

          {/* Stores Grid */}
          {(hasActiveFilters || stores.length > 0) && (
            <StoreGrid
              stores={stores}
              isLoading={isStoresLoading}
              emptyMessage="ไม่พบร้านที่ตรงกับคำค้นหา"
            />
          )}

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

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
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

function GridIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
