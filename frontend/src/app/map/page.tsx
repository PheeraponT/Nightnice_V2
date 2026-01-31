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
import { cn, resolveImageUrl } from "@/lib/utils";

// Dynamically import map to avoid SSR issues
const StoreMap = dynamic(
  () => import("@/components/map/StoreMap").then((mod) => mod.StoreMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-darker rounded-xl">
        <div className="text-muted">กำลังโหลดแผนที่...</div>
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
    <div className="min-h-screen bg-darker">
      {/* Header */}
      <div className="bg-dark border-b border-muted/20 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-surface-light">แผนที่ร้าน</h1>
              <p className="text-sm text-muted">
                {isStoresLoading ? "กำลังโหลด..." : `พบ ${validStores.length} ร้านบนแผนที่`}
                {permitted && sortByDistance && !isStoresLoading && " (เรียงจากใกล้สุด)"}
              </p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Province Filter */}
              <select
                value={selectedProvince || ""}
                onChange={handleProvinceChange}
                disabled={isProvincesLoading}
                className="px-4 py-2 bg-darker border border-muted/30 rounded-lg text-surface-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">ทุกจังหวัด</option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.slug}>
                    {province.name}
                  </option>
                ))}
              </select>

              {/* Category Filter */}
              <select
                value={selectedCategory || ""}
                onChange={handleCategoryChange}
                disabled={isCategoriesLoading}
                className="px-4 py-2 bg-darker border border-muted/30 rounded-lg text-surface-light text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">ทุกประเภท</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Distance Sort Toggle */}
              {permitted && (
                <button
                  onClick={() => setSortByDistance(!sortByDistance)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                    sortByDistance
                      ? "bg-primary text-white"
                      : "bg-darker border border-muted/30 text-muted hover:text-surface-light"
                  )}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  ใกล้ฉัน
                </button>
              )}

              {/* Toggle Sidebar */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="px-4 py-2 bg-darker border border-muted/30 rounded-lg text-surface-light text-sm hover:bg-muted/10 transition-colors md:hidden"
              >
                {isSidebarOpen ? "ซ่อนรายการ" : "แสดงรายการ"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row h-[calc(100vh-140px)]">
        {/* Sidebar - Store List */}
        <div
          className={cn(
            "w-full md:w-80 lg:w-96 bg-dark border-r border-muted/20 overflow-hidden flex flex-col transition-all",
            isSidebarOpen ? "h-64 md:h-full" : "h-0 md:h-full"
          )}
        >
          <div className="p-4 border-b border-muted/20">
            <h2 className="font-semibold text-surface-light">รายการร้าน</h2>
          </div>

          <div className="flex-1 overflow-y-auto">
            {isStoresLoading ? (
              <div className="p-4 text-center text-muted">กำลังโหลด...</div>
            ) : validStores.length === 0 ? (
              <div className="p-4 text-center text-muted">ไม่พบร้านที่มีพิกัด</div>
            ) : (
              <div className="divide-y divide-muted/10">
                {validStores.map((store) => (
                  <button
                    key={store.id}
                    onClick={() => handleStoreClick(store)}
                    className={cn(
                      "w-full p-4 text-left hover:bg-muted/10 transition-colors",
                      selectedStore?.id === store.id && "bg-primary/10 border-l-2 border-primary"
                    )}
                  >
                    <div className="flex gap-3">
                      {/* Thumbnail */}
                      <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden bg-darker">
                        {(store.bannerUrl || store.logoUrl) ? (
                          <Image
                            src={resolveImageUrl(store.bannerUrl || store.logoUrl) || ""}
                            alt={store.name}
                            width={64}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                            ไม่มีรูป
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-surface-light truncate">
                            {store.name}
                          </h3>
                          {store.distanceKm != null && (
                            <span className="flex-shrink-0 text-xs text-primary font-medium">
                              {formatDistance(store.distanceKm)}
                            </span>
                          )}
                        </div>
                        {store.provinceName && (
                          <p className="text-xs text-muted truncate">{store.provinceName}</p>
                        )}
                        {store.categoryNames && store.categoryNames.length > 0 && (
                          <p className="text-xs text-muted/70 truncate">
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
            <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-dark border border-muted/30 rounded-xl p-4 shadow-xl">
              <div className="flex gap-3">
                {/* Image */}
                <div className="flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden bg-darker">
                  {(selectedStore.bannerUrl || selectedStore.logoUrl) ? (
                    <Image
                      src={resolveImageUrl(selectedStore.bannerUrl || selectedStore.logoUrl) || ""}
                      alt={selectedStore.name}
                      width={80}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                      ไม่มีรูป
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-surface-light truncate">
                    {selectedStore.name}
                  </h3>
                  {selectedStore.provinceName && (
                    <p className="text-sm text-muted">{selectedStore.provinceName}</p>
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
                  className="text-muted hover:text-surface-light"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <Link
                href={`/store/${selectedStore.slug}`}
                className="mt-3 block w-full text-center py-2 bg-gradient-to-r from-primary to-accent text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
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
