"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useEvents, useFeaturedEvents } from "@/hooks/useEvents";
import { useProvinces } from "@/hooks/useProvinces";
import { SearchBar } from "@/components/search/SearchBar";
import { EventGrid } from "@/components/events";
import { Pagination } from "@/components/ui/Pagination";
import { cn } from "@/lib/utils";

// Event types for filter
const EVENT_TYPES = [
  { value: "", label: "ทั้งหมด" },
  { value: "DjNight", label: "DJ Night" },
  { value: "LiveMusic", label: "ดนตรีสด" },
  { value: "Party", label: "ปาร์ตี้" },
  { value: "SpecialEvent", label: "อีเวนท์พิเศษ" },
  { value: "LadiesNight", label: "Ladies Night" },
  { value: "HappyHour", label: "Happy Hour" },
  { value: "Concert", label: "คอนเสิร์ต" },
  { value: "Promotion", label: "โปรโมชั่น" },
];

export default function EventsPage() {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string | undefined>();
  const [selectedEventType, setSelectedEventType] = useState<string | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Queries
  const { data: featuredEvents = [], isLoading: isFeaturedLoading } = useFeaturedEvents(4);
  const { data: eventsData, isLoading: isEventsLoading } = useEvents({
    q: searchQuery || undefined,
    province: selectedProvince,
    eventType: selectedEventType,
    page: currentPage,
    pageSize,
  });
  const { data: provinces = [] } = useProvinces();

  // Handlers
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleProvinceChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvince(e.target.value || undefined);
    setCurrentPage(1);
  }, []);

  const handleEventTypeChange = useCallback((type: string) => {
    setSelectedEventType(type || undefined);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const events = eventsData?.items || [];
  const totalPages = eventsData?.totalPages || 1;
  const totalCount = eventsData?.totalCount || 0;

  const hasActiveFilters = searchQuery || selectedProvince || selectedEventType;

  return (
    <div className="min-h-screen bg-night">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-night" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gradient-gold mb-4">
              กิจกรรม & อีเวนท์
            </h1>
            <p className="text-lg text-muted mb-8">
              ค้นหากิจกรรมและอีเวนท์สุดพิเศษจากร้านชั้นนำ DJ Night, Live Music, Party และอื่นๆ อีกมากมาย
            </p>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto">
              <SearchBar
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="ค้นหาอีเวนท์..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="sticky top-0 z-20 bg-night/95 backdrop-blur-lg border-b border-white/5 py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Event Type Pills */}
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleEventTypeChange(type.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm font-medium transition-all",
                    selectedEventType === type.value || (!selectedEventType && type.value === "")
                      ? "bg-primary text-white"
                      : "bg-dark-lighter text-muted hover:bg-dark-light hover:text-surface-light border border-white/10"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Province Filter */}
            <select
              value={selectedProvince || ""}
              onChange={handleProvinceChange}
              className="bg-dark-lighter border border-white/10 rounded-lg px-4 py-2 text-sm text-surface-light focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">ทุกจังหวัด</option>
              {provinces.map((province) => (
                <option key={province.slug} value={province.slug}>
                  {province.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Featured Events (only when no filters) */}
      {!hasActiveFilters && featuredEvents.length > 0 && (
        <section className="py-12 bg-gradient-to-b from-night to-dark">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-surface-light flex items-center gap-2">
                <StarIcon className="w-6 h-6 text-gold" />
                อีเวนท์แนะนำ
              </h2>
            </div>
            <EventGrid events={featuredEvents} isLoading={isFeaturedLoading} />
          </div>
        </section>
      )}

      {/* All Events */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-display font-bold text-surface-light flex items-center gap-2">
              <CalendarIcon className="w-6 h-6 text-primary-light" />
              {hasActiveFilters ? "ผลการค้นหา" : "อีเวนท์ที่กำลังจะมาถึง"}
              {totalCount > 0 && (
                <span className="text-base font-normal text-muted">
                  ({totalCount.toLocaleString()} รายการ)
                </span>
              )}
            </h2>

            <Link
              href="/events/calendar"
              className="text-sm text-primary-light hover:text-primary flex items-center gap-1"
            >
              <CalendarIcon className="w-4 h-4" />
              ดูปฏิทิน
            </Link>
          </div>

          <EventGrid
            events={events}
            isLoading={isEventsLoading}
            emptyMessage={hasActiveFilters ? "ไม่พบอีเวนท์ที่ค้นหา" : "ยังไม่มีอีเวนท์ในขณะนี้"}
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

// Icon Components
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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
