"use client";

import { StoreCard } from "./StoreCard";
import type { StoreListDto } from "@/lib/api";
import { cn } from "@/lib/utils";

interface StoreGridProps {
  stores: StoreListDto[];
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function StoreGrid({
  stores,
  className,
  isLoading = false,
  emptyMessage = "ไม่พบร้านที่ค้นหา",
}: StoreGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4",
          className
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <StoreCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto w-16 h-16 text-muted/40"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <p className="mt-4 text-lg text-muted">{emptyMessage}</p>
        <p className="mt-2 text-sm text-muted/70">
          ลองปรับเงื่อนไขการค้นหาใหม่
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-4",
        className
      )}
    >
      {stores.map((store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}

function StoreCardSkeleton() {
  return (
    <div className="rounded-lg sm:rounded-xl overflow-hidden bg-night-lighter border border-white/10 animate-pulse">
      <div className="relative aspect-[4/3]">
        <div className="absolute inset-0 bg-muted/20" />
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 h-4 sm:h-5 w-12 sm:w-14 bg-muted/20 rounded-full" />
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 h-4 sm:h-5 w-10 sm:w-12 bg-muted/20 rounded-full" />
        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2 sm:right-2 h-6 w-6 sm:h-7 sm:w-7 bg-muted/20 rounded-full" />
        <div className="absolute bottom-2 left-2 right-8 sm:bottom-3 sm:left-3 sm:right-10">
          <div className="h-3.5 sm:h-4 bg-muted/20 rounded w-3/4 mb-1.5 sm:mb-2" />
          <div className="h-2.5 sm:h-3 bg-muted/20 rounded w-1/2 mb-1 sm:mb-1.5" />
          <div className="flex gap-1">
            <div className="h-3.5 sm:h-4 bg-muted/20 rounded w-10 sm:w-12" />
            <div className="h-3.5 sm:h-4 bg-muted/20 rounded w-8 sm:w-10" />
          </div>
        </div>
      </div>
    </div>
  );
}
