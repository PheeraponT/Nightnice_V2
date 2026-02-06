"use client";

import Link from "next/link";
import Image from "next/image";
import { useNearbyStores } from "@/hooks/useNearbyStores";
import { Badge } from "@/components/ui/Badge";
import { PRICE_RANGES } from "@/lib/constants";
import { resolveImageUrl } from "@/lib/utils";

interface NearbyStoresProps {
  storeSlug: string;
  hasCoordinates: boolean;
}

// T084 & T087: Nearby stores component with edge case handling
export function NearbyStores({ storeSlug, hasCoordinates }: NearbyStoresProps) {
  const { data: nearbyStores, isLoading } = useNearbyStores(
    hasCoordinates ? storeSlug : "",
    5,
    6
  );

  // T087: Handle no coordinates case
  if (!hasCoordinates) {
    return null;
  }

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className="bg-dark-lighter rounded-2xl p-6 border border-muted/20">
        <h2 className="text-lg font-semibold text-surface-light mb-4">
          ร้านใกล้เคียง
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse bg-dark rounded-xl h-32"
            />
          ))}
        </div>
      </div>
    );
  }

  // T087: Handle no nearby stores case
  if (!nearbyStores || nearbyStores.length === 0) {
    return null;
  }

  return (
    <div className="bg-dark-lighter rounded-2xl p-6 border border-muted/20">
      <h2 className="text-lg font-semibold text-surface-light mb-4">
        ร้านใกล้เคียง
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nearbyStores.map((store) => (
          <NearbyStoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}

interface NearbyStoreCardProps {
  store: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    bannerUrl: string | null;
    firstImageUrl: string | null;
    provinceName: string | null;
    categoryNames: string[];
    priceRange: number | null;
    distanceKm: number;
  };
}

function NearbyStoreCard({ store }: NearbyStoreCardProps) {
  const priceLabel = store.priceRange
    ? PRICE_RANGES.find((p) => p.value === store.priceRange)?.label
    : null;

  // Use logoUrl first, fallback to bannerUrl, then firstImageUrl
  const imageUrl = store.logoUrl || store.bannerUrl || store.firstImageUrl;

  return (
    <Link
      href={`/store/${store.slug}`}
      className="group flex items-center gap-3 p-3 bg-dark rounded-xl hover:bg-muted/10 transition-colors border border-muted/10 cursor-pointer"
    >
      {/* Logo or Banner */}
      <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={resolveImageUrl(imageUrl) || "/logo.svg"}
          alt={store.name}
          fill
          className={imageUrl ? "object-cover" : "object-contain p-2 opacity-30"}
          sizes="56px"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-surface-light truncate group-hover:text-primary transition-colors">
          {store.name}
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted mt-1">
          {store.provinceName && (
            <span className="truncate">{store.provinceName}</span>
          )}
          {priceLabel && (
            <>
              <span>•</span>
              <span>{priceLabel}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="default" size="sm">
            {store.distanceKm} กม.
          </Badge>
          {store.categoryNames.length > 0 && (
            <span className="text-xs text-muted truncate">
              {store.categoryNames[0]}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
