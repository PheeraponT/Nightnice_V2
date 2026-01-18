"use client";

import { useAds, type AdTargetingParams } from "@/hooks/useAds";
import { BannerAd } from "./BannerAd";
import { SponsoredStoreCard } from "./SponsoredStoreCard";
import { Badge } from "@/components/ui/Badge";

interface AdSectionProps {
  targeting?: AdTargetingParams;
  showBanner?: boolean;
  showSponsored?: boolean;
  sponsoredTitle?: string;
  className?: string;
}

// T108/T109: Client-side ad section for server components
export function AdSection({
  targeting,
  showBanner = true,
  showSponsored = true,
  sponsoredTitle = "ร้านสปอนเซอร์",
  className = "",
}: AdSectionProps) {
  const { data: bannerAds = [] } = useAds({
    ...targeting,
    type: "Banner",
    limit: 1,
  });
  const { data: sponsoredAds = [] } = useAds({
    ...targeting,
    type: "Sponsored",
    limit: 3,
  });

  const hasBanner = showBanner && bannerAds.length > 0;
  const hasSponsored = showSponsored && sponsoredAds.length > 0;

  if (!hasBanner && !hasSponsored) return null;

  return (
    <div className={className}>
      {/* Banner Ad */}
      {hasBanner && (
        <section className="py-6 bg-dark">
          <div className="container mx-auto px-4">
            <BannerAd ad={bannerAds[0]} />
          </div>
        </section>
      )}

      {/* Sponsored Stores */}
      {hasSponsored && (
        <section className="py-8 bg-dark border-b border-muted/10">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-semibold text-surface-light">
                {sponsoredTitle}
              </h2>
              <Badge variant="accent" size="sm">
                Sponsored
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {sponsoredAds.map((ad) => (
                <SponsoredStoreCard key={ad.id} ad={ad} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
