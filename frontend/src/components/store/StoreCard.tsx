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

  return (
    <Link
      href={`/store/${store.slug}`}
      className={cn(
        "group block rounded-card overflow-hidden",
        "bg-dark-lighter border border-muted/20",
        "hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10",
        "transition-all duration-300",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-video overflow-hidden">
        {(store.bannerUrl || store.logoUrl) ? (
          <Image
            src={resolveImageUrl(store.bannerUrl || store.logoUrl) || ""}
            alt={store.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <ImagePlaceholder aspectRatio="video" />
        )}

        {/* Featured Badge */}
        {store.isFeatured && (
          <div className="absolute top-2 right-2">
            <Badge variant="primary" size="sm">
              แนะนำ
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-surface-light group-hover:text-primary transition-colors line-clamp-1">
          {store.name}
        </h3>

        {/* Province */}
        {store.provinceName && (
          <p className="mt-1 text-sm text-muted line-clamp-1">
            {store.provinceName}
          </p>
        )}

        {/* Categories */}
        {store.categoryNames.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
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
        <div className="mt-3 flex items-center justify-between text-sm text-muted">
          {/* Price Range */}
          {priceLabel && <span>{priceLabel}</span>}

          {/* Opening Hours */}
          {store.openTime && store.closeTime && (
            <span>
              {store.openTime} - {store.closeTime}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
