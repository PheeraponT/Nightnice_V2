"use client";

import { useState, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useQuery } from "@tanstack/react-query";
import { api, type StoreMapDto } from "@/lib/api";
import { useProvinces } from "@/hooks/useProvinces";
import { useCategories } from "@/hooks/useCategories";
import { useGeolocation, formatDistance } from "@/hooks/useGeolocation";
import { cn, resolveImageUrl, checkIfOpen } from "@/lib/utils";

// Dynamically import map to avoid SSR issues
const StoreMap = dynamic(
  () => import("@/components/map/StoreMap").then((mod) => mod.StoreMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-night-lighter">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-muted text-sm">กำลังโหลดแผนที่...</span>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>();
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedStore, setSelectedStore] = useState<StoreMapDto | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sortByDistance, setSortByDistance] = useState(true);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  // Geolocation
  const { latitude, longitude, permitted, loading: geoLoading } = useGeolocation();

  // Fetch data
  const { data: provinces = [], isLoading: isProvincesLoading } = useProvinces();
  const { data: categories = [], isLoading: isCategoriesLoading } = useCategories();

  const { data: stores = [], isLoading: isStoresLoading } = useQuery({
    queryKey: ["map-stores", selectedProvince, selectedCategory, latitude, longitude, sortByDistance],
    queryFn: () =>
      api.public.getMapStores({
        province: selectedProvince,
        category: selectedCategory,
        lat: permitted && sortByDistance ? latitude ?? undefined : undefined,
        lng: permitted && sortByDistance ? longitude ?? undefined : undefined,
        sortByDistance: permitted && sortByDistance,
      }),
  });

  // Filter stores with valid coordinates and optionally by open status
  const validStores = useMemo(() => {
    let filtered = stores.filter(
      (s) => s.latitude && s.longitude && !isNaN(s.latitude) && !isNaN(s.longitude)
    );
    if (openNowOnly) {
      filtered = filtered.filter((s) => checkIfOpen(s.openTime, s.closeTime));
    }
    return filtered;
  }, [stores, openNowOnly]);

  const handleProvinceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value || undefined);
    setSelectedStore(null);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value || undefined);
    setSelectedStore(null);
  }, []);

  const handleStoreSelect = useCallback((store: StoreMapDto | null) => {
    setSelectedStore(store);
  }, []);

  const handleStoreClick = useCallback((store: StoreMapDto) => {
    setSelectedStore(store);
  }, []);

  const hasActiveFilters = selectedProvince || selectedCategory || openNowOnly;

  const handleClearFilters = useCallback(() => {
    setSelectedProvince(undefined);
    setSelectedCategory(undefined);
    setOpenNowOnly(false);
    setSelectedStore(null);
  }, []);


  return (
    <div className="h-screen bg-night flex flex-col overflow-hidden">
      {/* Compact Header */}
      <div className="bg-night/90 backdrop-blur-2xl border-b border-white/5 z-30 shrink-0">
        <div className="px-4 py-2.5">
          <div className="flex items-center gap-3">
            {/* Title */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/25 to-primary/25 flex items-center justify-center">
                <MapIcon className="w-3.5 h-3.5 text-accent-light" />
              </div>
              <div>
                <h1 className="text-sm font-display font-bold text-surface-light leading-tight">แผนที่ร้าน</h1>
                <p className="text-[10px] text-muted leading-tight">
                  {isStoresLoading ? "กำลังโหลด..." : `${validStores.length} ร้าน`}
                  {openNowOnly && !isStoresLoading && " • เปิดอยู่"}
                  {permitted && sortByDistance && !isStoresLoading && " • ใกล้ฉัน"}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-6 bg-white/10" />

            {/* Filters */}
            <div className="flex-1 flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {/* Province Filter */}
              <div className="relative shrink-0">
                <select
                  value={selectedProvince || ""}
                  onChange={handleProvinceChange}
                  disabled={isProvincesLoading}
                  className={cn(
                    "appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium cursor-pointer",
                    "bg-night border transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    selectedProvince
                      ? "border-primary/50 text-primary-light bg-primary/10"
                      : "border-white/10 text-muted hover:text-surface-light hover:border-white/20"
                  )}
                >
                  <option value="" className="bg-night text-surface-light">ทุกจังหวัด</option>
                  {provinces.map((province) => (
                    <option key={province.slug} value={province.slug} className="bg-night text-surface-light">
                      {province.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-muted" />
              </div>

              {/* Category Filter */}
              <div className="relative shrink-0">
                <select
                  value={selectedCategory || ""}
                  onChange={handleCategoryChange}
                  disabled={isCategoriesLoading}
                  className={cn(
                    "appearance-none pl-3 pr-7 py-1.5 rounded-lg text-xs font-medium cursor-pointer",
                    "bg-night border transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-accent/50",
                    selectedCategory
                      ? "border-accent/50 text-accent-light bg-accent/10"
                      : "border-white/10 text-muted hover:text-surface-light hover:border-white/20"
                  )}
                >
                  <option value="" className="bg-night text-surface-light">ทุกประเภท</option>
                  {categories.map((category) => (
                    <option key={category.slug} value={category.slug} className="bg-night text-surface-light">
                      {category.name}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none text-muted" />
              </div>

              {/* Open Now Toggle */}
              <button
                onClick={() => setOpenNowOnly(!openNowOnly)}
                className={cn(
                  "shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border",
                  openNowOnly
                    ? "bg-success/20 text-success border-success/30"
                    : "bg-night text-muted border-white/10 hover:text-surface-light hover:border-white/20"
                )}
              >
                <ClockIcon className="w-3 h-3" />
                เปิดอยู่
              </button>

              {/* Distance Sort Toggle */}
              {permitted && (
                <button
                  onClick={() => setSortByDistance(!sortByDistance)}
                  className={cn(
                    "shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 border",
                    sortByDistance
                      ? "bg-gradient-primary text-white border-transparent shadow-glow-blue"
                      : "bg-night text-muted border-white/10 hover:text-surface-light hover:border-white/20"
                  )}
                >
                  <LocationIcon className="w-3 h-3" />
                  ใกล้ฉัน
                </button>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="shrink-0 px-2 py-1.5 rounded-lg text-xs font-medium text-error/80 hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all flex items-center gap-1"
                >
                  <ClearIcon className="w-3 h-3" />
                  ล้าง
                </button>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className={cn(
                  "p-1.5 rounded-lg transition-all duration-200 border",
                  isSidebarOpen
                    ? "bg-primary/10 text-primary-light border-primary/30"
                    : "bg-night text-muted border-white/10 hover:text-surface-light hover:border-white/30"
                )}
                title={isSidebarOpen ? "ซ่อนรายการ" : "แสดงรายการ"}
              >
                <ListIcon className="w-4 h-4" />
              </button>
              <Link
                href="/stores"
                className="p-1.5 rounded-lg bg-night text-muted border border-white/10 hover:text-surface-light hover:border-white/30 transition-all duration-200"
                title="ดูแบบ Grid"
              >
                <GridIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Sidebar - Store List */}
        <div
          className={cn(
            "bg-night-light/50 border-r border-white/5 overflow-hidden flex flex-col transition-all duration-300",
            isSidebarOpen ? "w-full md:w-80 lg:w-96 h-48 md:h-full" : "w-0 h-0 md:h-full"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-3 border-b border-white/5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <StoreIcon className="w-4 h-4 text-primary-light" />
              <span className="text-sm font-medium text-surface-light">รายการร้าน</span>
            </div>
            <span className="text-[10px] text-muted bg-night/50 px-2 py-0.5 rounded-full">
              {validStores.length}
            </span>
          </div>

          {/* Store List */}
          <div className="flex-1 overflow-y-auto">
            {isStoresLoading ? (
              <div className="p-6 text-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <span className="text-muted text-xs">กำลังโหลด...</span>
              </div>
            ) : validStores.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-night/50 flex items-center justify-center mx-auto mb-3">
                  <MapPinIcon className="w-5 h-5 text-muted" />
                </div>
                <p className="text-muted text-sm">ไม่พบร้านที่มีพิกัด</p>
                <p className="text-muted/60 text-xs mt-1">ลองปรับตัวกรองใหม่</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {validStores.map((store) => {
                  const isOpen = checkIfOpen(store.openTime, store.closeTime);
                  return (
                    <button
                      key={store.id}
                      onClick={() => handleStoreClick(store)}
                      className={cn(
                        "w-full p-3 text-left transition-all duration-200 cursor-pointer",
                        "hover:bg-white/5",
                        selectedStore?.id === store.id && "bg-primary/10 border-l-2 border-primary"
                      )}
                    >
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-night">
                          {(store.bannerUrl || store.logoUrl) ? (
                            <Image
                              src={resolveImageUrl(store.bannerUrl || store.logoUrl) || ""}
                              alt={store.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted">
                              <StoreIcon className="w-5 h-5" />
                            </div>
                          )}
                          {/* Open Status Dot */}
                          <div className={cn(
                            "absolute top-1 right-1 w-2 h-2 rounded-full",
                            isOpen ? "bg-success" : "bg-muted/50"
                          )} />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-surface-light text-sm line-clamp-1">
                              {store.name}
                            </h3>
                            {store.distanceKm != null && (
                              <span className="shrink-0 text-[10px] text-primary-light font-medium px-1.5 py-0.5 rounded bg-primary/10">
                                {formatDistance(store.distanceKm)}
                              </span>
                            )}
                          </div>

                          {store.provinceName && (
                            <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                              <MapPinIcon className="w-2.5 h-2.5 text-accent" />
                              {store.provinceName}
                            </p>
                          )}

                          {store.categoryNames && store.categoryNames.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {store.categoryNames.slice(0, 2).map((cat) => (
                                <span key={cat} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted">
                                  {cat}
                                </span>
                              ))}
                              {store.categoryNames.length > 2 && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-muted">
                                  +{store.categoryNames.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="flex-1 relative">
          <StoreMap
            stores={validStores as any}
            selectedStore={selectedStore as any}
            onStoreSelect={handleStoreSelect as any}
            className="w-full h-full"
          />

          {/* Selected Store Info Card */}
          {selectedStore && (
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 animate-slide-up">
              <div className="bg-night/95 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden">
                {/* Card Image */}
                <div className="relative h-24">
                  {(selectedStore.bannerUrl || selectedStore.logoUrl) ? (
                    <Image
                      src={resolveImageUrl(selectedStore.bannerUrl || selectedStore.logoUrl) || ""}
                      alt={selectedStore.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-night-lighter to-night flex items-center justify-center">
                      <StoreIcon className="w-8 h-8 text-muted" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-night/60 backdrop-blur-sm text-muted hover:text-surface-light transition-colors"
                  >
                    <CloseIcon className="w-4 h-4" />
                  </button>

                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    {checkIfOpen(selectedStore.openTime, selectedStore.closeTime) ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-success/20 text-success border border-success/30 backdrop-blur-sm">
                        เปิดอยู่
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-night/60 text-muted border border-white/10 backdrop-blur-sm">
                        ปิดแล้ว
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-3">
                  <h3 className="font-display font-bold text-surface-light line-clamp-1">
                    {selectedStore.name}
                  </h3>

                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted">
                    {selectedStore.provinceName && (
                      <span className="flex items-center gap-1">
                        <MapPinIcon className="w-3 h-3 text-accent" />
                        {selectedStore.provinceName}
                      </span>
                    )}
                    {selectedStore.distanceKm != null && (
                      <span className="flex items-center gap-1 text-primary-light">
                        <LocationIcon className="w-3 h-3" />
                        {formatDistance(selectedStore.distanceKm)}
                      </span>
                    )}
                  </div>

                  {selectedStore.categoryNames && selectedStore.categoryNames.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedStore.categoryNames.slice(0, 3).map((cat) => (
                        <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-muted border border-white/5">
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link
                    href={`/store/${selectedStore.slug}`}
                    className="mt-3 block w-full text-center py-2 bg-gradient-to-r from-primary to-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    ดูรายละเอียด
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Icon Components
function MapIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
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

function ListIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
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

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
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

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function ClearIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}


