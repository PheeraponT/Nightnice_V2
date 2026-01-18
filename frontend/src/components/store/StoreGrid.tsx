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
          "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
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
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
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
    <div className="rounded-card overflow-hidden bg-dark-lighter border border-muted/20 animate-pulse">
      <div className="aspect-video bg-muted/20" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted/20 rounded w-3/4" />
        <div className="h-4 bg-muted/20 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-muted/20 rounded-full w-16" />
          <div className="h-6 bg-muted/20 rounded-full w-12" />
        </div>
        <div className="flex justify-between">
          <div className="h-4 bg-muted/20 rounded w-12" />
          <div className="h-4 bg-muted/20 rounded w-20" />
        </div>
      </div>
    </div>
  );
}
