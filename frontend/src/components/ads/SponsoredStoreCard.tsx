"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdTracking } from "@/hooks/useAdTracking";
import { Badge } from "@/components/ui/Badge";
import type { AdListDto } from "@/lib/api";

interface SponsoredStoreCardProps {
  ad: AdListDto;
}

// T103: Sponsored store card with tracking
export function SponsoredStoreCard({ ad }: SponsoredStoreCardProps) {
  const { trackImpression, trackClick } = useAdTracking();

  // Track impression when component mounts
  useEffect(() => {
    trackImpression(ad.id);
  }, [ad.id, trackImpression]);

  if (!ad.storeSlug) return null;

  const handleClick = () => {
    trackClick(ad.id);
  };

  return (
    <Link
      href={`/store/${ad.storeSlug}`}
      onClick={handleClick}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-b from-primary/5 to-transparent transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
        {/* Sponsored Badge */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="primary" size="sm">
            Sponsored
          </Badge>
        </div>

        {/* Store Image */}
        <div className="relative aspect-[3/2] overflow-hidden">
          <Image
            src={ad.storeLogoUrl || "/logo.svg"}
            alt={ad.storeName || "Sponsored Store"}
            fill
            className={ad.storeLogoUrl ? "object-cover transition-transform group-hover:scale-105" : "object-contain p-8 opacity-30 transition-transform group-hover:scale-105"}
            sizes="(max-width: 768px) 100vw, 400px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-darker via-transparent to-transparent" />
        </div>

        {/* Store Info */}
        <div className="p-4">
          <h3 className="font-semibold text-surface-light group-hover:text-primary transition-colors truncate">
            {ad.storeName || ad.title}
          </h3>
          {ad.targetUrl && (
            <p className="text-sm text-muted mt-1 truncate">
              คลิกเพื่อดูรายละเอียด
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
