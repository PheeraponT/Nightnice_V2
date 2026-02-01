import Link from "next/link";
import Image from "next/image";
import { cn, resolveImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { EventListDto } from "@/lib/api";

interface EventCardProps {
  event: EventListDto;
  className?: string;
  compact?: boolean;
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

function formatEventDate(startDate: string, endDate: string | null): string {
  const start = new Date(startDate);
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  };

  if (!endDate || startDate === endDate) {
    return start.toLocaleDateString("th-TH", options);
  }

  const end = new Date(endDate);
  return `${start.toLocaleDateString("th-TH", options)} - ${end.toLocaleDateString("th-TH", options)}`;
}

function formatPrice(price: number | null, priceMax: number | null): string {
  if (price === null) return "";
  if (price === 0) return "ฟรี";
  if (priceMax && priceMax > price) {
    return `฿${price.toLocaleString()} - ฿${priceMax.toLocaleString()}`;
  }
  return `฿${price.toLocaleString()}`;
}

export function EventCard({ event, className, compact = false }: EventCardProps) {
  const eventTypeLabel = EVENT_TYPE_LABELS[event.eventType] || event.eventType;
  const eventTypeColor = EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.Other;
  const priceText = formatPrice(event.price, event.priceMax);
  const dateText = formatEventDate(event.startDate, event.endDate);

  // Compact version for sidebar/embedded display
  if (compact) {
    return (
      <Link
        href={`/events/${event.slug}`}
        className={cn(
          "group block rounded-xl overflow-hidden bg-night border border-white/5 hover:border-primary/30 transition-all",
          className
        )}
      >
        {/* Image */}
        <div className="relative aspect-[16/9] overflow-hidden">
          {event.imageUrl ? (
            <Image
              src={resolveImageUrl(event.imageUrl) || ""}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <ImagePlaceholder aspectRatio="video" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-night/80 to-transparent" />

          {/* Event Type Badge */}
          <span className={cn(
            "absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-medium border backdrop-blur-sm",
            eventTypeColor
          )}>
            {eventTypeLabel}
          </span>

          {/* Date */}
          <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
            <span className="text-[10px] text-surface-light font-medium flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              {dateText}
            </span>
            {priceText && (
              <span className={cn(
                "text-[10px] font-medium",
                event.price === 0 ? "text-success" : "text-gold"
              )}>
                {priceText}
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium text-sm text-surface-light group-hover:text-primary-light transition-colors line-clamp-1">
            {event.title}
          </h3>
          {event.startTime && (
            <p className="mt-1 text-xs text-muted flex items-center gap-1">
              <ClockIcon className="w-3 h-3" />
              {event.startTime}
            </p>
          )}
        </div>
      </Link>
    );
  }

  // Full version for grid display
  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group block glass-card overflow-hidden",
        event.isFeatured && "card-featured",
        className
      )}
    >
      {/* Image Container - Portrait poster ratio */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {event.imageUrl ? (
          <Image
            src={resolveImageUrl(event.imageUrl) || ""}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
          />
        ) : (
          <ImagePlaceholder aspectRatio="portrait" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Event Type Badge */}
          <span className={cn(
            "px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm",
            eventTypeColor
          )}>
            {eventTypeLabel}
          </span>

          {/* Featured Badge */}
          {event.isFeatured && (
            <span className="badge-gold px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <StarIcon className="w-3 h-3" />
              แนะนำ
            </span>
          )}
        </div>

        {/* Date Badge */}
        <div className="absolute bottom-3 left-3">
          <span className="badge-primary px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm">
            <CalendarIcon className="w-3 h-3" />
            {dateText}
          </span>
        </div>

        {/* Price Badge */}
        {priceText && (
          <div className="absolute bottom-3 right-3">
            <span className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
              event.price === 0
                ? "bg-success/20 text-success border border-success/30"
                : "bg-gold/20 text-gold border border-gold/30"
            )}>
              {priceText}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-display text-lg font-semibold text-surface-light group-hover:text-primary-light transition-colors duration-300 line-clamp-2">
          {event.title}
        </h3>

        {/* Store Name */}
        <p className="mt-1.5 text-sm text-muted flex items-center gap-1.5">
          <StoreIcon className="w-3.5 h-3.5 text-accent" />
          <span className="line-clamp-1">{event.storeName}</span>
        </p>

        {/* Location */}
        {event.provinceName && (
          <p className="mt-1 text-sm text-muted/70 flex items-center gap-1.5">
            <MapPinIcon className="w-3.5 h-3.5" />
            <span className="line-clamp-1">{event.provinceName}</span>
          </p>
        )}

        {/* Time */}
        {event.startTime && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <span className="text-sm text-muted flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5" />
              {event.startTime}
              {event.endTime && ` - ${event.endTime}`}
            </span>
          </div>
        )}
      </div>
    </Link>
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

function StoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
