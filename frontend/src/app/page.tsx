"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useStores, useFeaturedStores } from "@/hooks/useStores";
import { useProvinces } from "@/hooks/useProvinces";
import { useCategories } from "@/hooks/useCategories";
import { useAds } from "@/hooks/useAds";
import { useGeolocation } from "@/hooks/useGeolocation";
import { SearchBar } from "@/components/search/SearchBar";
import { StoreFilters } from "@/components/search/StoreFilters";
import { StoreGrid } from "@/components/store/StoreGrid";
import { Pagination } from "@/components/ui/Pagination";
import { Badge } from "@/components/ui/Badge";
import { BannerAd } from "@/components/ads/BannerAd";
import { SponsoredStoreCard } from "@/components/ads/SponsoredStoreCard";
import { SITE_NAME } from "@/lib/constants";

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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-gradient-to-b from-darker to-dark">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              <span className="text-gradient">ค้นหาร้านกลางคืน</span>
              <br />
              <span className="text-surface-light">ที่ดีที่สุดในประเทศไทย</span>
            </h1>
            <p className="text-lg text-muted mb-8">
              {SITE_NAME} รวบรวมร้านบาร์ ผับ ร้านเหล้า และร้านอาหารกลางคืนชั้นนำทั่วประเทศ
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="ค้นหาร้าน ชื่อร้าน หรือสถานที่..."
                autoFocus
              />
            </div>

            {/* Quick Category Links */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {categories.slice(0, 5).map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category.slug
                      ? "bg-primary text-white"
                      : "bg-dark-lighter text-muted hover:text-surface-light hover:bg-muted/20"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* T107: Banner Ad Section */}
      {bannerAds.length > 0 && (
        <section className="py-6 bg-dark">
          <div className="container mx-auto px-4">
            <BannerAd ad={bannerAds[0]} />
          </div>
        </section>
      )}

      {/* T107: Sponsored Stores Section */}
      {!hasActiveFilters && sponsoredAds.length > 0 && (
        <section className="py-12 bg-dark border-b border-muted/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-surface-light">
                ร้านสปอนเซอร์
              </h2>
              <Badge variant="accent" size="sm">
                Sponsored
              </Badge>
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
        <section className="py-12 bg-dark">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl md:text-2xl font-bold text-surface-light">
                  ร้านแนะนำ
                </h2>
                <Badge variant="primary" size="sm">
                  แนะนำ
                </Badge>
              </div>
              <Link
                href="/stores?featured=true"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                ดูทั้งหมด →
              </Link>
            </div>
            <StoreGrid
              stores={featuredStores}
              isLoading={isFeaturedLoading}
              emptyMessage="ไม่มีร้านแนะนำในขณะนี้"
            />
          </div>
        </section>
      )}

      {/* All Stores Section */}
      <section className="py-12 bg-darker">
        <div className="container mx-auto px-4">
          {/* Section Header with Filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-surface-light">
                  {hasActiveFilters ? "ผลการค้นหา" : "ร้านทั้งหมด"}
                </h2>
                {totalCount > 0 && (
                  <p className="text-sm text-muted mt-1">
                    พบ {totalCount.toLocaleString()} ร้าน
                    {permitted && sortByDistance && " (เรียงจากใกล้สุด)"}
                  </p>
                )}
              </div>
              {/* Distance Sort Toggle */}
              {permitted && (
                <button
                  onClick={() => setSortByDistance(!sortByDistance)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    sortByDistance
                      ? "bg-primary text-white"
                      : "bg-dark text-muted hover:text-surface-light"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ร้านใกล้ฉัน
                </button>
              )}
              {!permitted && !geoLoading && (
                <span className="text-xs text-muted">
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

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-surface-light mb-4">
            คุณมีร้านอยากลงโฆษณา?
          </h2>
          <p className="text-muted mb-6 max-w-xl mx-auto">
            ลงร้านของคุณกับ {SITE_NAME} เพื่อเข้าถึงลูกค้าที่กำลังมองหาร้านกลางคืนในประเทศไทย
          </p>
          <Link
            href="/advertise"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
          >
            <span>ลงโฆษณากับเรา</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
