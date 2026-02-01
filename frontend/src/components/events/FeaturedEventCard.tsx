import Link from "next/link";
import Image from "next/image";
import { cn, resolveImageUrl } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { EventListDto } from "@/lib/api";

interface FeaturedEventCardProps {
  event: EventListDto;
  className?: string;
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
    weekday: "short",
    day: "numeric",
    month: "short",
  };

  if (!endDate || startDate === endDate) {
    return start.toLocaleDateString("th-TH", options);
  }

  const end = new Date(endDate);
  const startStr = start.toLocaleDateString("th-TH", options);
  const endStr = end.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  return `${startStr} - ${endStr}`;
}

function formatPrice(price: number | null, priceMax: number | null): string {
  if (price === null) return "";
  if (price === 0) return "เข้าฟรี";
  if (priceMax && priceMax > price) {
    return `฿${price.toLocaleString()} - ฿${priceMax.toLocaleString()}`;
  }
  return `฿${price.toLocaleString()}`;
}

export function FeaturedEventCard({ event, className }: FeaturedEventCardProps) {
  const eventTypeLabel = EVENT_TYPE_LABELS[event.eventType] || event.eventType;
  const eventTypeColor = EVENT_TYPE_COLORS[event.eventType] || EVENT_TYPE_COLORS.Other;
  const priceText = formatPrice(event.price, event.priceMax);
  const dateText = formatEventDate(event.startDate, event.endDate);

  return (
    <Link
      href={`/events/${event.slug}`}
      className={cn(
        "group relative block rounded-xl overflow-hidden bg-gradient-to-br from-night-lighter to-night border border-white/10 hover:border-primary/40 transition-all duration-300",
        "shadow-lg hover:shadow-xl hover:shadow-primary/10",
        className
      )}
    >
      {/* Main Content Container */}
      <div className="flex flex-col sm:flex-row h-full">
        {/* Image Section */}
        <div className="relative w-full sm:w-2/5 aspect-[16/10] sm:aspect-auto sm:min-h-[180px] overflow-hidden">
          {event.imageUrl ? (
            <Image
              src={resolveImageUrl(event.imageUrl) || ""}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 40vw"
            />
          ) : (
            <ImagePlaceholder aspectRatio="video" />
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-night via-night/50 to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
            <span className="badge-gold px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <SparkleIcon className="w-3 h-3" />
              แนะนำ
            </span>
            <span className={cn(
              "px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm",
              eventTypeColor
            )}>
              {eventTypeLabel}
            </span>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative w-full sm:w-3/5 p-4 sm:p-5 flex flex-col justify-center">
          {/* Date & Time */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary-light text-xs font-medium">
              <CalendarIcon className="w-3.5 h-3.5" />
              {dateText}
            </span>
            {event.startTime && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent/10 text-accent-light text-xs font-medium">
                <ClockIcon className="w-3.5 h-3.5" />
                {event.startTime}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-display font-bold text-surface-light group-hover:text-primary-light transition-colors duration-300 mb-2 line-clamp-2">
            {event.title}
          </h3>

          {/* Store & Location */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted mb-3">
            <span className="flex items-center gap-1.5">
              <StoreIcon className="w-3.5 h-3.5 text-accent" />
              <span className="line-clamp-1">{event.storeName}</span>
            </span>
            {event.provinceName && (
              <span className="flex items-center gap-1.5">
                <MapPinIcon className="w-3.5 h-3.5" />
                <span>{event.provinceName}</span>
              </span>
            )}
          </div>

          {/* Footer: Price & CTA */}
          <div className="flex items-center justify-between pt-3 border-t border-white/10">
            {priceText ? (
              <span className={cn(
                "text-sm font-bold",
                event.price === 0 ? "text-success" : "text-gold"
              )}>
                {priceText}
              </span>
            ) : <span />}
            <span className="inline-flex items-center gap-1.5 text-primary-light text-xs font-medium group-hover:gap-2 transition-all duration-300">
              ดูรายละเอียด
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Icon Components
function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" />
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

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  );
}
