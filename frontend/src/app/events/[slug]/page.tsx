import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { api } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/constants";
import { resolveImageUrl, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { EventDetailClient } from "./EventDetailClient";

interface EventPageProps {
  params: Promise<{ slug: string }>;
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

async function getEvent(slug: string) {
  try {
    return await api.public.getEventBySlug(slug);
  } catch {
    return null;
  }
}

function formatThaiDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatPrice(price: number | null, priceMax: number | null): string {
  if (price === null) return "";
  if (price === 0) return "ฟรี";
  if (priceMax && priceMax > price) {
    return `฿${price.toLocaleString()} - ฿${priceMax.toLocaleString()}`;
  }
  return `฿${price.toLocaleString()}`;
}

type EventStatus = "ended" | "happening" | "upcoming";

function getEventStatus(
  startDate: string,
  endDate: string | null,
  startTime: string | null,
  endTime: string | null
): EventStatus {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Parse event start date
  const eventStartDate = new Date(startDate);
  const eventStart = new Date(eventStartDate.getFullYear(), eventStartDate.getMonth(), eventStartDate.getDate());

  // Parse event end date (use start date if no end date)
  const eventEndDateStr = endDate || startDate;
  const eventEndDate = new Date(eventEndDateStr);
  const eventEnd = new Date(eventEndDate.getFullYear(), eventEndDate.getMonth(), eventEndDate.getDate());

  // Parse times
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTimeMinutes = currentHour * 60 + currentMinute;

  let startTimeMinutes = 0;
  let endTimeMinutes = 24 * 60; // Default to end of day

  if (startTime) {
    const [h, m] = startTime.split(":").map(Number);
    startTimeMinutes = h * 60 + m;
  }

  if (endTime) {
    const [h, m] = endTime.split(":").map(Number);
    endTimeMinutes = h * 60 + m;
    // Handle overnight events (e.g., 22:00 - 02:00)
    if (endTimeMinutes < startTimeMinutes) {
      endTimeMinutes += 24 * 60;
    }
  }

  // Check if event has ended
  if (today > eventEnd) {
    return "ended";
  }

  // Check if on the last day and past end time
  if (today.getTime() === eventEnd.getTime()) {
    // For overnight events, check if we're past midnight portion
    if (endTimeMinutes > 24 * 60) {
      // Event ends next day morning
      if (currentTimeMinutes > (endTimeMinutes - 24 * 60)) {
        return "ended";
      }
    } else if (currentTimeMinutes > endTimeMinutes) {
      return "ended";
    }
  }

  // Check if event hasn't started yet
  if (today < eventStart) {
    return "upcoming";
  }

  // Check if on start day but before start time
  if (today.getTime() === eventStart.getTime() && currentTimeMinutes < startTimeMinutes) {
    return "upcoming";
  }

  // Event is happening
  return "happening";
}

const EVENT_STATUS_CONFIG: Record<EventStatus, { label: string; className: string }> = {
  ended: {
    label: "จบแล้ว",
    className: "bg-muted/20 text-muted",
  },
  happening: {
    label: "กำลังเกิดขึ้น",
    className: "bg-success/20 text-success animate-pulse",
  },
  upcoming: {
    label: "กำลังมาถึง",
    className: "bg-primary/20 text-primary-light",
  },
};

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    return {
      title: "ไม่พบอีเวนท์",
    };
  }

  const title = `${event.title} @ ${event.storeName}`;
  const description =
    event.description ||
    `${event.title} วันที่ ${formatThaiDate(event.startDate)} ที่ ${event.storeName} ${event.provinceName || ""}`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      type: "website",
      url: `${SITE_URL}/events/${event.slug}`,
      images: event.imageUrl ? [{ url: event.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: event.imageUrl ? [event.imageUrl] : undefined,
    },
    alternates: {
      canonical: `${SITE_URL}/events/${event.slug}`,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEvent(slug);

  if (!event) {
    notFound();
  }

  const eventTypeLabel = EVENT_TYPE_LABELS[event.eventType] || event.eventType;
  const priceText = formatPrice(event.price, event.priceMax);
  const eventStatus = getEventStatus(event.startDate, event.endDate, event.startTime, event.endTime);
  const statusConfig = EVENT_STATUS_CONFIG[eventStatus];

  // Event JSON-LD Schema
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    image: event.imageUrl,
    startDate: event.startTime
      ? `${event.startDate}T${event.startTime}:00`
      : event.startDate,
    endDate: event.endDate
      ? event.endTime
        ? `${event.endDate}T${event.endTime}:00`
        : event.endDate
      : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.storeName,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.provinceName,
        addressCountry: "TH",
      },
      ...(event.latitude && event.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: event.latitude,
          longitude: event.longitude,
        },
      }),
    },
    offers: event.price !== null ? {
      "@type": "Offer",
      price: event.price,
      priceCurrency: "THB",
      availability: "https://schema.org/InStock",
      url: event.ticketUrl || `${SITE_URL}/events/${event.slug}`,
    } : undefined,
    organizer: {
      "@type": "Organization",
      name: event.storeName,
      url: `${SITE_URL}/store/${event.storeSlug}`,
    },
  };

  return (
    <>
      {/* Event JSON-LD Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
      />

      <div className="min-h-screen bg-night">
        {/* Back Button - Mobile */}
        <div className="lg:hidden sticky top-0 z-20 bg-night/95 backdrop-blur-lg border-b border-white/5 px-4 py-3">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-muted hover:text-surface-light transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            กลับไปหน้าอีเวนท์
          </Link>
        </div>

        <div className="container mx-auto px-4 py-6 lg:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
            {/* Left Column - Poster Image */}
            <div className="lg:col-span-4 xl:col-span-3">
              <div className="lg:sticky lg:top-6">
                {/* Back Button - Desktop */}
                <div className="hidden lg:block mb-4">
                  <Link
                    href="/events"
                    className="inline-flex items-center gap-2 text-muted hover:text-surface-light transition-colors"
                  >
                    <ArrowLeftIcon className="w-4 h-4" />
                    กลับไปหน้าอีเวนท์
                  </Link>
                </div>

                {/* Poster */}
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-primary/20 via-dark to-night">
                  {event.imageUrl ? (
                    <Image
                      src={resolveImageUrl(event.imageUrl) || ""}
                      alt={event.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <PosterPlaceholderIcon className="w-20 h-20 text-muted/30" />
                    </div>
                  )}

                  {/* Featured Badge */}
                  {event.isFeatured && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1.5 badge-gold px-3 py-1.5 rounded-full text-xs font-semibold">
                        <StarIcon className="w-3.5 h-3.5" />
                        แนะนำ
                      </span>
                    </div>
                  )}
                </div>

                {/* Ticket Link - Desktop */}
                {event.ticketUrl && (
                  <a
                    href={event.ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hidden lg:flex items-center justify-center gap-2 w-full mt-4 py-3.5 px-6 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold shadow-glow hover:shadow-glow-lg transition-all"
                  >
                    <TicketIcon className="w-5 h-5" />
                    ซื้อตั๋ว / จองที่นั่ง
                  </a>
                )}
              </div>
            </div>

            {/* Right Column - Event Info */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6">
              {/* Header */}
              <div>
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {/* Event Type Badge */}
                  <Badge variant="primary" size="md">
                    {eventTypeLabel}
                  </Badge>

                  {/* Event Status Badge */}
                  <span className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold",
                    statusConfig.className
                  )}>
                    {eventStatus === "happening" && (
                      <span className="w-2 h-2 rounded-full bg-success" />
                    )}
                    {statusConfig.label}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-3xl md:text-4xl font-display font-bold text-surface-light mb-3">
                  {event.title}
                </h1>

                {/* Store Link */}
                <Link
                  href={`/store/${event.storeSlug}`}
                  className="inline-flex items-center gap-2 text-lg text-primary-light hover:text-primary transition-colors"
                >
                  <StoreIcon className="w-5 h-5" />
                  {event.storeName}
                </Link>
              </div>

              {/* Key Info Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Date */}
                <div className="glass-card p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-primary-light" />
                  </div>
                  <p className="text-xs text-muted mb-1">วันที่</p>
                  <p className="text-sm font-medium text-surface-light">
                    {new Date(event.startDate).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>

                {/* Time */}
                <div className="glass-card p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ClockIcon className="w-5 h-5 text-primary-light" />
                  </div>
                  <p className="text-xs text-muted mb-1">เวลา</p>
                  <p className="text-sm font-medium text-surface-light">
                    {event.startTime || "-"}
                  </p>
                </div>

                {/* Price */}
                <div className="glass-card p-4 text-center">
                  <div className={cn(
                    "w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center",
                    event.price === 0 ? "bg-success/10" : "bg-gold/10"
                  )}>
                    <TicketIcon className={cn(
                      "w-5 h-5",
                      event.price === 0 ? "text-success" : "text-gold"
                    )} />
                  </div>
                  <p className="text-xs text-muted mb-1">ราคา</p>
                  <p className={cn(
                    "text-sm font-medium",
                    event.price === 0 ? "text-success" : "text-gold"
                  )}>
                    {priceText || "-"}
                  </p>
                </div>

                {/* Location */}
                <div className="glass-card p-4 text-center">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MapPinIcon className="w-5 h-5 text-accent" />
                  </div>
                  <p className="text-xs text-muted mb-1">สถานที่</p>
                  <p className="text-sm font-medium text-surface-light truncate">
                    {event.provinceName || "-"}
                  </p>
                </div>
              </div>

              {/* Full Date Info */}
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 text-surface-light">
                  <CalendarIcon className="w-5 h-5 text-primary-light flex-shrink-0" />
                  <div>
                    <span className="font-medium">{formatThaiDate(event.startDate)}</span>
                    {event.endDate && event.endDate !== event.startDate && (
                      <span> - {formatThaiDate(event.endDate)}</span>
                    )}
                    {event.startTime && (
                      <span className="text-muted ml-2">
                        เวลา {event.startTime}
                        {event.endTime && ` - ${event.endTime}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              {event.description && (
                <div className="glass-card p-5">
                  <h2 className="text-lg font-display font-semibold text-surface-light mb-3">
                    รายละเอียด
                  </h2>
                  <p className="text-muted whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {/* Store Info Card */}
              <div className="glass-card p-5">
                <h2 className="text-lg font-display font-semibold text-surface-light mb-4">
                  จัดโดย
                </h2>

                <Link
                  href={`/store/${event.storeSlug}`}
                  className="flex items-center gap-4 p-3 -mx-1 rounded-lg hover:bg-dark-lighter transition-colors"
                >
                  {event.storeLogoUrl ? (
                    <Image
                      src={resolveImageUrl(event.storeLogoUrl) || ""}
                      alt={event.storeName}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <StoreIcon className="w-6 h-6 text-primary-light" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-surface-light">{event.storeName}</p>
                    {event.provinceName && (
                      <p className="text-sm text-muted">{event.provinceName}</p>
                    )}
                  </div>
                  <ArrowLeftIcon className="w-4 h-4 text-muted rotate-180 ml-auto flex-shrink-0" />
                </Link>

                {/* Contact Links */}
                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {event.storePhone && (
                    <a
                      href={`tel:${event.storePhone}`}
                      className="flex items-center gap-2 p-3 rounded-lg bg-dark-lighter hover:bg-dark-light transition-colors"
                    >
                      <PhoneIcon className="w-4 h-4 text-success" />
                      <span className="text-sm text-surface-light truncate">{event.storePhone}</span>
                    </a>
                  )}
                  {event.storeLineId && (
                    <a
                      href={`https://line.me/ti/p/~${event.storeLineId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg bg-dark-lighter hover:bg-dark-light transition-colors"
                    >
                      <LineIcon className="w-4 h-4 text-[#06C755]" />
                      <span className="text-sm text-surface-light truncate">{event.storeLineId}</span>
                    </a>
                  )}
                  {event.googleMapUrl && (
                    <a
                      href={event.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-3 rounded-lg bg-dark-lighter hover:bg-dark-light transition-colors"
                    >
                      <MapPinIcon className="w-4 h-4 text-accent" />
                      <span className="text-sm text-surface-light">ดูแผนที่</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Share & Actions (Client Component) */}
              <EventDetailClient event={event} />

              {/* Ticket Link - Mobile */}
              {event.ticketUrl && (
                <a
                  href={event.ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="lg:hidden flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl bg-gradient-to-r from-primary to-accent text-white font-semibold text-lg shadow-glow hover:shadow-glow-lg transition-all"
                >
                  <TicketIcon className="w-5 h-5" />
                  ซื้อตั๋ว / จองที่นั่ง
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Icon Components
function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
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

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
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

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
    </svg>
  );
}

function LineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.349 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
    </svg>
  );
}

function PosterPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}
