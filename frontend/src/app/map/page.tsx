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
import { Select } from "@/components/ui/Select";
import { cn, resolveImageUrl } from "@/lib/utils";

// Dynamically import map to avoid SSR issues
const StoreMap = dynamic(
  () => import("@/components/map/StoreMap").then((mod) => mod.StoreMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-night-lighter rounded-xl">
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

  // Filter stores with valid coordinates
  const validStores = useMemo(() => {
    return stores.filter(
      (s) => s.latitude && s.longitude && !isNaN(s.latitude) && !isNaN(s.longitude)
    );
  }, [stores]);

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

  return (
    <div className="min-h-screen bg-night">
      {/* Header */}
      <div className="bg-night-light border-b border-white/5 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                <MapIcon className="w-5 h-5 text-accent-light" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-display font-bold text-surface-light">แผนที่ร้าน</h1>
                <p className="text-sm text-muted">
                  {isStoresLoading ? "กำลังโหลด..." : `พบ ${validStores.length} ร้านบนแผนที่`}
                  {permitted && sortByDistance && !isStoresLoading && " • เรียงจากใกล้สุด"}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-end gap-3">
              {/* Province Filter */}
              <Select
                options={[
                  { value: "", label: "ทุกจังหวัด" },
                  ...provinces.map((province) => ({
                    value: province.slug,
                    label: province.name,
                  })),
                ]}
                value={selectedProvince || ""}
                onChange={handleProvinceChange}
                disabled={isProvincesLoading}
                className="w-40"
              />

              {/* Category Filter */}
              <Select
                options={[
                  { value: "", label: "ทุกประเภท" },
                  ...categories.map((category) => ({
                    value: category.slug,
                    label: category.name,
                  })),
                ]}
                value={selectedCategory || ""}
                onChange={handleCategoryChange}
                disabled={isCategoriesLoading}
                className="w-40"
              />

              {/* Distance Sort Toggle */}
              {permitted && (
                <button
                  onClick={() => setSortByDistance(!sortByDistance)}
                  className={cn(
                    "px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                    sortByDistance
                      ? "bg-gradient-primary text-white shadow-glow-blue"
                      : "bg-night border border-white/10 text-muted hover:text-surface-light"
                  )}
                >
                  <LocationIcon className="w-4 h-4" />
                  ใกล้ฉัน
                </button>
              )}

              {/* Toggle Sidebar */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="px-4 py-2.5 bg-night border border-white/10 rounded-xl text-surface-light text-sm hover:bg-white/5 transition-all duration-300 md:hidden flex items-center gap-2"
              >
                <ListIcon className="w-4 h-4" />
                {isSidebarOpen ? "ซ่อนรายการ" : "แสดงรายการ"}
              </button>

              {/* Back to Stores */}
              <Link
                href="/stores"
                className="px-4 py-2.5 bg-night border border-white/10 rounded-xl text-muted text-sm hover:text-surface-light hover:border-primary/30 transition-all duration-300 flex items-center gap-2"
              >
                <GridIcon className="w-4 h-4" />
                <span className="hidden sm:inline">ดูแบบ Grid</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-140px)]">
        {/* Sidebar - Store List */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 bg-night-light border-r border-white/5 overflow-hidden flex flex-col transition-all duration-300",
            isSidebarOpen ? "h-64 md:h-full" : "h-0 md:h-full"
          )}
        >
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-display font-semibold text-surface-light flex items-center gap-2">
              <StoreIcon className="w-4 h-4 text-primary-light" />
              รายการร้าน
            </h2>
            <span className="text-xs text-muted bg-night px-2 py-1 rounded-full">
              {validStores.length} ร้าน
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isStoresLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
                <span className="text-muted text-sm">กำลังโหลด...</span>
              </div>
            ) : validStores.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 rounded-full bg-night flex items-center justify-center mx-auto mb-3">
                  <MapPinIcon className="w-6 h-6 text-muted" />
                </div>
                <p className="text-muted text-sm">ไม่พบร้านที่มีพิกัด</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {validStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleStoreClick(store)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-white/5 transition-all duration-200",
                      selectedStore?.id === store.id && "bg-primary/10 border-l-2 border-primary"
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-night">
                        {(store.bannerUrl || store.logoUrl) ? (
                          <Image
                            src={resolveImageUrl(store.bannerUrl || store.logoUrl) || ""}
                            alt={store.name}
                            width={64}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted">
                            <StoreIcon className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-surface-light truncate text-sm">
                            {store.name}
                          </h3>
                          {store.distanceKm != null && (
                            <span className="flex-shrink-0 text-xs text-primary-light font-medium badge-blue px-1.5 py-0.5 rounded-full">
                              {formatDistance(store.distanceKm)}
                            </span>
                          )}
                        </div>
                        {store.provinceName && (
                          <p className="text-xs text-muted truncate flex items-center gap-1 mt-0.5">
                            <MapPinIcon className="w-3 h-3 text-accent" />
                            {store.provinceName}
                          </p>
                        )}
                        {store.categoryNames && store.categoryNames.length > 0 && (
                          <p className="text-xs text-muted/70 truncate mt-0.5">
                            {store.categoryNames.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
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
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 glass-card p-4 shadow-xl animate-slide-up">
              <div className="flex gap-3">
                {/* Image */}
                <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-night">
                  {(selectedStore.bannerUrl || selectedStore.logoUrl) ? (
                    <Image
                      src={resolveImageUrl(selectedStore.bannerUrl || selectedStore.logoUrl) || ""}
                      alt={selectedStore.name}
                      width={80}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted">
                      <StoreIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-semibold text-surface-light truncate">
                    {selectedStore.name}
                  </h3>
                  {selectedStore.provinceName && (
                    <p className="text-sm text-muted flex items-center gap-1">
                      <MapPinIcon className="w-3 h-3 text-accent" />
                      {selectedStore.provinceName}
                    </p>
                  )}
                  {selectedStore.categoryNames && selectedStore.categoryNames.length > 0 && (
                    <p className="text-xs text-muted/70 truncate">
                      {selectedStore.categoryNames.join(", ")}
                    </p>
                  )}
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setSelectedStore(null)}
                  className="text-muted hover:text-surface-light transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              <Link
                href={`/store/${selectedStore.slug}`}
                className="mt-3 block w-full text-center py-2.5 btn-gradient text-white text-sm font-medium rounded-xl"
              >
                ดูรายละเอียดร้าน
              </Link>
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
