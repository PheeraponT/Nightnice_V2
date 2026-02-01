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

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedProvince(undefined);
    setSelectedEventType(undefined);
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
      {/* Compact Hero Section */}
      <section className="relative py-10 md:py-14 bg-hero overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/10 via-transparent to-night" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 mb-4">
              <CalendarIcon className="w-4 h-4 text-accent-light" />
              <span className="text-xs text-accent-light font-medium">กิจกรรมพิเศษ</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-light mb-3">
              อีเวนท์ & กิจกรรม
            </h1>
            <p className="text-sm text-muted mb-6">
              ค้นหากิจกรรมสุดพิเศษจากร้านชั้นนำ DJ Night, Live Music, Party และอื่นๆ
            </p>

            {/* Search Bar */}
            <div className="max-w-md mx-auto">
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
      <section className="sticky top-0 z-20 bg-night/95 backdrop-blur-lg border-b border-white/5 py-3">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
            {/* Event Type Pills - Scrollable on mobile */}
            <div className="w-full md:w-auto overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              <div className="flex gap-2 min-w-max">
                {EVENT_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => handleEventTypeChange(type.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
                      selectedEventType === type.value || (!selectedEventType && type.value === "")
                        ? "bg-primary text-white shadow-glow-blue"
                        : "bg-night-lighter text-muted hover:text-surface-light border border-white/10 hover:border-white/20"
                    )}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Province Filter & Clear */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="relative">
                <select
                  value={selectedProvince || ""}
                  onChange={handleProvinceChange}
                  className={cn(
                    "appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-medium cursor-pointer",
                    "bg-night-lighter border transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    selectedProvince
                      ? "border-accent/50 text-accent-light bg-accent/10"
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
                <ChevronDownIcon className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-muted" />
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-error/80 hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-all"
                >
                  <ClearIcon className="w-3 h-3" />
                  <span>ล้าง</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events (only when no filters) */}
      {!hasActiveFilters && featuredEvents.length > 0 && (
        <section className="py-8 bg-gradient-to-b from-night to-night-light">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center">
                <StarIcon className="w-4 h-4 text-gold" />
              </div>
              <h2 className="text-lg font-display font-bold text-surface-light">
                อีเวนท์แนะนำ
              </h2>
            </div>
            <EventGrid events={featuredEvents} isLoading={isFeaturedLoading} />
          </div>
        </section>
      )}

      {/* All Events */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="w-4 h-4 text-primary-light" />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-surface-light">
                  {hasActiveFilters ? "ผลการค้นหา" : "อีเวนท์ทั้งหมด"}
                </h2>
                {totalCount > 0 && (
                  <p className="text-xs text-muted">
                    พบ {totalCount.toLocaleString()} รายการ
                  </p>
                )}
              </div>
            </div>

            <Link
              href="/events/calendar"
              className="text-xs text-primary-light hover:text-primary flex items-center gap-1 px-3 py-1.5 rounded-lg border border-primary/30 hover:border-primary/50 transition-colors"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              ปฏิทิน
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
