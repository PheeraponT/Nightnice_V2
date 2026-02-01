import Link from "next/link";
import Image from "next/image";
import { cn, resolveImageUrl } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { StoreListDto } from "@/lib/api";
import { PRICE_RANGES } from "@/lib/constants";

interface StoreCardProps {
  store: StoreListDto;
  className?: string;
}

export function StoreCard({ store, className }: StoreCardProps) {
  const priceLabel = store.priceRange
    ? PRICE_RANGES.find((p) => p.value === store.priceRange)?.label
    : null;

  const isOpen = checkIfOpen(store.openTime ?? undefined, store.closeTime ?? undefined);

  return (
    <Link
      href={`/store/${store.slug}`}
      className={cn(
        "group block glass-card overflow-hidden",
        store.isFeatured && "card-featured",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {(store.bannerUrl || store.logoUrl) ? (
          <Image
            src={resolveImageUrl(store.bannerUrl || store.logoUrl) || ""}
            alt={store.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <ImagePlaceholder aspectRatio="video" />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
          {/* Featured Badge */}
          {store.isFeatured && (
            <span className="badge-gold px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <StarIcon className="w-3 h-3" />
              แนะนำ
            </span>
          )}

          {/* Open/Closed Badge */}
          <span className={cn(
            "ml-auto px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm",
            isOpen
              ? "bg-success/20 text-success border border-success/30"
              : "bg-night/60 text-muted border border-white/10"
          )}>
            {isOpen ? "เปิดอยู่" : "ปิดแล้ว"}
          </span>
        </div>

        {/* Distance Badge (if available) */}
        {store.distanceKm !== undefined && store.distanceKm !== null && (
          <div className="absolute bottom-3 left-3">
            <span className="badge-blue px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 backdrop-blur-sm">
              <LocationIcon className="w-3 h-3" />
              {store.distanceKm.toFixed(1)} กม.
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-display text-lg font-semibold text-surface-light group-hover:text-primary-light transition-colors duration-300 line-clamp-1">
          {store.name}
        </h3>

        {/* Location */}
        {store.provinceName && (
          <p className="mt-1.5 text-sm text-muted flex items-center gap-1.5">
            <MapPinIcon className="w-3.5 h-3.5 text-accent" />
            <span className="line-clamp-1">{store.provinceName}</span>
          </p>
        )}

        {/* Categories */}
        {store.categoryNames.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {store.categoryNames.slice(0, 2).map((category) => (
              <Badge key={category} variant="default" size="sm">
                {category}
              </Badge>
            ))}
            {store.categoryNames.length > 2 && (
              <Badge variant="default" size="sm">
                +{store.categoryNames.length - 2}
              </Badge>
            )}
          </div>
        )}

        {/* Meta Info */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
          {/* Price Range */}
          {priceLabel && (
            <span className="text-gold flex items-center gap-1">
              {priceLabel}
            </span>
          )}

          {/* Opening Hours */}
          {store.openTime && store.closeTime && (
            <span className="text-muted flex items-center gap-1.5">
              <ClockIcon className="w-3.5 h-3.5" />
              {store.openTime} - {store.closeTime}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// Helper function to check if store is currently open
function checkIfOpen(openTime?: string, closeTime?: string): boolean {
  if (!openTime || !closeTime) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openHour, openMin] = openTime.split(':').map(Number);
  const [closeHour, closeMin] = closeTime.split(':').map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  // Handle overnight hours (e.g., 20:00 - 02:00)
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes <= closeMinutes;
  }

  return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
}

// Icon Components
function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
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
