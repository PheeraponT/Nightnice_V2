"use client";

import Link from "next/link";
import Image from "next/image";
import type { EventListDto } from "@/lib/api";
import { cn, resolveImageUrl } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

interface EventShowcaseProps {
  events: EventListDto[];
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

// Event type labels in Thai
const EVENT_TYPE_LABELS: Record<string, string> = {
  DjNight: "DJ Night",
  LiveMusic: "ดนตรีสด",
  Party: "ปาร์ตี้",
  SpecialEvent: "อีเวนท์พิเศษ",
  LadiesNight: "Ladies Night",
  HappyHour: "Happy Hour",
  ThemeNight: "Theme Night",
  Concert: "คอนเสิร์ต",
  Promotion: "โปรโมชั่น",
  Other: "อื่นๆ",
};

// Event type colors
const EVENT_TYPE_COLORS: Record<string, string> = {
  DjNight: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  LiveMusic: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Party: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  SpecialEvent: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  LadiesNight: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  HappyHour: "bg-green-500/20 text-green-300 border-green-500/30",
  ThemeNight: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  Concert: "bg-red-500/20 text-red-300 border-red-500/30",
  Promotion: "bg-teal-500/20 text-teal-300 border-teal-500/30",
  Other: "bg-gray-500/20 text-gray-300 border-gray-500/30",
};

function formatEventDate(startDate: string): string {
  const date = new Date(startDate);
  return date.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

function formatPrice(price: number | null): string {
  if (price === null) return "";
  if (price === 0) return "ฟรี";
  return `฿${price.toLocaleString()}`;
}

export function EventShowcase({
  events,
  className,
  isLoading = false,
  emptyMessage = "ไม่พบอีเวนท์ที่ค้นหา",
}: EventShowcaseProps) {
  if (isLoading) {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-3", className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <CompactEventSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center">
          <CalendarIcon className="w-8 h-8 text-accent/50" />
        </div>
        <p className="text-lg font-display text-surface-light mb-1">{emptyMessage}</p>
        <p className="text-sm text-muted">
          รอติดตามอีเวนท์สุดพิเศษจากร้านชั้นนำเร็วๆ นี้
        </p>
      </div>
    );
  }

  // Take up to 4 events for compact display
  const displayEvents = events.slice(0, 4);
  const eventCount = displayEvents.length;

  // Responsive grid for portrait cards
  const gridClass = eventCount === 1
    ? "grid-cols-2 sm:grid-cols-4"
    : eventCount === 2
      ? "grid-cols-2 sm:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className={cn("grid gap-3", gridClass, className)}>
      {displayEvents.map((event) => (
        <CompactEventCard
          key={event.id}
          event={event}
        />
      ))}
    </div>
  );
}

// Compact Event Card
interface CompactEventCardProps {
  event: EventListDto;
}

function CompactEventCard({ event }: CompactEventCardProps) {
  const eventTypeLabel = EVENT_TYPE_LABELS[event.eventType] || event.eventType;
  const eventTypeColor = EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.Other;
  const priceText = formatPrice(event.price);
  const dateText = formatEventDate(event.startDate);

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group relative block rounded-xl overflow-hidden cursor-pointer",
        "bg-gradient-to-br from-night-lighter to-night border border-white/10",
        "hover:border-primary/40 transition-all duration-300",
        "shadow-lg hover:shadow-xl hover:shadow-primary/10"
      )}
    >
      {/* Image Container - Portrait for poster images */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={resolveImageUrl(event.imageUrl) || ""}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <ImagePlaceholder aspectRatio="video" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2">
          {/* Event Type */}
          <span className={cn(
            "px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm shrink-0",
            eventTypeColor
          )}>
            {eventTypeLabel}
          </span>

          {/* Featured Badge */}
          {event.isFeatured && (
            <span className="badge-gold px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shrink-0">
              <SparkleIcon className="w-2.5 h-2.5" />
              แนะนำ
            </span>
          )}
        </div>

        {/* Bottom Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          {/* Title */}
          <h3 className="font-display text-sm font-bold text-surface-light group-hover:text-primary-light transition-colors duration-300 line-clamp-1 mb-1">
            {event.title}
          </h3>

          {/* Meta Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] text-muted min-w-0">
              <span className="flex items-center gap-1 shrink-0">
                <CalendarIcon className="w-3 h-3" />
                {dateText}
              </span>
              {event.startTime && (
                <span className="flex items-center gap-1 shrink-0">
                  <ClockIcon className="w-3 h-3" />
                  {event.startTime}
                </span>
              )}
            </div>
            {priceText && (
              <span className={cn(
                "text-[10px] font-semibold shrink-0",
                event.price === 0 ? "text-success" : "text-gold"
              )}>
                {priceText}
              </span>
            )}
          </div>

          {/* Store Name */}
          <p className="mt-1 text-[10px] text-muted/80 flex items-center gap-1 line-clamp-1">
            <StoreIcon className="w-3 h-3 text-accent shrink-0" />
            {event.storeName}
          </p>
        </div>
      </div>
    </Link>
  );
}

function CompactEventSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden bg-night-lighter border border-white/10 animate-pulse">
      <div className="relative aspect-[3/4]">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="absolute top-2 left-2 h-5 w-16 bg-muted/20 rounded-full" />
        <div className="absolute bottom-3 left-3 right-3">
          <div className="h-4 bg-muted/20 rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted/20 rounded w-1/2 mb-1" />
          <div className="h-3 bg-muted/20 rounded w-1/3" />
        </div>
      </div>
    </div>
  );
}

// Icon Components
function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
    </svg>
  );
}

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
    </svg>
  );
}
