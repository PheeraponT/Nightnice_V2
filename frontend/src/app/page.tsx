"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
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
      <section className="relative py-20 md:py-32 bg-hero bg-starfield overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-2 h-2 bg-gold rounded-full animate-twinkle" />
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-primary-light rounded-full animate-twinkle" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-accent-light rounded-full animate-twinkle" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-gold-light rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }} />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo Animation */}
            <div className="mb-8 flex justify-center">
              <div className="relative w-28 h-28 md:w-36 md:h-36 animate-float">
                <Image
                  src="/logo.svg"
                  alt={SITE_NAME}
                  fill
                  className="object-contain drop-shadow-2xl"
                  priority
                />
                {/* Moon glow effect */}
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-glow blur-xl -z-10" />
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 leading-tight">
              <span className="text-gradient">ค้นหาร้านกลางคืน</span>
              <br />
              <span className="text-surface-light">ที่ดีที่สุดในประเทศไทย</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto leading-relaxed">
              {SITE_NAME} รวบรวมร้านบาร์ ผับ ร้านเหล้า และร้านอาหารกลางคืนชั้นนำทั่วประเทศ
              ค้นหาร้านที่ใช่สำหรับคืนนี้
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="ค้นหาร้าน ชื่อร้าน หรือสถานที่..."
                autoFocus
              />
            </div>

            {/* Quick Category Links */}
            <div className="flex flex-wrap justify-center gap-3">
              {categories.slice(0, 5).map((category, index) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`pill-category ${selectedCategory === category.slug ? 'active' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-night to-transparent" />
      </section>

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
        <section className="py-16 bg-night relative">
          <div className="section-divider absolute top-0 left-0 right-0" />
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-surface-light">
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
        <section className="py-16 bg-night-light relative">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center">
                  <StarIcon className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-surface-light">
                    ร้านแนะนำ
                  </h2>
                  <p className="text-sm text-muted">คัดสรรร้านยอดนิยมสำหรับคุณ</p>
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
      <section className="py-16 bg-night relative">
        <div className="section-divider absolute top-0 left-0 right-0" />
        <div className="container mx-auto px-4">
          {/* Section Header with Filters */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <GridIcon className="w-5 h-5 text-primary-light" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-surface-light">
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
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    sortByDistance
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
