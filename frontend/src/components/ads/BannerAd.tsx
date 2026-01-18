"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAdTracking } from "@/hooks/useAdTracking";
import type { AdListDto } from "@/lib/api";

interface BannerAdProps {
  ad: AdListDto;
  className?: string;
}

// T102: Banner ad component with impression tracking
export function BannerAd({ ad, className = "" }: BannerAdProps) {
  const { trackImpression, trackClick } = useAdTracking();

  // Track impression when component mounts
  useEffect(() => {
    trackImpression(ad.id);
  }, [ad.id, trackImpression]);

  if (!ad.imageUrl) return null;

  const handleClick = () => {
    trackClick(ad.id);
  };

  const content = (
    <div
      className={`relative overflow-hidden rounded-xl border border-muted/20 bg-dark-lighter ${className}`}
    >
      <div className="relative aspect-[4/1] w-full">
        <Image
          src={ad.imageUrl}
          alt={ad.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1200px"
        />
      </div>
      <div className="absolute bottom-2 right-2">
        <span className="px-2 py-0.5 text-[10px] bg-dark/80 text-muted rounded">
          โฆษณา
        </span>
      </div>
    </div>
  );

  if (ad.targetUrl) {
    return (
      <Link
        href={ad.targetUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="block hover:opacity-95 transition-opacity"
      >
        {content}
      </Link>
    );
  }

  return content;
}
