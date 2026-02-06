import Link from "next/link";
import Image from "next/image";
import { cn, resolveImageUrl, getStoreOpenStatus } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { useIsFavorite } from "@/hooks/useFavorites";
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

  const openStatus = getStoreOpenStatus(store.openTime, store.closeTime);
  const { isFavorite, toggle: toggleFavorite } = useIsFavorite(store.id);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite();
  };

  return (
    <Link
      href={`/store/${store.slug}`}
      className={cn(
        "group block rounded-xl overflow-hidden cursor-pointer",
        "bg-gradient-to-br from-night-lighter to-night border border-white/10",
        "hover:border-primary/40 transition-all duration-300",
        "shadow-lg hover:shadow-xl hover:shadow-primary/10",
        store.isFeatured && "ring-1 ring-gold/30",
        className
      )}
    >
      {/* Image Container - Compact with overlay content */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={resolveImageUrl(store.logoUrl) || resolveImageUrl(store.bannerUrl) || "/logo.svg"}
          alt={store.name}
          fill
          className={cn(
            "transition-transform duration-500 group-hover:scale-105",
            store.logoUrl || store.bannerUrl ? "object-cover" : "object-contain p-6 opacity-30"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/50 to-transparent" />

        {/* Top Row: Featured + Status */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-start gap-2">
          {/* Featured Badge */}
          {store.isFeatured && (
            <span className="badge-gold px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shrink-0">
              <StarIcon className="w-2.5 h-2.5" />
              แนะนำ
            </span>
          )}

          {/* Open/Closed Badge */}
          <div className="ml-auto">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-medium backdrop-blur-sm",
              openStatus.isOpen
                ? "bg-success/20 text-success border border-success/30"
                : "bg-night/60 text-muted border border-white/10"
            )}>
              {openStatus.statusText}
            </span>
          </div>
        </div>

        {/* Bottom Content Overlay */}
        <div className="absolute bottom-0 left-0 right-10 p-3">
          {/* Title */}
          <h3 className="font-display text-sm font-bold text-surface-light group-hover:text-primary-light transition-colors duration-300 line-clamp-1 mb-1">
            {store.name}
          </h3>

          {/* Meta Row */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-[10px] text-muted min-w-0">
              {/* Location */}
              {store.provinceName && (
                <span className="flex items-center gap-1 shrink-0">
                  <MapPinIcon className="w-3 h-3 text-accent" />
                  <span className="line-clamp-1">{store.provinceName}</span>
                </span>
              )}
              {/* Distance */}
              {store.distanceKm !== undefined && store.distanceKm !== null && (
                <span className="flex items-center gap-1 text-primary-light shrink-0">
                  <LocationIcon className="w-3 h-3" />
                  {store.distanceKm.toFixed(1)} กม.
                </span>
              )}
            </div>
            {/* Price */}
            {priceLabel && (
              <span className="text-[10px] font-semibold text-gold shrink-0">
                {priceLabel}
              </span>
            )}
          </div>

          {/* Categories */}
          {store.categoryNames.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {store.categoryNames.slice(0, 2).map((category) => (
                <span
                  key={category}
                  className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/10 text-muted backdrop-blur-sm"
                >
                  {category}
                </span>
              ))}
              {store.categoryNames.length > 2 && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-white/10 text-muted backdrop-blur-sm">
                  +{store.categoryNames.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Favorite Button - Bottom right */}
        <button
          onClick={handleFavoriteClick}
          className={cn(
            "absolute bottom-2 right-2 p-1.5 rounded-full backdrop-blur-sm transition-all duration-300",
            "hover:scale-110 active:scale-95",
            isFavorite
              ? "bg-error/20 text-error border border-error/30"
              : "bg-night/60 text-muted hover:text-error border border-white/10 hover:border-error/30"
          )}
          aria-label={isFavorite ? "ลบออกจากรายการโปรด" : "เพิ่มในรายการโปรด"}
        >
          <HeartIcon className="w-4 h-4" filled={isFavorite} />
        </button>
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

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
